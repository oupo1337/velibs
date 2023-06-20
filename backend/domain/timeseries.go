package domain

import "time"

type TimeSeries struct {
	Date       time.Time `json:"date"`
	Mechanical int64     `json:"mechanical"`
	Electric   int64     `json:"electric"`
}

type StationTimeSeries struct {
	ID         int64        `json:"id"`
	Name       string       `json:"name"`
	Capacity   int64        `json:"capacity"`
	TimeSeries []TimeSeries `json:"time_series"`
}
