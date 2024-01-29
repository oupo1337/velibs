-- Revert velib:004_boroughs from pg

BEGIN;

DROP TABLE boroughs;

COMMIT;
