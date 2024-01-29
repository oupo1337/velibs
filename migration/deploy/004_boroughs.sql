-- Deploy velib:004_boroughs to pg

BEGIN;

CREATE TABLE boroughs (
    name    TEXT NOT NULL,
    label   TEXT NOT NULL,
    shape   GEOMETRY(POLYGON, 4326) NOT NULL
);

COMMIT;
