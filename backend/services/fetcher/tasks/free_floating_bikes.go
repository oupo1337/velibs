package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httptrace"
	"time"

	"github.com/sethvargo/go-retry"
	"go.opentelemetry.io/contrib/instrumentation/net/http/httptrace/otelhttptrace"
	"go.opentelemetry.io/otel/codes"

	"github.com/oupo1337/velibs/backend/common/tracing"
	"github.com/oupo1337/velibs/backend/domain"
	"github.com/oupo1337/velibs/backend/infrastructure/postgres"
)

type FreeFloatingBikes struct {
	url    string
	db     *postgres.Database
	client *http.Client
}

type FreeFloatingBikesResponse struct {
	LastUpdated int    `json:"last_updated"`
	Ttl         int    `json:"ttl"`
	Version     string `json:"version"`
	Data        struct {
		Bikes []domain.FreeFloatingBike `json:"bikes"`
	} `json:"data"`
}

func (f *FreeFloatingBikes) fetchFreeFloatingBikes(ctx context.Context) ([]domain.FreeFloatingBike, error) {
	ctx = httptrace.WithClientTrace(ctx, otelhttptrace.NewClientTrace(ctx))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, f.url, nil)
	if err != nil {
		return nil, fmt.Errorf("http.NewRequestWithContext error: %w", err)
	}

	retryer := retry.NewFibonacci(1 * time.Second)
	retryer = retry.WithJitter(100*time.Millisecond, retryer)
	retryer = retry.WithMaxRetries(7, retryer)

	var data FreeFloatingBikesResponse
	if err := retry.Do(ctx, retryer, func(ctx context.Context) error {
		response, err := f.client.Do(req)
		if err != nil {
			return fmt.Errorf("client.Do error: %w", retry.RetryableError(err))
		}
		defer func() {
			if err := response.Body.Close(); err != nil {
				slog.ErrorContext(ctx, "response.Body.Close error", slog.String("error", err.Error()))
			}
		}()

		if err := json.NewDecoder(response.Body).Decode(&data); err != nil {
			return fmt.Errorf(" json.NewDecoder().Decode error: %w", retry.RetryableError(err))
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("retry.Do error: %w", err)
	}
	return data.Data.Bikes, nil
}

func (f *FreeFloatingBikes) UpdateFreeFloatingBikes(ctx context.Context) error {
	slog.InfoContext(ctx, "fetching free floating bikes location")

	freeFloatingBikes, err := f.fetchFreeFloatingBikes(ctx)
	if err != nil {
		return fmt.Errorf("s.fetchStationsStatuses error: %w", err)
	}

	if err := f.db.InsertFreeFloatingBikes(ctx, freeFloatingBikes); err != nil {
		return fmt.Errorf("db.InsertStatuses error: %w", err)
	}
	return nil
}

func (f *FreeFloatingBikes) Run() {
	ctx, span := tracing.Start(context.Background(), "update.FreeFloatingBikes")
	defer span.End()

	if err := f.UpdateFreeFloatingBikes(ctx); err != nil {
		span.SetStatus(codes.Error, "UpdateFreeFloatingBikes failed")
		span.RecordError(err)
		slog.ErrorContext(ctx, "UpdateFreeFloatingBikes failed", slog.String("error", err.Error()))
	}
}

func NewFreeFloatingBikes(db *postgres.Database) *FreeFloatingBikes {
	return &FreeFloatingBikes{
		url: "https://data.lime.bike/api/partners/v2/gbfs/paris/free_bike_status",
		db:  db,
		client: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}
