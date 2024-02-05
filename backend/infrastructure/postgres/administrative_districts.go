package postgres

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5"

	"github.com/oupo1337/velibs/backend/domain"
)

func (db *Database) HasAdministrativeDistricts(ctx context.Context) (bool, error) {
	query := `
		SELECT COUNT(*)
		FROM administrative_districts
	`

	var count int64
	if err := db.conn.QueryRow(ctx, query).Scan(&count); err != nil {
		return false, fmt.Errorf("db.conn.QueryRow error: %w", err)
	}
	return count != 0, nil
}

func (db *Database) GetAdministrativeDistricts(ctx context.Context, timestamp string) ([]byte, error) {
	if timestamp == "" {
		tmstp, err := db.FetchMaxTimestamp(ctx)
		if err != nil {
			return nil, fmt.Errorf("db.FetchMaxTimestamp error: %w", err)
		}
		timestamp = tmstp
	}

	query := `
		SELECT JSON_BUILD_OBJECT(
			'type', 'FeatureCollection',
			'features', JSON_AGG(ST_AsGeoJSON(t.*)::json)
		)
		FROM (
			SELECT administrative_districts.name, JSON_AGG(id), shape, SUM(statuses.mechanical), SUM(statuses.electric)
			FROM administrative_districts
			LEFT JOIN stations ON ST_Contains(administrative_districts.shape, stations.position)
			JOIN statuses ON (stations.id = statuses.station_id AND timestamp = $1)
			GROUP BY administrative_districts.name, shape
		) as t(name, ids, shape, mechanical, electric)`

	var data []byte
	if err := db.conn.QueryRow(ctx, query, timestamp).Scan(&data); err != nil {
		return nil, fmt.Errorf("db.conn.QueryRow error: %w", err)
	}
	return data, nil
}

func (db *Database) InsertAdministrativeDistricts(ctx context.Context, districts domain.DistrictsGeoJSON) error {
	query := `
		INSERT INTO administrative_districts (name, shape)
		VALUES ($1, ST_GeomFromGeoJSON($2))
	`

	batch := &pgx.Batch{}
	for i := range districts.Features {
		geojson, err := json.Marshal(&districts.Features[i].Geometry)
		if err != nil {
			return fmt.Errorf("json.Marshal error: %w", err)
		}

		_ = batch.Queue(query,
			districts.Features[i].Properties.LQu,
			string(geojson),
		)
	}

	results := db.conn.SendBatch(ctx, batch)
	defer results.Close()

	for range districts.Features {
		if _, err := results.Exec(); err != nil {
			return fmt.Errorf("results.Exec error: %w", err)
		}
	}
	return nil
}
