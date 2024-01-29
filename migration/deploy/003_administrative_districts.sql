-- Deploy velib: 003_administrative_districts to pg

BEGIN;

CREATE TABLE administrative_districts (
    name    TEXT NOT NULL, 
    shape   GEOMETRY(POLYGON, 4326) NOT NULL
);

COMMIT;
