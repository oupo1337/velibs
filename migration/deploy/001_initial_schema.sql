-- Deploy velib:001_initial_schema to pg

BEGIN;

CREATE TABLE stations (
    id          BIGINT PRIMARY KEY,
    name        TEXT NOT NULL,
    capacity    INTEGER NOT NULL,
    position    GEOMETRY(POINT, 4326) NOT NULL
);

CREATE TABLE statuses (
    timestamp   TIMESTAMP NOT NULL,
    station_id  BIGINT REFERENCES stations(id),
    mechanical  INTEGER NOT NULL,
    electric    INTEGER NOT NULL
);

CREATE INDEX statuses_station_id_timestamp_idx ON statuses (station_id, timestamp DESC);
CREATE INDEX statuses_timestamp_idx ON statuses (timestamp);
CREATE INDEX statuses_station_id_idx ON statuses (station_id);

COMMIT;
