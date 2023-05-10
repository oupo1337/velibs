package main

import (
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/oupo1337/velibs/handlers"
	"github.com/oupo1337/velibs/postgres"
	"github.com/oupo1337/velibs/tasks"
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

	app.GET("/api/statuses.geojson", deps.statuses.GetStatuses)
	app.StaticFile("/", "./public/index.html")
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
