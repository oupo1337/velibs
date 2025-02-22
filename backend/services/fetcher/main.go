package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/oupo1337/velibs/backend/common/application"
	"github.com/oupo1337/velibs/backend/common/cronx"
	"github.com/oupo1337/velibs/backend/common/ginx"
	"github.com/oupo1337/velibs/backend/infrastructure/postgres"
	"github.com/oupo1337/velibs/backend/services/fetcher/tasks"
)

const serviceName = "velib-fetcher"

type dependencies struct {
	cron *cronx.Cron
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

	districts := tasks.NewAdministrativeDistricts(db)
	boroughs := tasks.NewBoroughs(db)
	stations := tasks.NewStations(db)
	statuses := tasks.NewStatuses(db)
	bikeLanes := tasks.NewBikeLanes(db)

	c := cronx.New()
	if err := c.AddFunc("0 */10 * * * *", "update.Statuses", statuses.UpdateStatuses); err != nil {
		return dependencies{}, fmt.Errorf("c.AddFunc error: %w", err)
	}
	if err := c.AddFunc("0 0 0 * * *", "update.Stations", stations.UpdateStations); err != nil {
		return dependencies{}, fmt.Errorf("c.AddFunc error: %w", err)
	}
	if err := c.AddFunc("0 0 0 * * *", "update.BikeLanes", bikeLanes.UpdateBikeLanes); err != nil {
		return dependencies{}, fmt.Errorf("c.AddFunc error: %w", err)
	}

	bikeLanes.Run()
	districts.Run()
	boroughs.Run()
	stations.Run()

	return dependencies{
		cron: c,
	}, nil
}

func main() {
	app := application.New(serviceName)

	deps, err := initDependencies()
	if err != nil {
		slog.Error("initDependencies error", slog.String("error", err.Error()))
		os.Exit(1)
	}

	router := ginx.New(serviceName)

	app.AddServices(router, deps.cron)
	app.Run()
}
