package domain

type StationInformation struct {
	StationID int64   `json:"station_id"`
	Capacity  float64 `json:"capacity"`
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lon"`
	Name      string  `json:"name"`
}
