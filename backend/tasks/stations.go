package tasks

import (
	"backend/domain"
	"backend/postgres"
	"context"
	"encoding/json"
	"net/http"
	"time"
)

type Stations struct {
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
	url := "https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_information.json"

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
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
	stations, err := s.fetchStationsInformation(context.Background())
	if err != nil {
		return
	}

	if err := s.db.InsertStations(context.Background(), stations); err != nil {
		return
	}
}

func NewStations(db *postgres.Database) *Stations {
	return &Stations{
		db: db,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}
