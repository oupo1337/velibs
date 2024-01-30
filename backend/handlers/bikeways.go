package handlers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/oupo1337/velibs/backend/postgres"
)

type BikeWays struct {
	db *postgres.Database
}

func (b *BikeWays) FetchBikeways(c *gin.Context) {
	data, err := b.db.FetchBikeways(c.Request.Context())
	if err != nil {
		slog.Error("b.db.FetchBikeways error", slog.String("error", err.Error()))
		c.Status(http.StatusInternalServerError)
		return
	}
	c.Header("Cache-Control", "max-age=86400, immutable")
	c.Data(http.StatusOK, "application/json", data)
}

func NewBikeWays(db *postgres.Database) *BikeWays {
	return &BikeWays{
		db: db,
	}
}
