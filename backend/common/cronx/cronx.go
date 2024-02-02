package cronx

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/robfig/cron"
	"go.opentelemetry.io/otel/codes"

	"github.com/oupo1337/velibs/backend/common/tracing"
)

type Cron struct {
	cron *cron.Cron
}

func (c *Cron) AddFunc(spec, name string, cmd func(ctx context.Context) error) error {
	return c.cron.AddFunc(spec, func() {
		ctx, span := tracing.Start(context.Background(), name)
		defer span.End()

		defer func() {
			if err := recover(); err != nil {
				span.SetStatus(codes.Error, "panic")
				slog.ErrorContext(ctx, "panic", slog.Any("error", err))
			}
		}()

		if err := cmd(ctx); err != nil {
			span.SetStatus(codes.Error, fmt.Sprintf("%s failed", name))
			span.RecordError(err)
			slog.ErrorContext(ctx, fmt.Sprintf("%s failed", name), slog.String("error", err.Error()))
		}
	})
}

func (c *Cron) Start() error {
	c.cron.Run()
	return nil
}

func (c *Cron) Stop(_ context.Context) error {
	c.cron.Stop()
	return nil
}

func New() *Cron {
	return &Cron{
		cron: cron.New(),
	}
}
