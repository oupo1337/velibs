-- Revert velib:005_add_geo_indexes from pg

BEGIN;

DROP INDEX paris_administrative_districts_gist;
DROP INDEX paris_boroughs_gist;
DROP INDEX velib_stations_gist;

COMMIT;
