package ginx

import (
	"context"
	"net/http"
	"os"
	"slices"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"

	"github.com/oupo1337/velibs/backend/common/middleware"
)

type Engine struct {
	*gin.Engine
	srv *http.Server
}

func healtcheck(c *gin.Context) {
	c.Status(http.StatusOK)
}

func allowOrigins(origin string) bool {
	return origin == "http://localhost:3000" || origin == os.Getenv("APPLICATION_DOMAIN_NAME")
}

func (e *Engine) Start() error {
	err := e.srv.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		return err
	}
	return nil
}

func (e *Engine) Stop(ctx context.Context) error {
	return e.srv.Shutdown(ctx)
}

func New(serviceName string) *Engine {
	gin.SetMode(gin.ReleaseMode)
	engine := gin.New()
	skip := []string{"/"}

	config := cors.Config{
		AllowOriginFunc: allowOrigins,
		AllowMethods:    []string{http.MethodHead, http.MethodOptions, http.MethodGet},
		AllowHeaders:    []string{"E-Tag", "If-None-Match"},
		ExposeHeaders:   []string{"E-Tag"},
	}

	engine.Use(gin.Recovery())
	engine.Use(middleware.NewLogging(middleware.WithIgnorePath(skip)))
	engine.Use(cors.New(config))
	engine.Use(otelgin.Middleware(serviceName, otelgin.WithFilter(func(r *http.Request) bool {
		return !slices.Contains(skip, r.URL.Path)
	})))

	engine.GET("/", healtcheck)
	return &Engine{
		Engine: engine,
		srv: &http.Server{
			Addr:    os.Getenv("APPLICATION_ADDRESS"),
			Handler: engine,
		},
	}
}
