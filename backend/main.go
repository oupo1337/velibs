package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/robfig/cron"

	"github.com/oupo1337/velibs/backend/handlers"
	"github.com/oupo1337/velibs/backend/postgres"
	"github.com/oupo1337/velibs/backend/tasks"
)

type dependencies struct {
	statuses *handlers.Statuses
	cron     *cron.Cron
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

	updateFunc := func() {
		stations.UpdateStations()
		statuses.UpdateStatuses()
	}

	c := cron.New()
	if err := c.AddFunc("0 */10 * * * *", updateFunc); err != nil {
		return dependencies{}, fmt.Errorf("c.AddFunc error: %w", err)
	}

	return dependencies{
		statuses: handlers.NewStatuses(db),
		cron:     c,
	}, nil
}

func initApp(deps dependencies) *gin.Engine {
	app := gin.Default()

	app.Use(cors.Default())

	app.GET("/api/timestamps", deps.statuses.GetTimestamp)
	app.GET("/api/statuses.geojson", deps.statuses.GetStatuses)
	return app
}

func main() {
	deps, err := initDependencies()
	if err != nil {
		log.Fatalf("initDependencies error: %s", err.Error())
	}

	app := initApp(deps)
	deps.cron.Start()

	if err := app.Run(fmt.Sprintf(":%s", os.Getenv("PORT"))); err != nil {
		log.Fatalf("app.Run error: %s", err.Error())
	}
}
