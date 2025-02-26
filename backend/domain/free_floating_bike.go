package domain

import (
	"github.com/google/uuid"
)

type FreeFloatingBike struct {
	ID                 uuid.UUID `json:"bike_id"`
	Latitude           float64   `json:"lat"`
	Longitude          float64   `json:"lon"`
	IsReserved         bool      `json:"is_reserved"`
	IsDisabled         bool      `json:"is_disabled"`
	CurrentRangeMeters int       `json:"current_range_meters"`
	VehicleTypeId      string    `json:"vehicle_type_id"`
	LastReported       int64     `json:"last_reported"`
	VehicleType        string    `json:"vehicle_type"`
}
