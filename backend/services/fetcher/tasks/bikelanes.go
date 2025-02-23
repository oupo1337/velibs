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

	"go.opentelemetry.io/contrib/instrumentation/net/http/httptrace/otelhttptrace"
	"go.opentelemetry.io/otel/codes"

	"github.com/oupo1337/velibs/backend/common/tracing"
	"github.com/oupo1337/velibs/backend/domain"
	"github.com/oupo1337/velibs/backend/infrastructure/postgres"
)

type BikeLanes struct {
	url    string
	db     *postgres.Database
	client *http.Client
}

func (b *BikeLanes) fetchBikeLanes(ctx context.Context) (domain.BikeLanesGeoJSON, error) {
	ctx = httptrace.WithClientTrace(ctx, otelhttptrace.NewClientTrace(ctx))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, b.url, nil)
	if err != nil {
		return domain.BikeLanesGeoJSON{}, fmt.Errorf("NewRequestWithContext error: %w", err)
	}

	response, err := b.client.Do(req)
	if err != nil {
		return domain.BikeLanesGeoJSON{}, fmt.Errorf("b.client.Do error: %w", err)
	}
	defer func() {
		if err := response.Body.Close(); err != nil {
			slog.ErrorContext(ctx, "response.Body.Close error", slog.String("error", err.Error()))
		}
	}()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return domain.BikeLanesGeoJSON{}, fmt.Errorf("io.ReadAll error: %w", err)
	}

	var data domain.BikeLanesGeoJSON
	if err := json.Unmarshal(body, &data); err != nil {
		return domain.BikeLanesGeoJSON{}, fmt.Errorf("json.NewDecoder().Decode error: %w", err)
	}
	return data, nil
}

func (b *BikeLanes) UpdateBikeLanes(ctx context.Context) error {
	slog.InfoContext(ctx, "updating Paris bike lanes")

	bikeLanes, err := b.fetchBikeLanes(ctx)
	if err != nil {
		return fmt.Errorf("b.fetchBikeLanes error: %w", err)
	}

	if err := b.db.InsertBikeLanes(ctx, bikeLanes); err != nil {
		return fmt.Errorf("b.db.InsertBikeLanes error: %w", err)
	}
	return nil
}

func (b *BikeLanes) Run() {
	ctx, span := tracing.Start(context.Background(), "update.BikeLanes")
	defer span.End()

	if err := b.UpdateBikeLanes(ctx); err != nil {
		span.SetStatus(codes.Error, "UpdateBikeLanes failed")
		span.RecordError(err)
		slog.ErrorContext(ctx, "UpdateBikeLanes failed", slog.String("error", err.Error()))
	}
}

func NewBikeLanes(db *postgres.Database) *BikeLanes {
	return &BikeLanes{
		url: "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/amenagements-cyclables/exports/geojson?lang=fr&timezone=Europe%2FBerlin",
		db:  db,
		client: &http.Client{
			Timeout: 1 * time.Minute,
		},
	}
}
