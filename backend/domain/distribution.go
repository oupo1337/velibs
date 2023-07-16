package domain

type DistributionData struct {
	Hour       int   `json:"hour"`
	Minute     int   `json:"minute"`
	Mechanical int64 `json:"mechanical"`
	Electric   int64 `json:"electric"`
}
