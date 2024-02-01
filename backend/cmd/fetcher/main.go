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

type runner interface {
	Run()
}

type dependencies struct {
	cron        *cron.Cron
	initRunners []runner
}

func run(runners []runner) {
	for _, r := range runners {
		r.Run()
	}
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
	bikeways := tasks.NewBikeways(db)

	c := cron.New()
	if err := c.AddFunc("0 */10 * * * *", statuses.Run); err != nil {
		return dependencies{}, fmt.Errorf("c.AddFunc error: %w", err)
	}
	if err := c.AddFunc("0 0 0 * * *", stations.Run); err != nil {
		return dependencies{}, fmt.Errorf("c.AddFunc error: %w", err)
	}
	if err := c.AddFunc("0 0 0 * * *", bikeways.Run); err != nil {
		return dependencies{}, fmt.Errorf("c.AddFunc error: %w", err)
	}

	return dependencies{
		cron:        c,
		initRunners: []runner{districts, boroughs, stations, bikeways},
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

	run(deps.initRunners)

	slog.Info("service is running")
	deps.cron.Run()
}
