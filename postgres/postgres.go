package postgres

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5"
	"github.com/oupo1337/velibs/domain"
	"time"
)

type Configuration struct {
	Username string
	Password string
	Address  string
	Name     string
}

type Database struct {
	conn *pgx.Conn
}

func (db *Database) InsertStations(ctx context.Context, stationsInformation []domain.StationInformation) error {
	query := `INSERT INTO stations (id, capacity, latitude, longitude, name) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`

	for _, station := range stationsInformation {
		_, err := db.conn.Exec(ctx, query, station.StationID, station.Capacity, station.Latitude, station.Longitude, station.Name)
		if err != nil {
			return fmt.Errorf("conn.Exec error: %w", err)
		}
	}
	return nil
}

func (db *Database) InsertStatuses(ctx context.Context, statuses []domain.StationStatus) error {
	query := `INSERT INTO statuses (timestamp, station_id, mechanical, electric) VALUES ($1, $2, $3, $4)`

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

func (db *Database) FetchTimestamp(ctx context.Context) ([]domain.Station, error) {
	query := `WITH 
			max_timestamp AS (SELECT MAX(timestamp) FROM statuses)
		SELECT timestamp, id, name, latitude, longitude, mechanical, electric
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

func New(conf Configuration) (*Database, error) {
	url := fmt.Sprintf("postgres://%s:%s@%s/%s", conf.Username, conf.Password, conf.Address, conf.Name)

	conn, err := pgx.Connect(context.Background(), url)
	if err != nil {
		return nil, fmt.Errorf("pgx.Connect: %w", err)
	}

	return &Database{
		conn: conn,
	}, nil
}
