package application

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/oupo1337/velibs/backend/common/logging"
	"github.com/oupo1337/velibs/backend/common/tracing"
)

type Service interface {
	Start() error
	Stop(ctx context.Context) error
}

type Application struct {
	Name    string
	Version string
	Address string

	services []Service
}

func New(serviceName string) Application {
	address := os.Getenv("APP_ADDR")

	logging.Init(serviceName)
	if err := tracing.Init(serviceName); err != nil {
		slog.Error("tracing.Init error", slog.String("error", err.Error()))
		os.Exit(1)
	}

	return Application{
		Name:    serviceName,
		Address: address,
	}
}

func (app *Application) AddServices(s ...Service) {
	app.services = append(app.services, s...)
}

func (app *Application) start() {
	for _, service := range app.services {
		go func(s Service) {
			if err := s.Start(); err != nil {
				slog.Error("service.Run error", slog.String("error", err.Error()))
				os.Exit(1)
			}
		}(service)
	}
}

func (app *Application) stop() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	for _, service := range app.services {
		if err := service.Stop(ctx); err != nil {
			slog.Error("service.Stop error", slog.String("error", err.Error()))
			os.Exit(1)
		}
	}
}

func (app *Application) Run() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	app.start()
	slog.Info("service is running")
	<-ctx.Done()

	stop()
	slog.Info("shutting down gracefully, press Ctrl+C again to force")

	app.stop()
	slog.Info("serivce is exiting")
}
