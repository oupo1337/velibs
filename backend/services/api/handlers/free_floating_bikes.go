package handlers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/oupo1337/velibs/backend/infrastructure/postgres"
)

type FreeFloatingBikes struct {
	db *postgres.Database
}

func (f *FreeFloatingBikes) GetFreeFloatingBikes(c *gin.Context) {
	timestamp := c.Query("timestamp")

	data, err := f.db.FetchFreeFloatingBikes(c.Request.Context(), timestamp)
	if err != nil {
		slog.Error("s.db.FetchFreeFloatingBikes error", slog.String("error", err.Error()))
		c.Status(http.StatusInternalServerError)
		return
	}

	if timestamp != "" {
		c.Header("Cache-Control", "max-age=86400, immutable")
	}
	c.Data(http.StatusOK, "application/json", data)
}

func NewFreeFloatingBikes(db *postgres.Database) *FreeFloatingBikes {
	return &FreeFloatingBikes{
		db: db,
	}
}
