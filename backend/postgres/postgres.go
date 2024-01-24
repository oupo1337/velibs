package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/exaring/otelpgx"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

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
	_, err := db.conn.CopyFrom(ctx,
		pgx.Identifier{"stations"},
		[]string{"id", "capacity", "latitude", "longitude", "name"},
		pgx.CopyFromSlice(len(stationsInformation), func(i int) ([]any, error) {
			return []any{
				stationsInformation[i].StationID,
				stationsInformation[i].Capacity,
				stationsInformation[i].Latitude,
				stationsInformation[i].Longitude,
				stationsInformation[i].Name,
			}, nil
		}),
	)
	if err != nil {
		return fmt.Errorf("db.conn.CopyFrom error")
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

func (db *Database) FetchTimestamp(ctx context.Context, timestamp string) ([]domain.Station, error) {
	if timestamp == "" {
		return db.FetchMaxTimestamp(ctx)
	}

	query := `
		SELECT timestamp, id, name, capacity, latitude, longitude, mechanical, electric
		FROM statuses
		JOIN stations ON (id = station_id)
	  	WHERE timestamp = $1`

	rows, err := db.conn.Query(ctx, query, timestamp)
	if err != nil {
		return nil, fmt.Errorf("conn.Query error: %w", err)
	}
	defer func() {
		_ = rows.Close
	}()

	var stations []domain.Station
	for rows.Next() {
		var station domain.Station

		if err := rows.Scan(&station.Timestamp,
			&station.ID,
			&station.Name,
			&station.Capacity,
			&station.Latitude,
			&station.Longitude,
			&station.Mechanical,
			&station.Electric); err != nil {
			return nil, fmt.Errorf("rows.Scan error: %w", err)
		}
		stations = append(stations, station)
	}
	return stations, nil
}

func (db *Database) FetchMaxTimestamp(ctx context.Context) ([]domain.Station, error) {
	query := `
		WITH 
			max_timestamp AS (SELECT MAX(timestamp) FROM statuses)
		SELECT timestamp, id, name, capacity, latitude, longitude, mechanical, electric
		FROM statuses
		JOIN stations ON (id = station_id)
		WHERE timestamp = (SELECT max FROM max_timestamp)`

	rows, err := db.conn.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("conn.Query error: %w", err)
	}
	defer func() {
		_ = rows.Close
	}()

	var stations []domain.Station
	for rows.Next() {
		var station domain.Station

		if err := rows.Scan(&station.Timestamp,
			&station.ID,
			&station.Name,
			&station.Capacity,
			&station.Latitude,
			&station.Longitude,
			&station.Mechanical,
			&station.Electric); err != nil {
			return nil, fmt.Errorf("rows.Scan error: %w", err)
		}
		stations = append(stations, station)
	}
	return stations, nil
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
	defer func() {
		_ = rows.Close
	}()

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
	defer func() {
		_ = rows.Close
	}()

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

func (db *Database) InsertBikeWays(ctx context.Context, ways []domain.BikeWay) error {
	query := `
		INSERT INTO bike_ways (typology, bidirectional, speed_regime, direction, route, arrondissement, forest, length, length_kilometers, position, forbidden_circulation, piste, bus_lane, type_continuity, network, date, geo_shape)
		VALUES (@typology, @bidirectional, @speed_regime, @direction, @route, @arrondissement, @forest, @length, @length_kilometers, @position, @forbidden_circulation, @piste, @bus_lane, @type_continuity, @network, @date, @geo_shape)
	`

	for _, way := range ways {
		if way.GeoShape == nil {
			continue
		}

		var value *time.Time
		date, err := time.Parse(time.DateOnly, way.Date)
		if err == nil {
			value = &date
		}

		args := pgx.NamedArgs{
			"typology":              way.Typology,
			"bidirectional":         way.Bidirectional == "Oui",
			"speed_regime":          way.SpeedRegime,
			"direction":             way.Direction,
			"route":                 way.Route,
			"arrondissement":        way.Arrondissement,
			"forest":                way.Forest == "Oui",
			"length":                way.Length,
			"length_kilometers":     way.LengthKilometers,
			"position":              way.Position,
			"forbidden_circulation": way.ForbiddenCirculation,
			"piste":                 way.Piste,
			"bus_lane":              way.BusLane,
			"type_continuity":       way.TypeContinuity,
			"network":               way.Network,
			"date":                  value,
			"geo_shape":             way.GeoShape,
		}

		if _, err := db.conn.Exec(ctx, query, args); err != nil {
			return fmt.Errorf("conn.Exec error: %w", err)
		}
	}
	return nil
}

func (db *Database) FetchBikeWays(ctx context.Context) ([]string, error) {
	query := `
		SELECT geo_shape FROM bike_ways
	`

	rows, err := db.conn.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("conn.Query error: %w", err)
	}
	defer func() {
		_ = rows.Close
	}()

	var ways []string
	for rows.Next() {
		var way string

		if err := rows.Scan(&way); err != nil {
			return nil, fmt.Errorf("rows.Scan error: %w", err)
		}
		ways = append(ways, way)
	}
	return ways, nil
}

func New(conf Configuration) (*Database, error) {
	connString := fmt.Sprintf("postgres://%s:%s@%s/%s", conf.Username, conf.Password, conf.Address, conf.Name)

	cfg, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("create connection pool error: %w", err)
	}
	cfg.ConnConfig.Tracer = otelpgx.NewTracer()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
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
