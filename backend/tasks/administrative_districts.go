package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptrace"
	"time"

	"github.com/oupo1337/velibs/backend/domain"
	"github.com/oupo1337/velibs/backend/postgres"
	"github.com/oupo1337/velibs/backend/tracing"
	"go.opentelemetry.io/contrib/instrumentation/net/http/httptrace/otelhttptrace"
	"go.opentelemetry.io/otel/codes"
)

type AdministrativeDistricts struct {
	url    string
	db     *postgres.Database
	client *http.Client
}

func (a *AdministrativeDistricts) fetchAdministrativeDistricts(ctx context.Context) (domain.DistrictsGeoJSON, error) {
	ctx = httptrace.WithClientTrace(ctx, otelhttptrace.NewClientTrace(ctx))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, a.url, nil)
	if err != nil {
		return domain.DistrictsGeoJSON{}, fmt.Errorf("NewRequestWithContext error: %w", err)
	}

	response, err := a.client.Do(req)
	if err != nil {
		return domain.DistrictsGeoJSON{}, fmt.Errorf("b.client.Do error: %w", err)
	}
	defer func() {
		if err := response.Body.Close(); err != nil {
			slog.Error("response.Body.Close error", slog.String("error", err.Error()))
		}
	}()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return domain.DistrictsGeoJSON{}, fmt.Errorf("io.ReadAll error: %w", err)
	}

	var data domain.DistrictsGeoJSON
	if err := json.Unmarshal(body, &data); err != nil {
		return domain.DistrictsGeoJSON{}, fmt.Errorf("json.NewDecoder().Decode error: %w", err)
	}
	return data, nil
}

func (a *AdministrativeDistricts) updateAdministrativeDistricts(ctx context.Context) error {
	slog.InfoContext(ctx, "updating Paris administrative districts")

	hasDistricts, err := a.db.HasAdministrativeDistricts(ctx)
	if err != nil {
		return fmt.Errorf("db.HasAdministrativeDistricts failed: %w", err)
	}

	if hasDistricts {
		slog.InfoContext(ctx, "database already contains Paris administrative districts")
		return nil
	}

	districts, err := a.fetchAdministrativeDistricts(ctx)
	if err != nil {
		return fmt.Errorf("a.fetchAdministrativeDistricts failed: %w", err)

	}

	if err := a.db.InsertAdministrativeDistricts(ctx, districts); err != nil {
		return fmt.Errorf("db.InsertAdministrativeDistricts failed: %w", err)
	}
	return nil
}

func (a *AdministrativeDistricts) Run() {
	ctx, span := tracing.Start(context.Background(), "update.AdministrativeDistricts")
	defer span.End()

	if err := a.updateAdministrativeDistricts(ctx); err != nil {
		span.SetStatus(codes.Error, "updateAdministrativeDistricts failed")
		span.RecordError(err)
		slog.ErrorContext(ctx, "updateAdministrativeDistricts failed", slog.String("error", err.Error()))
	}
}

func NewAdministrativeDistricts(db *postgres.Database) *AdministrativeDistricts {
	return &AdministrativeDistricts{
		url: "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/quartier_paris/exports/geojson?lang=fr&timezone=Europe%2FBerlin",
		db:  db,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}
