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
	fmt.Printf("UpdateStations running...\n")

	stations, err := s.fetchStationsInformation(context.Background())
	if err != nil {
		fmt.Printf("s.fetchStationsInformation error: %s\n", err.Error())
		return
	}

	if err := s.db.InsertStations(context.Background(), stations); err != nil {
		fmt.Printf("db.InsertStations error: %s\n", err.Error())
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
