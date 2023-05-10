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