package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/oupo1337/velibs/backend/common/application"
	"github.com/oupo1337/velibs/backend/common/ginx"
	"github.com/oupo1337/velibs/backend/infrastructure/postgres"
	"github.com/oupo1337/velibs/backend/services/api/handlers"
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

func initRouter(deps dependencies) application.Service {
	router := ginx.New(serviceName)

	router.GET("/api/v2/timestamps", deps.statuses.GetMinMaxTimestamps)

	router.GET("/api/v1/stations.geojson", deps.statuses.GetStations)
	router.GET("/api/v1/districts.geojson", deps.statuses.GetAdministrativeDistrictsStatuses)
	router.GET("/api/v1/boroughs.geojson", deps.statuses.GetBoroughs)
	router.GET("/api/v1/bikeways.geojson", deps.ways.FetchBikeways)

	router.GET("/api/v1/stations", deps.statuses.GetStationTimeSeries)
	router.GET("/api/v1/distributions", deps.statuses.GetStationDistribution)

	return router
}

func main() {
	app := application.New(serviceName)

	deps, err := initDependencies()
	if err != nil {
		slog.Error("initDependencies error", slog.String("error", err.Error()))
		os.Exit(1)
	}

	router := initRouter(deps)

	app.AddServices(router)
	app.Run()
}
