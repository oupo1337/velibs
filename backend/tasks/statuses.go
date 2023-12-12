package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/oupo1337/velibs/backend/domain"
	"github.com/oupo1337/velibs/backend/postgres"
)

type Statuses struct {
	url       string
	db        *postgres.Database
	timescale *postgres.Database
	client    *http.Client
}

type StationStatusResponse struct {
	Data struct {
		StationsStatuses []domain.StationStatus `json:"stations"`
	} `json:"data"`
	LastUpdatedOther int64 `json:"lastUpdatedOther"`
	TTL              int64 `json:"ttl"`
}

func (s *Statuses) fetchStationsStatuses(ctx context.Context) ([]domain.StationStatus, error) {
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
	fmt.Printf("UpdateStatuses running...\n")

	statuses, err := s.fetchStationsStatuses(context.Background())
	if err != nil {
		fmt.Printf("s.fetchStationsStatuses error: %s\n", err.Error())
		return
	}

	if err := s.db.InsertStatuses(context.Background(), statuses); err != nil {
		fmt.Printf("db.InsertStatuses error: %s\n", err.Error())
		return
	}

	if err := s.timescale.InsertStatuses(context.Background(), statuses); err != nil {
		fmt.Printf("db.InsertStatuses error (timescale): %s\n", err.Error())
		return
	}
}

func NewStatuses(url string, db *postgres.Database, timescale *postgres.Database) *Statuses {
	return &Statuses{
		url:       url,
		db:        db,
		timescale: timescale,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}
