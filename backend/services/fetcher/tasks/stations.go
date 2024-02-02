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

type Stations struct {
	url    string
	db     *postgres.Database
	client *http.Client
}

type StationInformationResponse struct {
	Data struct {
		StationsInformation []domain.StationInformation `json:"stations"`
	} `json:"data"`
	LastUpdatedOther int64 `json:"lastUpdatedOther"`
	TTL              int64 `json:"ttl"`
}

func (s *Stations) fetchStationsInformation(ctx context.Context) ([]domain.StationInformation, error) {
	ctx = httptrace.WithClientTrace(ctx, otelhttptrace.NewClientTrace(ctx))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, s.url, nil)
	if err != nil {
		return nil, err
	}

	response, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err := response.Body.Close(); err != nil {
			slog.ErrorContext(ctx, "response.Body.Close error", slog.String("error", err.Error()))
		}
	}()

	var data StationInformationResponse
	if err := json.NewDecoder(response.Body).Decode(&data); err != nil {
		return nil, err
	}
	return data.Data.StationsInformation, nil
}

func (s *Stations) UpdateStations(ctx context.Context) error {
	slog.InfoContext(ctx, "updating velib stations list")

	stations, err := s.fetchStationsInformation(ctx)
	if err != nil {
		return fmt.Errorf("fetchStationsInformation error: %w", err)
	}

	if err := s.db.InsertStations(ctx, stations); err != nil {
		return fmt.Errorf("db.InsertStations error: %w", err)
	}
	return nil
}

func (s *Stations) Run() {
	ctx, span := tracing.Start(context.Background(), "update.Stations")
	defer span.End()

	if err := s.UpdateStations(ctx); err != nil {
		span.SetStatus(codes.Error, "updateStations failed")
		span.RecordError(err)
		slog.ErrorContext(ctx, "updateStations failed", slog.String("error", err.Error()))
	}
}

func NewStations(db *postgres.Database) *Stations {
	return &Stations{
		url: "https://velib-metropole-opendata.smovengo.cloud/opendata/Velib_Metropole/station_information.json",
		db:  db,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}
