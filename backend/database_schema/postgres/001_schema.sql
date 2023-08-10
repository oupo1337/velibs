BEGIN;

CREATE TABLE stations (
    id          BIGINT PRIMARY KEY,
    capacity    INTEGER NOT NULL,
    latitude    DECIMAL NOT NULL,
    longitude   DECIMAL NOT NULL,
    name        TEXT NOT NULL
);

CREATE TABLE statuses (
    timestamp   TIMESTAMP NOT NULL,
    station_id  BIGINT REFERENCES stations(id),
    mechanical  INTEGER NOT NULL,
    electric    INTEGER NOT NULL
);

CREATE TABLE bike_ways (
    typology                TEXT NOT NULL;
    bidirectional           BOOLEAN;
    speed_regime            TEXT;
    direction               TEXT;
    route                   TEXT;
    arrondissement          INTEGER;
    forest                  BOOLEAN;
    length                  DECIMAL NOT NULL;
    length_kilometers       DECIMAL NOT NULL
    position                TEXT;
    forbidden_circulation   TEXT;
    piste                   TEXT;
    bus_lane                TEXT;
    type_continuity         TEXT;
    network                 TEXT;
    date                    DATE;
    geo_shape               JSONB NOT NULL;
);

CREATE INDEX statuses_station_id_timestamp_idx ON statuses (station_id, timestamp DESC);
CREATE INDEX statuses_timestamp_idx ON statuses (timestamp);

COMMIT;