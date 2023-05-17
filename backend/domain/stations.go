package domain

import "time"

type StationInformation struct {
	Capacity  float64 `json:"capacity"`
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lon"`
	Name      string  `json:"name"`
	StationID int64   `json:"station_id"`
}

type Station struct {
	Timestamp  time.Time
	ID         int64
	Name       string
	Latitude   float64
	Longitude  float64
	Mechanical int64
	Electric   int64
}
