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

type Boroughs struct {
	url    string
	db     *postgres.Database
	client *http.Client
}

func (a *Boroughs) fetchBoroughs(ctx context.Context) (domain.BoroughsGeoJSON, error) {
	ctx = httptrace.WithClientTrace(ctx, otelhttptrace.NewClientTrace(ctx))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, a.url, nil)
	if err != nil {
		return domain.BoroughsGeoJSON{}, fmt.Errorf("NewRequestWithContext error: %w", err)
	}

	response, err := a.client.Do(req)
	if err != nil {
		return domain.BoroughsGeoJSON{}, fmt.Errorf("b.client.Do error: %w", err)
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return domain.BoroughsGeoJSON{}, fmt.Errorf("io.ReadAll error: %w", err)
	}

	var data domain.BoroughsGeoJSON
	if err := json.Unmarshal(body, &data); err != nil {
		return domain.BoroughsGeoJSON{}, fmt.Errorf("json.NewDecoder().Decode error: %w", err)
	}
	return data, nil
}

func (a *Boroughs) UpdateBoroughs() {
	ctx, span := tracing.Start(context.Background(), "UpdateBoroughs")
	defer span.End()

	slog.InfoContext(ctx, "updating Paris boroughs")

	hasBoroughs, err := a.db.HasBoroughs(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "db.HasBoroughs failed")
		span.RecordError(err)
		slog.ErrorContext(ctx, "db.HasBoroughs error", slog.String("error", err.Error()))
		return
	}

	if hasBoroughs {
		slog.InfoContext(ctx, "database already contains Paris boroughs")
		return
	}

	boroughs, err := a.fetchBoroughs(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "a.fetchBoroughs failed")
		span.RecordError(err)
		slog.ErrorContext(ctx, "a.fetchBoroughs error", slog.String("error", err.Error()))
		return
	}

	if err := a.db.InsertBoroughs(ctx, boroughs); err != nil {
		span.SetStatus(codes.Error, "db.InsertBoroughs failed")
		span.RecordError(err)
		slog.ErrorContext(ctx, "db.InsertBoroughs error", slog.String("error", err.Error()))
		return
	}
}

func NewBoroughs(db *postgres.Database) *Boroughs {
	return &Boroughs{
		url: "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/arrondissements/exports/geojson?lang=fr&timezone=Europe%2FBerlin",
		db:  db,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}
