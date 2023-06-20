package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"

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
		INSERT INTO stations (id, capacity, latitude, longitude, name)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT DO NOTHING`

	for _, station := range stationsInformation {
		_, err := db.conn.Exec(ctx, query, station.StationID, station.Capacity, station.Latitude, station.Longitude, station.Name)
		if err != nil {
			return fmt.Errorf("conn.Exec error: %w", err)
		}
	}
	return nil
}

func (db *Database) InsertStatuses(ctx context.Context, statuses []domain.StationStatus) error {
	query := `
		INSERT INTO statuses (timestamp, station_id, mechanical, electric)
		VALUES (DATE_TRUNC('minute', $1::timestamp), $2, $3, $4)`

	now := time.Now()
	for _, status := range statuses {
		mechanical := 0
		electric := 0

		for _, available := range status.NumBikesAvailableTypes {
			if available.Mechanical != nil {
				mechanical = *available.Mechanical
			}

			if available.Ebike != nil {
				electric = *available.Ebike
			}
		}

		_, err := db.conn.Exec(ctx, query, now, status.StationID, mechanical, electric)
		if err != nil {
			return fmt.Errorf("conn.Exec error: %w", err)
		}
	}
	return nil
}

func (db *Database) ListTimestamps(ctx context.Context) ([]time.Time, error) {
	query := `
		SELECT DISTINCT timestamp
		FROM statuses
		ORDER BY timestamp;`

	rows, err := db.conn.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("conn.Query error: %w", err)
	}
	defer func() {
		_ = rows.Close
	}()

	var timestamps []time.Time
	for rows.Next() {
		var timestamp time.Time
		if err := rows.Scan(&timestamp); err != nil {
			return nil, fmt.Errorf("rows.Scan error: %w", err)
		}
		timestamps = append(timestamps, timestamp)
	}
	return timestamps, nil
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

func New(conf Configuration) (*Database, error) {
	url := fmt.Sprintf("postgres://%s:%s@%s/%s", conf.Username, conf.Password, conf.Address, conf.Name)

	conn, err := pgxpool.Connect(context.Background(), url)
	if err != nil {
		return nil, fmt.Errorf("pgx.Connect: %w", err)
	}

	return &Database{
		conn: conn,
	}, nil
}
