-- Deploy velib:002_bikeways to pg

BEGIN;

CREATE TABLE bikeways (
    typology                TEXT NOT NULL,
    bidirectional           BOOLEAN,
    status                  TEXT,
    direction               TEXT,
    route                   TEXT,
    shape                   GEOMETRY(LINESTRING, 4326) NOT NULL
);

COMMIT;
