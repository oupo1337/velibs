package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/paulmach/orb/encoding/ewkb"

	"github.com/oupo1337/velibs/backend/domain"
)

func (db *Database) InsertBikeLanes(ctx context.Context, lanes domain.BikeLanesGeoJSON) error {
	tx, err := db.conn.Begin(ctx)
	if err != nil {
		return fmt.Errorf("db.conn.Begin error: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	deleteQuery := `DELETE FROM bikelanes`

	if _, err := tx.Exec(ctx, deleteQuery); err != nil {
		return fmt.Errorf("tx.Exec error: %w", err)
	}

	query := `
		INSERT INTO bikelanes (
			OSMID,
			name,
			amenagement,
			cote_amenagement,
			sens,
			surface,
			arrondissement,
			bois,
			coronapiste,
			amenagement_temporaire,
			infrastructure_bidirection,
			voie_a_sens_unique,
			position_amenagement,
			vitesse_maximale_autorisee,
			shape
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, ST_GeomFromEWKB($15))
	`

	for _, feature := range lanes.Features {
		_, err := tx.Exec(ctx, query,
			feature.Properties.OsmId,
			feature.Properties.Nom,
			feature.Properties.Amenagement,
			feature.Properties.CoteAmenagement,
			feature.Properties.Sens,
			feature.Properties.Surface,
			feature.Properties.Arrondissement,
			strings.ToLower(feature.Properties.Bois) == "oui",
			strings.ToLower(feature.Properties.Coronapiste) == "oui",
			strings.ToLower(feature.Properties.AmenagementTemporaire) == "oui",
			strings.ToLower(feature.Properties.InfrastructureBidirection) == "oui",
			strings.ToLower(feature.Properties.VoieASensUnique) == "oui",
			feature.Properties.PositionAmenagement,
			feature.Properties.VitesseMaximaleAutorisee,
			ewkb.Value(feature.Geometry.Geometry(), 4326),
		)
		if err != nil {
			fmt.Printf("%+v\n", feature.Properties)
			return fmt.Errorf("tx.Exec error: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("tx.Commit error: %w", err)
	}
	return nil
}

func (db *Database) FetchBikeLanes(ctx context.Context) ([]byte, error) {
	query := `
		SELECT JSON_BUILD_OBJECT(
			'type', 'FeatureCollection',
			'features', json_agg(ST_AsGeoJSON(t.*)::json)
		)
		FROM (
			SELECT
				OSMID,
				name,
				amenagement,
				cote_amenagement,
				sens,
				surface,
				arrondissement,
				bois,
				coronapiste,
				amenagement_temporaire,
				infrastructure_bidirection,
				voie_a_sens_unique,
				position_amenagement,
				vitesse_maximale_autorisee,
				shape
			FROM bikelanes
		) as t(
			OSMID,
			name,
			amenagement,
			cote_amenagement,
			sens,
			surface,
			arrondissement,
			bois,
			coronapiste,
			amenagement_temporaire,
			infrastructure_bidirection,
			voie_a_sens_unique,
			position_amenagement,
			vitesse_maximale_autorisee,
			shape
		)
	`

	var data []byte
	if err := db.conn.QueryRow(ctx, query).Scan(&data); err != nil {
		return nil, fmt.Errorf("db.conn.QueryRow error: %w", err)
	}
	return data, nil
}
