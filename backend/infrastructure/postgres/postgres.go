package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/exaring/otelpgx"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/paulmach/orb"
	"github.com/paulmach/orb/encoding/ewkb"

	"github.com/oupo1337/velibs/backend/domain"
)

type Configuration struct {
	Username string
	Password string
	Address  string
	Name     string
}

type Database struct {
	conn *pgxpool.Pool
}

func (db *Database) InsertStations(ctx context.Context, stationsInformation []domain.StationInformation) error {
	query := `
		INSERT INTO stations (id, name, capacity, position)
		VALUES ($1, $2, $3, ST_GeomFromEWKB($4))
		ON CONFLICT DO NOTHING
	`

	batch := &pgx.Batch{}
	for i := range stationsInformation {
		_ = batch.Queue(query,
			stationsInformation[i].StationID,
			stationsInformation[i].Name,
			stationsInformation[i].Capacity,
			ewkb.Value(orb.Point{stationsInformation[i].Longitude, stationsInformation[i].Latitude}, 4326),
		)
	}

	results := db.conn.SendBatch(ctx, batch)
	defer results.Close()

	for range stationsInformation {
		if _, err := results.Exec(); err != nil {
			return fmt.Errorf("results.Exec error: %w", err)
		}
	}
	return nil
}

func (db *Database) InsertStatuses(ctx context.Context, statuses []domain.StationStatus) error {
	timestamp := time.Now().Truncate(time.Minute)

	_, err := db.conn.CopyFrom(ctx,
		pgx.Identifier{"statuses"},
		[]string{"timestamp", "station_id", "mechanical", "electric"},
		pgx.CopyFromSlice(len(statuses), func(i int) ([]any, error) {
			mechanical := 0
			electric := 0

			for _, available := range statuses[i].NumBikesAvailableTypes {
				if available.Mechanical != nil {
					mechanical = *available.Mechanical
				}

				if available.Ebike != nil {
					electric = *available.Ebike
				}
			}

			return []any{
				timestamp,
				statuses[i].StationID,
				mechanical,
				electric,
			}, nil
		}),
	)
	if err != nil {
		return fmt.Errorf("db.conn.CopyFrom error")
	}
	return nil
}

func (db *Database) GetMinMaxTimestamps(ctx context.Context) (time.Time, time.Time, error) {
	query := `
		SELECT MIN(timestamp), MAX(timestamp)
		FROM statuses;
	`

	var minTimestamp, maxTimestamp time.Time
	if err := db.conn.QueryRow(ctx, query).Scan(&minTimestamp, &maxTimestamp); err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("conn.QueryRow.Scan error: %w", err)
	}
	return minTimestamp, maxTimestamp, nil
}

func (db *Database) FetchStationsStatuses(ctx context.Context, timestamp string) ([]byte, error) {
	if timestamp == "" {
		tmstp, err := db.FetchMaxTimestamp(ctx)
		if err != nil {
			return nil, fmt.Errorf("db.FetchMaxTimestamp error: %w", err)
		}
		timestamp = tmstp
	}

	query := `
		SELECT json_build_object(
			'type', 'FeatureCollection',
			'features', json_agg(ST_AsGeoJSON(t.*)::json)
		)
		FROM (
			SELECT stations.id, name, capacity, mechanical, electric, position
			FROM statuses
			JOIN stations ON (id = station_id)
			WHERE timestamp = $1
		) as t(station_id, name, capacity, mechanical, electric, position)
	`

	var data []byte
	if err := db.conn.QueryRow(ctx, query, timestamp).Scan(&data); err != nil {
		return nil, fmt.Errorf("db.conn.QueryRow error: %w", err)
	}
	return data, nil
}

func (db *Database) FetchMaxTimestamp(ctx context.Context) (string, error) {
	query := `SELECT MAX(timestamp) FROM statuses`

	var timestamp time.Time
	err := db.conn.QueryRow(ctx, query).Scan(&timestamp)
	if err != nil {
		return "", fmt.Errorf("conn.Query error: %w", err)
	}
	return timestamp.Format(time.RFC3339), nil
}

func (db *Database) GetStationTimeSeries(ctx context.Context, stationID string) (domain.StationTimeSeries, error) {
	var ID int64
	var name string
	var capacity int64
	if err := db.conn.QueryRow(ctx, `SELECT id, name, capacity FROM stations WHERE id = $1`, stationID).
		Scan(&ID, &name, &capacity); err != nil {
		return domain.StationTimeSeries{}, fmt.Errorf("conn.QueryRow.Scan error: %w", err)
	}

	query := `
			SELECT timestamp, mechanical, electric
			FROM statuses
			WHERE station_id = $1
				AND timestamp > NOW() - interval '1 week'
			ORDER BY timestamp;`

	rows, err := db.conn.Query(ctx, query, stationID)
	if err != nil {
		return domain.StationTimeSeries{}, fmt.Errorf("conn.Query error: %w", err)
	}
	defer rows.Close()

	var ts []domain.TimeSeries
	for rows.Next() {
		var current domain.TimeSeries
		if err := rows.Scan(&current.Date, &current.Mechanical, &current.Electric); err != nil {
			return domain.StationTimeSeries{}, fmt.Errorf("rows.Scan error: %w", err)
		}
		ts = append(ts, current)
	}

	return domain.StationTimeSeries{
		ID:         ID,
		Name:       name,
		Capacity:   capacity,
		TimeSeries: ts,
	}, nil
}

func (db *Database) GetStationDistribution(ctx context.Context, stationID string) ([]domain.DistributionData, error) {
	query := `
		SELECT
			EXTRACT(HOUR FROM timestamp),
			EXTRACT(MINUTE FROM timestamp),
			AVG(mechanical) AS mechanical,
			AVG(electric) AS electric
		FROM statuses
		WHERE station_id = $1
		GROUP BY EXTRACT(HOUR FROM timestamp), EXTRACT(MINUTE FROM timestamp)
		ORDER BY EXTRACT(HOUR FROM timestamp), EXTRACT(MINUTE FROM timestamp)`

	rows, err := db.conn.Query(ctx, query, stationID)
	if err != nil {
		return nil, fmt.Errorf("conn.Query error: %w", err)
	}
	defer rows.Close()

	var distribution []domain.DistributionData
	for rows.Next() {
		var hour int
		var minute int
		var data domain.DistributionData
		if err := rows.Scan(&hour, &minute, &data.Mechanical, &data.Electric); err != nil {
			return nil, fmt.Errorf("rows.Scan error: %w", err)
		}
		data.Time = fmt.Sprintf("%02d:%02d", hour, minute)
		distribution = append(distribution, data)
	}
	return distribution, nil
}

func New(conf Configuration) (*Database, error) {
	connString := fmt.Sprintf("postgres://%s:%s@%s/%s", conf.Username, conf.Password, conf.Address, conf.Name)

	cfg, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("create connection pool error: %w", err)
	}
	cfg.ConnConfig.Tracer = otelpgx.NewTracer()

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	conn, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("connect to database error: %w", err)
	}

	if err := conn.Ping(ctx); err != nil {
		return nil, fmt.Errorf("conn.Ping error: %w", err)
	}

	return &Database{
		conn: conn,
	}, nil
}
