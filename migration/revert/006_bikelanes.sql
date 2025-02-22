-- Revert velib:006_bikelanes from pg

BEGIN;

CREATE TABLE bikeways (
    typology                TEXT NOT NULL,
    bidirectional           BOOLEAN,
    status                  TEXT,
    direction               TEXT,
    route                   TEXT,
    shape                   GEOMETRY(LINESTRING, 4326) NOT NULL
);

DROP TABLE bikelanes;

COMMIT;
