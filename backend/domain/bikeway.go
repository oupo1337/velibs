package domain

type BikeWay struct {
	Typology             string      `json:"typologie_simple"`
	Bidirectional        string      `json:"bidirectionnel"`
	SpeedRegime          string      `json:"statut"`
	Direction            string      `json:"sens_velo"`
	Route                string      `json:"voie"`
	Arrondissement       int         `json:"arrdt"`
	Forest               string      `json:"bois"`
	Length               float64     `json:"length"`
	LengthKilometers     float64     `json:"longueur_du_troncon_en_km"`
	Position             string      `json:"position"`
	ForbiddenCirculation string      `json:"circulation"`
	Piste                string      `json:"piste"`
	BusLane              string      `json:"couloir_bus"`
	TypeContinuity       string      `json:"type_continuite"`
	Network              string      `json:"reseau"`
	Date                 string      `json:"date_de_livraison"`
	GeoShape             interface{} `json:"geo_shape"`
	GeoPoint2D           struct {
		Longitude float64 `json:"lon"`
		Latitude  float64 `json:"lat"`
	} `json:"geo_point_2d"`
}
