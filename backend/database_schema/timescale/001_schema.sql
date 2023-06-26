BEGIN;

CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE stations (
    id          BIGINT PRIMARY KEY,
    capacity    INTEGER NOT NULL,
    latitude    DECIMAL NOT NULL,
    longitude   DECIMAL NOT NULL,
    name        TEXT NOT NULL
);

CREATE TABLE statuses (
    timestamp   TIMESTAMPTZ NOT NULL,
    station_id  BIGINT REFERENCES stations(id),
    mechanical  INTEGER NOT NULL,
    electric    INTEGER NOT NULL
);

SELECT create_hypertable('statuses', 'timestamp');

CREATE INDEX ON statuses (station_id, timestamp DESC);

COMMIT;

