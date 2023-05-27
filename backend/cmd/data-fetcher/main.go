package main

import (
	"fmt"
	"log"
	"os"

	"github.com/robfig/cron"

	"github.com/oupo1337/velibs/backend/postgres"
	"github.com/oupo1337/velibs/backend/tasks"
)

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

	stations := tasks.NewStations(db)
	statuses := tasks.NewStatuses(db)

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
	deps, err := initDependencies()
	if err != nil {
		log.Fatalf("initDependencies error: %s", err.Error())
	}

	log.Println("crawler is running")
	deps.cron.Run()
}
