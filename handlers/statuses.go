package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/oupo1337/velibs/postgres"
	"net/http"
)

type Statuses struct {
	db *postgres.Database
}

type geometry struct {
	Type        string    `json:"type"`
	Coordinates []float64 `json:"coordinates"`
}

type properties struct {
	Name       string `json:"name"`
	Mechanical int64  `json:"mechanical"`
	Electric   int64  `json:"electric"`
}

type feature struct {
	Type       string     `json:"type"`
	Geometry   geometry   `json:"geometry"`
	Properties properties `json:"properties"`
}

type featureCollection struct {
	Type     string    `json:"type"`
	Features []feature `json:"features"`
}

func (s *Statuses) GetStatuses(c *gin.Context) {
	stations, err := s.db.FetchTimestamp(c.Request.Context())
	if err != nil {
		_ = c.Error(fmt.Errorf("db.FetchTimestamp error: %w", err))
		c.Status(http.StatusInternalServerError)
		return
	}

	features := make([]feature, 0)
	for _, station := range stations {
		features = append(features, feature{
			Type: "Feature",
			Geometry: geometry{
				Type: "Point",
				Coordinates: []float64{
					station.Longitude,
					station.Latitude,
				},
			},
			Properties: properties{
				Name:       station.Name,
				Mechanical: station.Mechanical,
				Electric:   station.Electric,
			},
		})
	}

	collection := featureCollection{
		Type:     "FeatureCollection",
		Features: features,
	}
	c.JSON(http.StatusOK, collection)
}

func NewStatuses(db *postgres.Database) *Statuses {
	return &Statuses{
		db: db,
	}
}
