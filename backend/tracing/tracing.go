package tracing

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
	"go.opentelemetry.io/otel/trace"
)

const ScopeName = "github.com/oupo1337/velibs/backend/tracing"

func Start(ctx context.Context, spanName string, opts ...trace.SpanStartOption) (context.Context, trace.Span) {
	tracer := otel.GetTracerProvider().Tracer(ScopeName)

	return tracer.Start(ctx, spanName, opts...)
}

func Init(serviceName string) error {
	slog.Info("initializing tracing")

	res, err := resource.New(
		context.Background(),
		resource.WithSchemaURL(semconv.SchemaURL),
		resource.WithAttributes(
			semconv.ServiceNamespaceKey.String("velib"),
			semconv.ServiceNameKey.String(serviceName),
		),
		resource.WithTelemetrySDK(),
		resource.WithHost(),
		resource.WithOSType(),
	)
	if err != nil {
		return fmt.Errorf("resource.New error: %w", err)
	}

	otel.SetTextMapPropagator(
		propagation.NewCompositeTextMapPropagator(
			propagation.TraceContext{},
			propagation.Baggage{},
		))

	exporter, err := otlptrace.New(context.Background(), otlptracehttp.NewClient())
	if err != nil {
		return fmt.Errorf("otlptrace.New error: %w", err)
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter, sdktrace.WithBatchTimeout(1000*time.Millisecond)),
		sdktrace.WithResource(res),
	)
	otel.SetTracerProvider(tp)
	return nil
}
