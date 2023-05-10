package domain

type StationStatus struct {
	StationCode            string `json:"stationCode"`
	StationID              int    `json:"station_id"`
	NumBikesAvailable      int    `json:"num_bikes_available"`
	NumBikesAvailableTypes []struct {
		Mechanical *int `json:"mechanical"`
		Ebike      *int `json:"ebike"`
	} `json:"num_bikes_available_types"`
	NumDocksAvailable int `json:"num_docks_available"`
	IsInstalled       int `json:"is_installed"`
	IsReturning       int `json:"is_returning"`
	IsRenting         int `json:"is_renting"`
	LastReported      int `json:"last_reported"`
}
