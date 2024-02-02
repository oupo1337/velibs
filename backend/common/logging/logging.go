package logging

import (
	"log/slog"
	"os"
)

func Init(serviceName string) {
	handler := slog.NewJSONHandler(os.Stdout, nil)

	logger := slog.New(handler.WithAttrs([]slog.Attr{
		slog.String("service", serviceName),
	}))
	slog.SetDefault(logger)
}
