BEGIN;

CREATE MATERIALIZED VIEW stations_distribution AS
    SELECT
        station_id,
        EXTRACT(HOUR FROM timestamp),
        EXTRACT(MINUTE FROM timestamp),
        AVG(mechanical),
        AVG(electric)
    FROM statuses
    GROUP BY EXTRACT(HOUR FROM timestamp), EXTRACT(MINUTE FROM timestamp)
    ORDER BY EXTRACT(HOUR FROM timestamp), EXTRACT(MINUTE FROM timestamp);

COMMIT;