package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/paulmach/orb"
	"github.com/paulmach/orb/encoding/ewkb"

	"github.com/oupo1337/velibs/backend/domain"
)

func (db *Database) InsertFreeFloatingBikes(ctx context.Context, bikes []domain.FreeFloatingBike) error {
	timestamp := time.Now().Truncate(10 * time.Minute)

	query := `
		INSERT INTO free_floating_bikes (timestamp, bike_id, position, is_reserved, is_disabled, current_range_meters, vehicle_type_id, last_reported, vehicle_type)
		VALUES ($1, $2, ST_GeomFromEWKB($3), $4, $5, $6, $7, $8, $9)
	`

	batch := &pgx.Batch{}
	for _, bike := range bikes {
		lastReported := time.Unix(bike.LastReported, 0)
		_ = batch.Queue(query,
			timestamp,
			bike.ID,
			ewkb.Value(orb.Point{bike.Longitude, bike.Latitude}, 4326),
			bike.IsReserved,
			bike.IsDisabled,
			bike.CurrentRangeMeters,
			bike.VehicleTypeId,
			lastReported,
			bike.VehicleType,
		)
	}

	results := db.conn.SendBatch(ctx, batch)
	defer func() {
		_ = results.Close()
	}()

	for range bikes {
		if _, err := results.Exec(); err != nil {
			return fmt.Errorf("results.Exec error: %w", err)
		}
	}
	return nil
}

func (db *Database) maxFreeFloatingBikesTimestamp(ctx context.Context) (string, error) {
	query := `
		SELECT MAX(timestamp)
		FROM statuses
	`

	var timestamp time.Time
	err := db.conn.QueryRow(ctx, query).Scan(&timestamp)
	if err != nil {
		return "", fmt.Errorf("conn.Query error: %w", err)
	}
	return timestamp.Format(time.RFC3339), nil
}

func (db *Database) FetchFreeFloatingBikes(ctx context.Context, timestamp string) ([]byte, error) {
	if timestamp == "" {
		tmstp, err := db.maxFreeFloatingBikesTimestamp(ctx)
		if err != nil {
			return nil, fmt.Errorf("db.maxFreeFloatingBikesTimestamp error: %w", err)
		}
		timestamp = tmstp
	}

	query := `
		SELECT json_build_object(
			'type', 'FeatureCollection',
			'features', json_agg(ST_AsGeoJSON(t.*)::json)
		)
		FROM (
			SELECT bike_id, position, is_reserved, is_disabled, current_range_meters, vehicle_type_id, last_reported, vehicle_type
			FROM free_floating_bikes
			WHERE timestamp = $1
		) as t(bike_id, position, is_reserved, is_disabled, current_range_meters, vehicle_type_id, last_reported, vehicle_type)
	`

	var data []byte
	if err := db.conn.QueryRow(ctx, query, timestamp).Scan(&data); err != nil {
		return nil, fmt.Errorf("db.conn.QueryRow error: %w", err)
	}
	return data, nil
}
