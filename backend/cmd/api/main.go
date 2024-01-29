package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"

	"github.com/oupo1337/velibs/backend/handlers"
	"github.com/oupo1337/velibs/backend/logging"
	"github.com/oupo1337/velibs/backend/middleware"
	"github.com/oupo1337/velibs/backend/postgres"
	"github.com/oupo1337/velibs/backend/tracing"
)

const serviceName = "velib-api"

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
	gin.SetMode(gin.ReleaseMode)
	app := gin.New()

	domain := os.Getenv("APP_DOMAIN_NAME")
	config := cors.Config{
		AllowOrigins:  []string{"http://localhost:3000", domain},
		AllowMethods:  []string{http.MethodHead, http.MethodOptions, http.MethodGet},
		AllowHeaders:  []string{"E-Tag", "If-None-Match"},
		ExposeHeaders: []string{"E-Tag"},
	}

	app.Use(gin.Recovery())
	app.Use(middleware.NewLogging())
	app.Use(cors.New(config))
	app.Use(otelgin.Middleware(serviceName))

	app.GET("/api/v2/timestamps", deps.statuses.GetMinMaxTimestamps)

	app.GET("/api/v1/stations.geojson", deps.statuses.GetStations)
	app.GET("/api/v1/districts.geojson", deps.statuses.GetAdministrativeDistrictsStatuses)
	app.GET("/api/v1/boroughs.geojson", deps.statuses.GetBoroughs)
	app.GET("/api/v1/bikeways.geojson", deps.ways.FetchBikeways)

	app.GET("/api/v1/stations/:id", deps.statuses.GetStationTimeSeries)
	app.GET("/api/v1/distributions/:id", deps.statuses.GetStationDistribution)

	return app
}

func main() {
	logging.Init(serviceName)

	err := tracing.Init(serviceName)
	if err != nil {
		slog.Error("tracing.Init error", slog.String("error", err.Error()))
		os.Exit(1)
	}

	deps, err := initDependencies()
	if err != nil {
		slog.Error("initDependencies error", slog.String("error", err.Error()))
		os.Exit(1)
	}

	app := initApp(deps)
	port := os.Getenv("PORT")
	slog.Info("service is running", slog.String("port", port))
	if err := app.Run(fmt.Sprintf(":%s", port)); err != nil {
		slog.Error("app.Run error", slog.String("error", err.Error()))
		os.Exit(1)
	}
}
