package tasks

import (
	"backend/domain"
	"backend/postgres"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Statuses struct {
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
	url := "https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_status.json"

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
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
}

func NewStatuses(db *postgres.Database) *Statuses {
	return &Statuses{
		db: db,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}
