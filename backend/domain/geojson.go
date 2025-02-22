package domain

import (
	"github.com/paulmach/orb/geojson"
)

type BikeLanesGeoJSON GeoJSON[BikeLanesProperties]
type DistrictsGeoJSON GeoJSON[DistrictsProperties]
type BoroughsGeoJSON GeoJSON[BoroughsProperties]

type BoroughsProperties struct {
	NSqAr     int     `json:"n_sq_ar"`
	CAr       int     `json:"c_ar"`
	CArinsee  int     `json:"c_arinsee"`
	LAr       string  `json:"l_ar"`
	LAroff    string  `json:"l_aroff"`
	NSqCo     int     `json:"n_sq_co"`
	Surface   float64 `json:"surface"`
	Perimetre float64 `json:"perimetre"`
	GeomXY    struct {
		Lon float64 `json:"lon"`
		Lat float64 `json:"lat"`
	} `json:"geom_x_y"`
}

type DistrictsProperties struct {
	NSqQu     string  `json:"n_sq_qu"`
	CQu       string  `json:"c_qu"`
	CQuinsee  string  `json:"c_quinsee"`
	LQu       string  `json:"l_qu"`
	CAr       int     `json:"c_ar"`
	NSqAr     string  `json:"n_sq_ar"`
	Perimetre float64 `json:"perimetre"`
	Surface   float64 `json:"surface"`
	GeomXY    struct {
		Lon float64 `json:"lon"`
		Lat float64 `json:"lat"`
	} `json:"geom_x_y"`
	StAreaShape      float64 `json:"st_area_shape"`
	StPerimeterShape float64 `json:"st_perimeter_shape"`
}

type BikeLanesProperties struct {
	OsmId                     int    `json:"osm_id"`
	Nom                       string `json:"nom"`
	Amenagement               string `json:"amenagement"`
	CoteAmenagement           string `json:"cote_amenagement"`
	Sens                      string `json:"sens"`
	Surface                   string `json:"surface"`
	Arrondissement            string `json:"arrondissement"`
	Bois                      string `json:"bois"`
	Coronapiste               string `json:"coronapiste"`
	AmenagementTemporaire     string `json:"amenagement_temporaire"`
	InfrastructureBidirection string `json:"infrastructure_bidirection"`
	VoieASensUnique           string `json:"voie_a_sens_unique"`
	PositionAmenagement       string `json:"position_amenagement"`
	VitesseMaximaleAutorisee  string `json:"vitesse_maximale_autorisee"`
}

type Feature[T any] struct {
	Type       string `json:"type"`
	Geometry   geojson.Geometry
	Properties T `json:"properties"`
}

type GeoJSON[T any] struct {
	Type     string       `json:"type"`
	Features []Feature[T] `json:"features"`
}
