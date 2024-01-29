-- Revert velib:002_bicycle_path from pg

BEGIN;

DROP TABLE bikeways;

COMMIT;
