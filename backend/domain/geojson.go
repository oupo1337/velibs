package domain

type BikewaysGeoJSON GeoJSON[BikewaysProperties, [][]float64]
type DistrictsGeoJSON GeoJSON[DistrictsProperties, [][][]float64]
type BoroughsGeoJSON GeoJSON[BoroughsProperties, [][][]float64]

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

type BikewaysProperties struct {
	TypologieSimple       string  `json:"typologie_simple"`
	Bidirectionnel        string  `json:"bidirectionnel"`
	Statut                string  `json:"statut"`
	SensVelo              string  `json:"sens_velo"`
	Voie                  string  `json:"voie"`
	Arrdt                 int     `json:"arrdt"`
	Bois                  string  `json:"bois"`
	Length                float64 `json:"length"`
	LongueurDuTronconEnKm float64 `json:"longueur_du_troncon_en_km"`
	CouloirBus            string  `json:"couloir_bus"`
	GeoPoint2D            struct {
		Lon float64 `json:"lon"`
		Lat float64 `json:"lat"`
	} `json:"geo_point_2d"`
}

type Feature[T any, U any] struct {
	Type     string `json:"type"`
	Geometry struct {
		Coordinates U      `json:"coordinates"`
		Type        string `json:"type"`
	} `json:"geometry"`
	Properties T `json:"properties"`
}

type GeoJSON[T any, U any] struct {
	Type     string          `json:"type"`
	Features []Feature[T, U] `json:"features"`
}
