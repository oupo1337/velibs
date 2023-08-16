package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/uber/h3-go/v4"

	"github.com/oupo1337/velibs/backend/postgres"
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
	StationID  int64  `json:"station_id"`
	Capacity   int64  `json:"capacity"`
	Bikes      int64  `json:"bikes"`
	Mechanical int64  `json:"mechanical"`
	Electric   int64  `json:"electric"`
	Hexagon    string `json:"hexagon"`
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

func (s *Statuses) GetStationDistribution(c *gin.Context) {
	distribution, err := s.db.GetStationDistribution(c.Request.Context(), c.Param("id"))
	if err != nil {
		_ = c.Error(fmt.Errorf("db.GetStationDistribution error: %w", err))
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, distribution)
}

func (s *Statuses) GetStationTimeSeries(c *gin.Context) {
	sts, err := s.db.GetStationTimeSeries(c.Request.Context(), c.Param("id"))
	if err != nil {
		_ = c.Error(fmt.Errorf("db.GetStationTimeSeries error: %w", err))
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, sts)
}

type minMaxTimestampResponse struct {
	Min time.Time `json:"min"`
	Max time.Time `json:"max"`
}

func (s *Statuses) GetMinMaxTimestamps(c *gin.Context) {
	minTimestamp, maxTimestamp, err := s.db.GetMinMaxTimestamps(c.Request.Context())
	if err != nil {
		_ = c.Error(fmt.Errorf("db.GetMinMaxTimestamps error: %w", err))
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, minMaxTimestampResponse{
		Min: minTimestamp,
		Max: maxTimestamp,
	})
}

func (s *Statuses) GetStatuses(c *gin.Context) {
	resQuery := c.DefaultQuery("resolution", "9")
	resolution, err := strconv.Atoi(resQuery)
	if err != nil {
		_ = c.Error(fmt.Errorf("strconv.Atoi error: %w", err))
		c.Status(http.StatusInternalServerError)
		return
	}

	stations, err := s.db.FetchTimestamp(c.Request.Context(), c.Query("timestamp"))
	if err != nil {
		_ = c.Error(fmt.Errorf("db.FetchTimestamp error: %w", err))
		c.Status(http.StatusInternalServerError)
		return
	}

	features := make([]feature, 0, len(stations))
	for _, station := range stations {
		latLng := h3.NewLatLng(station.Latitude, station.Longitude)

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
				StationID:  station.ID,
				Capacity:   station.Capacity,
				Bikes:      station.Mechanical + station.Electric,
				Mechanical: station.Mechanical,
				Electric:   station.Electric,
				Hexagon:    h3.LatLngToCell(latLng, resolution).String(),
			},
		})
	}

	collection := featureCollection{
		Type:     "FeatureCollection",
		Features: features,
	}
	c.Header("Cache-Control", "max-age=86400, immutable")
	c.JSON(http.StatusOK, collection)
}

func NewStatuses(db *postgres.Database) *Statuses {
	return &Statuses{
		db: db,
	}
}
