-- Revert velib:003_administrative_districts from pg

BEGIN;

DROP TABLE administrative_districts;

COMMIT;
