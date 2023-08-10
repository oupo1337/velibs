package handlers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/oupo1337/velibs/backend/domain"
	"github.com/oupo1337/velibs/backend/postgres"
)

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

	if err := b.db.InsertBikeWays(c.Request.Context(), ways); err != nil {
		slog.ErrorContext(c.Request.Context(), "db.InsertBikeWays error", slog.String("error", err.Error()))
		c.Status(http.StatusInternalServerError)
		return
	}
	c.Status(http.StatusOK)
}

func NewBikeWays(db *postgres.Database) *BikeWays {
	return &BikeWays{
		db: db,
	}
}
