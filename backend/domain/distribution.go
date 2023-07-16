package domain

type DistributionData struct {
	Hour       int     `json:"hour"`
	Minute     int     `json:"minute"`
	Mechanical float64 `json:"mechanical"`
	Electric   float64 `json:"electric"`
}
