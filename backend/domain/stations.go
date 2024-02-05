package domain

import "time"

type StationInformation struct {
	StationID int64   `json:"station_id"`
	Capacity  float64 `json:"capacity"`
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lon"`
	Name      string  `json:"name"`
}

type Station struct {
	Timestamp  time.Time
	ID         int64
	Name       string
	Capacity   int64
	Latitude   float64
	Longitude  float64
	Mechanical int64
	Electric   int64
}
