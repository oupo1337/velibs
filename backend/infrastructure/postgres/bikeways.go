package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/paulmach/orb"
	"github.com/paulmach/orb/encoding/ewkb"

	"github.com/oupo1337/velibs/backend/domain"
)

func (db *Database) InsertBikeways(ctx context.Context, bikeways domain.BikewaysGeoJSON) error {
	if _, err := db.conn.Exec(ctx, "DELETE FROM bikeways"); err != nil {
		return fmt.Errorf("tx.Exec error: %w", err)
	}

	query := `
		INSERT INTO bikeways (typology, bidirectional, status, direction, route, shape)
		VALUES ($1, $2, $3, $4, $5, ST_GeomFromEWKB($6))
	`

	batch := &pgx.Batch{}
	for i := range bikeways.Features {
		linestring := orb.LineString{}
		for _, point := range bikeways.Features[i].Geometry.Coordinates {
			linestring = append(linestring, orb.Point{point[0], point[1]})
		}

		_ = batch.Queue(query,
			bikeways.Features[i].Properties.TypologieSimple,
			bikeways.Features[i].Properties.Bidirectionnel == "Oui",
			bikeways.Features[i].Properties.Statut,
			bikeways.Features[i].Properties.SensVelo,
			bikeways.Features[i].Properties.Voie,
			ewkb.Value(linestring, 4326),
		)
	}

	results := db.conn.SendBatch(ctx, batch)
	defer results.Close()

	for range bikeways.Features {
		if _, err := results.Exec(); err != nil {
			return fmt.Errorf("results.Exec error: %w", err)
		}
	}
	return nil
}

func (db *Database) FetchBikeways(ctx context.Context) ([]byte, error) {
	query := `
		SELECT JSON_BUILD_OBJECT(
			'type', 'FeatureCollection',
			'features', json_agg(ST_AsGeoJSON(t.*)::json)
		)
		FROM (
			SELECT typology, bidirectional, status, direction, route, shape
			FROM bikeways
		) as t(typology, bidirectional, status, direction, route, shape)
	`

	var data []byte
	if err := db.conn.QueryRow(ctx, query).Scan(&data); err != nil {
		return nil, fmt.Errorf("db.conn.QueryRow error: %w", err)
	}
	return data, nil
}
