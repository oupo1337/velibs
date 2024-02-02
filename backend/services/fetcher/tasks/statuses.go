package tasks

import (
	"context"
	"encoding/json"
	"fmt"
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

type Statuses struct {
	url    string
	db     *postgres.Database
	client *http.Client
}

type StationStatusResponse struct {
	Data struct {
		StationsStatuses []domain.StationStatus `json:"stations"`
	} `json:"data"`
	LastUpdatedOther int64 `json:"lastUpdatedOther"`
	TTL              int64 `json:"ttl"`
}

func (s *Statuses) fetchStationsStatuses(ctx context.Context) ([]domain.StationStatus, error) {
	ctx = httptrace.WithClientTrace(ctx, otelhttptrace.NewClientTrace(ctx))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, s.url, nil)
	if err != nil {
		return nil, fmt.Errorf("http.NewRequestWithContext error: %w", err)
	}

	response, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("client.Do error: %w", err)
	}
	defer func() {
		if err := response.Body.Close(); err != nil {
			slog.ErrorContext(ctx, "response.Body.Close error", slog.String("error", err.Error()))
		}
	}()

	var data StationStatusResponse
	if err := json.NewDecoder(response.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf(" json.NewDecoder().Decode error: %w", err)
	}
	return data.Data.StationsStatuses, nil
}

func (s *Statuses) UpdateStatuses(ctx context.Context) error {
	slog.InfoContext(ctx, "fetching velib stations statuses")

	statuses, err := s.fetchStationsStatuses(ctx)
	if err != nil {
		return fmt.Errorf("s.fetchStationsStatuses error: %w", err)
	}

	if err := s.db.InsertStatuses(ctx, statuses); err != nil {
		return fmt.Errorf("db.InsertStatuses error: %w", err)
	}
	return nil
}

func (s *Statuses) Run() {
	ctx, span := tracing.Start(context.Background(), "update.Statuses")
	defer span.End()

	if err := s.UpdateStatuses(ctx); err != nil {
		span.SetStatus(codes.Error, "updateStatuses failed")
		span.RecordError(err)
		slog.ErrorContext(ctx, "updateStatuses failed", slog.String("error", err.Error()))
	}
}

func NewStatuses(db *postgres.Database) *Statuses {
	return &Statuses{
		url: "https://velib-metropole-opendata.smovengo.cloud/opendata/Velib_Metropole/station_status.json",
		db:  db,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}
