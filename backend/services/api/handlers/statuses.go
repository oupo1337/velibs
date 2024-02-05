package handlers

import (
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/oupo1337/velibs/backend/infrastructure/postgres"
)

type Statuses struct {
	db *postgres.Database
}

type idsQuery struct {
	IDs []int `form:"ids[]" binding:"required"`
}

func (s *Statuses) GetStationDistribution(c *gin.Context) {
	var query idsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	distribution, err := s.db.GetStationDistribution(c.Request.Context(), query.IDs)
	if err != nil {
		_ = c.Error(fmt.Errorf("db.GetStationDistribution error: %w", err))
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, distribution)
}

func (s *Statuses) GetStationTimeSeries(c *gin.Context) {
	var query idsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	sts, err := s.db.GetStationTimeSeries(c.Request.Context(), query.IDs)
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
		slog.Error("db.GetMinMaxTimestamps error", slog.String("error", err.Error()))
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, minMaxTimestampResponse{
		Min: minTimestamp,
		Max: maxTimestamp,
	})
}

func (s *Statuses) GetAdministrativeDistrictsStatuses(c *gin.Context) {
	timestamp := c.Query("timestamp")

	data, err := s.db.GetAdministrativeDistricts(c.Request.Context(), timestamp)
	if err != nil {
		slog.Error("s.db.GetAdministrativeDistricts error", slog.String("error", err.Error()))
		c.Status(http.StatusInternalServerError)
		return
	}

	if timestamp != "" {
		c.Header("Cache-Control", "max-age=86400, immutable")
	}
	c.Data(http.StatusOK, "application/json", data)
}

func (s *Statuses) GetBoroughs(c *gin.Context) {
	timestamp := c.Query("timestamp")

	data, err := s.db.GetBoroughs(c.Request.Context(), timestamp)
	if err != nil {
		slog.Error("s.db.GetBoroughs error", slog.String("error", err.Error()))
		c.Status(http.StatusInternalServerError)
		return
	}

	if timestamp != "" {
		c.Header("Cache-Control", "max-age=86400, immutable")
	}
	c.Data(http.StatusOK, "application/json", data)
}

func (s *Statuses) GetStations(c *gin.Context) {
	timestamp := c.Query("timestamp")

	data, err := s.db.FetchStationsStatuses(c.Request.Context(), timestamp)
	if err != nil {
		slog.Error("s.db.FetchTimestamp error", slog.String("error", err.Error()))
		c.Status(http.StatusInternalServerError)
		return
	}

	if timestamp != "" {
		c.Header("Cache-Control", "max-age=86400, immutable")
	}
	c.Data(http.StatusOK, "application/json", data)
}

func NewStatuses(db *postgres.Database) *Statuses {
	return &Statuses{
		db: db,
	}
}
