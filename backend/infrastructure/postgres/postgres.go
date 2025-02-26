package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/exaring/otelpgx"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Configuration struct {
	Username string
	Password string
	Address  string
	Name     string
}

type Database struct {
	conn *pgxpool.Pool
}

func New(conf Configuration) (*Database, error) {
	connString := fmt.Sprintf("postgres://%s:%s@%s/%s", conf.Username, conf.Password, conf.Address, conf.Name)

	cfg, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("create connection pool error: %w", err)
	}
	cfg.ConnConfig.Tracer = otelpgx.NewTracer()

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	conn, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("connect to database error: %w", err)
	}

	if err := conn.Ping(ctx); err != nil {
		return nil, fmt.Errorf("conn.Ping error: %w", err)
	}

	return &Database{
		conn: conn,
	}, nil
}
