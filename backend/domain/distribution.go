package domain

type DistributionData struct {
	Time       string  `json:"time"`
	Mechanical float64 `json:"mechanical"`
	Electric   float64 `json:"electric"`
}
