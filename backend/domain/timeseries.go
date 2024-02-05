package domain

import "time"

type TimeSeries struct {
	Date       time.Time `json:"date"`
	Mechanical int64     `json:"mechanical"`
	Electric   int64     `json:"electric"`
}

type StationTimeSeries struct {
	Stations   []StationInformation `json:"stations"`
	TimeSeries []TimeSeries         `json:"time_series"`
}
