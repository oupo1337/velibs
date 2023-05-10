package main

import (
	"backend/handlers"
	"backend/postgres"
	"backend/tasks"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/robfig/cron"
	"log"
	"os"
)

type dependencies struct {
	statuses *handlers.Statuses
	cron     *cron.Cron
}

func initDependencies() (dependencies, error) {
	db, err := postgres.New(postgres.Configuration{
		Username: "postgres",
		Password: "password",
		Address:  "postgres:5432",
		Name:     "postgres",
	})
	if err != nil {
		return dependencies{}, fmt.Errorf("postgres.New error: %w", err)
	}

	stations := tasks.NewStations(db)
	statuses := tasks.NewStatuses(db)

	c := cron.New()
	if err := c.AddFunc("0 */10 * * * *", stations.UpdateStations); err != nil {
		return dependencies{}, fmt.Errorf("c.AddFunc error: %w", err)
	}

	if err := c.AddFunc("0 */10 * * * *", statuses.UpdateStatuses); err != nil {
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
	app.GET("/statuses.geojson", deps.statuses.GetStatuses)
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
