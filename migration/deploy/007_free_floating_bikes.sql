BEGIN;

CREATE TABLE free_floating_bikes (
    timestamp               TIMESTAMP NOT NULL,
    bike_id                 UUID NOT NULL,
    position                GEOMETRY(POINT, 4326) NOT NULL,
    is_reserved             BOOLEAN NOT NULL,
    is_disabled             BOOLEAN NOT NULL,
    current_range_meters    INTEGER NOT NULL,
    vehicle_type_id         TEXT NOT NULL,
    last_reported           TIMESTAMP NOT NULL,
    vehicle_type            TEXT NOT NULL
);

CREATE INDEX free_floating_bikes_timestamp_idx ON free_floating_bikes (timestamp);
CREATE INDEX free_floating_bikes_bike_id_idx ON free_floating_bikes (bike_id);
CREATE INDEX free_floating_bikes_bike_timestamp_id_idx ON free_floating_bikes (timestamp, bike_id);

COMMIT;