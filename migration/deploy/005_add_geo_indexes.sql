-- Deploy velib:005_add_geo_indexes to pg

BEGIN;

CREATE INDEX paris_administrative_districts_gist ON administrative_districts USING GIST (shape);
CREATE INDEX paris_boroughs_gist ON boroughs USING GIST (shape);
CREATE INDEX velib_stations_gist ON stations USING GIST (position);

COMMIT;
