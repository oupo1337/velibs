-- Revert velib:001_initial_schema from pg

BEGIN;

DROP TABLE stations;
DROP TABLE statuses;

COMMIT;
