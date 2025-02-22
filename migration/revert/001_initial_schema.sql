-- Revert velib:001_initial_schema from pg

BEGIN;

DROP TABLE statuses;
DROP TABLE stations;

COMMIT;
