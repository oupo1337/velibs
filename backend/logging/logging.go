package logging

import (
	"log/slog"
	"os"
)

func Init() {
	handler := slog.NewJSONHandler(os.Stdout, nil)
	logger := slog.New(handler)
	slog.SetDefault(logger)
}
