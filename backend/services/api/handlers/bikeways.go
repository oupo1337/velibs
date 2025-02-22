package handlers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/oupo1337/velibs/backend/infrastructure/postgres"
)

type BikeLanes struct {
	db *postgres.Database
}

func (b *BikeLanes) FetchBikeLanes(c *gin.Context) {
	data, err := b.db.FetchBikeLanes(c.Request.Context())
	if err != nil {
		slog.Error("b.db.FetchBikeLanes error", slog.String("error", err.Error()))
		c.Status(http.StatusInternalServerError)
		return
	}
	c.Header("Cache-Control", "max-age=86400, immutable")
	c.Data(http.StatusOK, "application/json", data)
}

func NewBikeLanes(db *postgres.Database) *BikeLanes {
	return &BikeLanes{
		db: db,
	}
}
