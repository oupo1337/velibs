package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/oupo1337/velibs/backend/handlers"
	"github.com/oupo1337/velibs/backend/postgres"
)

type dependencies struct {
	statuses *handlers.Statuses
	ways     *handlers.BikeWays
}

func initDependencies() (dependencies, error) {
	db, err := postgres.New(postgres.Configuration{
		Username: os.Getenv("DATABASE_USERNAME"),
		Password: os.Getenv("DATABASE_PASSWORD"),
		Address:  os.Getenv("DATABASE_ADDRESS"),
		Name:     os.Getenv("DATABASE_NAME"),
	})
	if err != nil {
		return dependencies{}, fmt.Errorf("postgres.New error: %w", err)
	}

	return dependencies{
		statuses: handlers.NewStatuses(db),
		ways:     handlers.NewBikeWays(db),
	}, nil
}

func initApp(deps dependencies) *gin.Engine {
	app := gin.Default()

	app.Use(cors.New(
		cors.Config{
			AllowOrigins:  []string{"https://velib.runtheit.com", "http://localhost:3000"},
			AllowMethods:  []string{http.MethodHead, http.MethodOptions, http.MethodGet},
			AllowHeaders:  []string{"E-Tag", "If-None-Match"},
			ExposeHeaders: []string{"E-Tag"},
		}))

	app.GET("/api/v2/timestamps", deps.statuses.GetMinMaxTimestamps)
	app.GET("/api/statuses.geojson", deps.statuses.GetStatuses)
	app.GET("/api/stations/:id", deps.statuses.GetStationTimeSeries)
	app.GET("/api/v1/distributions/:id", deps.statuses.GetStationDistribution)
	app.GET("/api/v1/bikeways", deps.ways.FetchBikeWays)
	app.POST("/api/v1/bikeways", deps.ways.AddBikeWays)
	return app
}

func main() {
	deps, err := initDependencies()
	if err != nil {
		slog.Error("initDependencies error", slog.String("error", err.Error()))
	}

	app := initApp(deps)
	slog.Info("api is running")
	if err := app.Run(fmt.Sprintf(":%s", os.Getenv("PORT"))); err != nil {
		slog.Error("app.Run error", slog.String("error", err.Error()))
	}
}
