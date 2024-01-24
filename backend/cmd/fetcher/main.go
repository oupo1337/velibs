package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/robfig/cron"

	"github.com/oupo1337/velibs/backend/logging"
	"github.com/oupo1337/velibs/backend/postgres"
	"github.com/oupo1337/velibs/backend/tasks"
	"github.com/oupo1337/velibs/backend/tracing"
)

const serviceName = "velib-fetcher"

type dependencies struct {
	cron *cron.Cron
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

	stationInformationURL := os.Getenv("VELIB_API_STATIONS_URL")
	statusesURL := os.Getenv("VELIB_API_STATUSES_URL")

	stations := tasks.NewStations(stationInformationURL, db)
	statuses := tasks.NewStatuses(statusesURL, db)

	c := cron.New()
	if err := c.AddFunc("0 */10 * * * *", func() {
		stations.UpdateStations()
		statuses.UpdateStatuses()
	}); err != nil {
		return dependencies{}, fmt.Errorf("c.AddFunc error: %w", err)
	}

	return dependencies{
		cron: c,
	}, nil
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

	slog.Info("data-fetcher is running")
	deps.cron.Run()
}
