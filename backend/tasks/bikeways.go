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

	"github.com/oupo1337/velibs/backend/domain"
	"github.com/oupo1337/velibs/backend/postgres"
	"github.com/oupo1337/velibs/backend/tracing"
)

type Bikeways struct {
	url    string
	db     *postgres.Database
	client *http.Client
}

func (b *Bikeways) fetchBikeways(ctx context.Context) (domain.BikewaysGeoJSON, error) {
	ctx = httptrace.WithClientTrace(ctx, otelhttptrace.NewClientTrace(ctx))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, b.url, nil)
	if err != nil {
		return domain.BikewaysGeoJSON{}, fmt.Errorf("NewRequestWithContext error: %w", err)
	}

	response, err := b.client.Do(req)
	if err != nil {
		return domain.BikewaysGeoJSON{}, fmt.Errorf("b.client.Do error: %w", err)
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return domain.BikewaysGeoJSON{}, fmt.Errorf("io.ReadAll error: %w", err)
	}

	var data domain.BikewaysGeoJSON
	if err := json.Unmarshal(body, &data); err != nil {
		return domain.BikewaysGeoJSON{}, fmt.Errorf("json.NewDecoder().Decode error: %w", err)
	}
	return data, nil
}

func (b *Bikeways) UpdateBikeways() {
	ctx, span := tracing.Start(context.Background(), "UpdateBikeways")
	defer span.End()

	slog.InfoContext(ctx, "updating Paris bikeways")

	bikeways, err := b.fetchBikeways(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "fetchBikeways failed")
		span.RecordError(err)
		slog.Error("s.fetchBikeways error", slog.String("error", err.Error()))
		return
	}

	if err := b.db.InsertBikeways(ctx, bikeways); err != nil {
		span.SetStatus(codes.Error, "InsertBikeways failed")
		span.RecordError(err)
		slog.Error("b.db.InsertBikeways error", slog.String("error", err.Error()))
		return
	}
}

func NewBikeways(db *postgres.Database) *Bikeways {
	return &Bikeways{
		url: "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/reseau-cyclable/exports/geojson?lang=fr&timezone=Europe%2FBerlin",
		db:  db,
		client: &http.Client{
			Timeout: 1 * time.Minute,
		},
	}
}
