package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/oupo1337/velibs/backend/domain"
)

func (db *Database) HasBoroughs(ctx context.Context) (bool, error) {
	query := `
		SELECT COUNT(*)
		FROM boroughs
	`

	var count int64
	if err := db.conn.QueryRow(ctx, query).Scan(&count); err != nil {
		return false, fmt.Errorf("db.conn.QueryRow error: %w", err)
	}
	return count != 0, nil
}

func (db *Database) GetBoroughs(ctx context.Context, timestamp string) ([]byte, error) {
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
			SELECT boroughs.name, boroughs.label, shape, SUM(statuses.mechanical), SUM(statuses.electric)
			FROM boroughs
			LEFT JOIN stations ON ST_Contains(boroughs.shape, stations.position)
			JOIN statuses ON (stations.id = statuses.station_id AND timestamp = $1)
			GROUP BY boroughs.name, boroughs.label, shape
		) as t(name, label, shape, mechanical, electric)`

	var data []byte
	if err := db.conn.QueryRow(ctx, query, timestamp).Scan(&data); err != nil {
		return nil, fmt.Errorf("db.conn.QueryRow error: %w", err)
	}
	return data, nil
}

func (db *Database) InsertBoroughs(ctx context.Context, districts domain.BoroughsGeoJSON) error {
	query := `
		INSERT INTO boroughs (name, label, shape)
		VALUES ($1, $2, ST_GeomFromGeoJSON($3))
	`

	batch := &pgx.Batch{}
	for i := range districts.Features {
		geojson, err := json.Marshal(&districts.Features[i].Geometry)
		if err != nil {
			return fmt.Errorf("json.Marshal error: %w", err)
		}

		_ = batch.Queue(query,
			strings.ReplaceAll(districts.Features[i].Properties.LAr, "Ardt", "Arrondissement"),
			districts.Features[i].Properties.LAroff,
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
