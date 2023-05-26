package domain

import "time"

type Bikes struct {
	Mechanical int64 `json:"mechanical"`
	Electric   int64 `json:"electric"`
}

type TimeSeries map[time.Time]Bikes
