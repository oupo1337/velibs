package tasks

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/oupo1337/velibs/backend/domain"
	"github.com/oupo1337/velibs/backend/postgres"
)

type Stations struct {
	url       string
	db        *postgres.Database
	timescale *postgres.Database
	client    *http.Client
}

type StationInformationResponse struct {
	Data struct {
		StationsInformation []domain.StationInformation `json:"stations"`
	} `json:"data"`
	LastUpdatedOther int64 `json:"lastUpdatedOther"`
	TTL              int64 `json:"ttl"`
}

func (s *Stations) fetchStationsInformation(ctx context.Context) ([]domain.StationInformation, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, s.url, nil)
	if err != nil {
		return nil, err
	}

	response, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}

	var data StationInformationResponse
	if err := json.NewDecoder(response.Body).Decode(&data); err != nil {
		return nil, err
	}
	return data.Data.StationsInformation, nil
}

func (s *Stations) UpdateStations() {
	slog.Info("UpdateStations running")

	stations, err := s.fetchStationsInformation(context.Background())
	if err != nil {
		slog.Error("s.fetchStationsInformation error", slog.String("error", err.Error()))
		return
	}

	if err := s.db.InsertStations(context.Background(), stations); err != nil {
		slog.Error("db.InsertStations error", slog.String("error", err.Error()))
		return
	}

	if err := s.timescale.InsertStations(context.Background(), stations); err != nil {
		slog.Error("s.timescale.InsertStations error", slog.String("error", err.Error()))
		return
	}
}

func NewStations(url string, db *postgres.Database, timescale *postgres.Database) *Stations {
	return &Stations{
		url:       url,
		db:        db,
		timescale: timescale,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}
