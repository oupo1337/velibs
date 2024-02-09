package domain

import "time"

type Timeseries struct {
	Date       time.Time `json:"date"`
	Mechanical int64     `json:"mechanical"`
	Electric   int64     `json:"electric"`
}
