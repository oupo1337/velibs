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
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel/codes"

	"github.com/oupo1337/velibs/backend/domain"
	"github.com/oupo1337/velibs/backend/postgres"
	"github.com/oupo1337/velibs/backend/tracing"
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

	var data StationStatusResponse
	if err := json.NewDecoder(response.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf(" json.NewDecoder().Decode error: %w", err)
	}
	return data.Data.StationsStatuses, nil
}

func (s *Statuses) UpdateStatuses() {
	ctx, span := tracing.Start(context.Background(), "UpdateStatuses")
	defer span.End()

	slog.InfoContext(ctx, "UpdateStatuses running")

	statuses, err := s.fetchStationsStatuses(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "fetchStationsStatuses failed")
		span.RecordError(err)
		slog.Error("s.fetchStationsStatuses error", slog.String("error", err.Error()))
		return
	}

	if err := s.db.InsertStatuses(ctx, statuses); err != nil {
		span.SetStatus(codes.Error, "InsertStatuses failed")
		span.RecordError(err)
		slog.Error("s.db.InsertStatuses error", slog.String("error", err.Error()))
		return
	}
}

func NewStatuses(url string, db *postgres.Database) *Statuses {
	transport := otelhttp.NewTransport(
		http.DefaultTransport,
		otelhttp.WithClientTrace(func(ctx context.Context) *httptrace.ClientTrace {
			return otelhttptrace.NewClientTrace(ctx)
		}),
	)

	return &Statuses{
		url: url,
		db:  db,
		client: &http.Client{
			Timeout:   10 * time.Second,
			Transport: transport,
		},
	}
}
