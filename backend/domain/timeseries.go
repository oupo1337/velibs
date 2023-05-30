package domain

import "time"

type TimeSeries struct {
	Date       time.Time `json:"date"`
	Mechanical int64     `json:"mechanical"`
	Electric   int64     `json:"electric"`
}

type StationTimeSeries struct {
	TimeSeries []TimeSeries `json:"time_series"`
	Capacity   int64        `json:"capacity"`
}
