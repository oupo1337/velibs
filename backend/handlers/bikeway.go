package handlers

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/oupo1337/velibs/backend/domain"
	"github.com/oupo1337/velibs/backend/postgres"
)

type Feature struct {
	Type     string `json:"type"`
	Geometry struct {
		Coordinates [][]float64 `json:"coordinates"`
		Type        string      `json:"type"`
	} `json:"geometry"`
	Properties struct {
	} `json:"properties"`
}

type FeatureCollection struct {
	Type     string    `json:"type"`
	Features []Feature `json:"features"`
}

type BikeWays struct {
	db *postgres.Database
}

func (b *BikeWays) AddBikeWays(c *gin.Context) {
	var ways []domain.BikeWay
	if err := c.ShouldBindJSON(&ways); err != nil {
		slog.ErrorContext(c.Request.Context(), "c.ShouldBind error", slog.String("error", err.Error()))
		c.Status(http.StatusBadRequest)
		return
	}

	go func() {
		if err := b.db.InsertBikeWays(context.Background(), ways); err != nil {
			slog.ErrorContext(context.Background(), "db.InsertBikeWays error", slog.String("error", err.Error()))
		}
	}()
	c.Status(http.StatusOK)
}

func (b *BikeWays) FetchBikeWays(c *gin.Context) {
	ways, err := b.db.FetchBikeWays(c.Request.Context())
	if err != nil {
		slog.ErrorContext(c.Request.Context(), "db.FetchBikeWays error", slog.String("error", err.Error()))
		c.Status(http.StatusInternalServerError)
		return
	}

	var features []Feature
	for _, way := range ways {
		var f Feature
		b := []byte(way)
		if err := json.Unmarshal(b, &f); err != nil {
			slog.ErrorContext(c.Request.Context(), "db.FetchBikeWays error", slog.String("error", err.Error()))
			c.Status(http.StatusInternalServerError)
			return
		}
		features = append(features, f)
	}

	c.Header("Cache-Control", "max-age=86400, immutable")
	c.JSON(http.StatusOK, FeatureCollection{
		Type:     "FeatureCollection",
		Features: features,
	})
}

func NewBikeWays(db *postgres.Database) *BikeWays {
	return &BikeWays{
		db: db,
	}
}
