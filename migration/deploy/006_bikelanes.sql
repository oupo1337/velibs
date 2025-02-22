-- Deploy velib:006_bikelanes to pg

BEGIN;

CREATE TABLE bikelanes (
    OSMID                       INTEGER NOT NULL,
    name                        TEXT NOT NULL,
    amenagement                 TEXT NOT NULL,
    cote_amenagement            TEXT NOT NULL,
    sens                        TEXT NOT NULL,
    surface                     TEXT NOT NULL,
    arrondissement              TEXT NOT NULL,
    bois                        BOOLEAN NOT NULL,
    coronapiste                 BOOLEAN NOT NULL,
    amenagement_temporaire      BOOLEAN NOT NULL,
    infrastructure_bidirection  BOOLEAN NOT NULL,
    voie_a_sens_unique          BOOLEAN NOT NULL,
    position_amenagement        TEXT NOT NULL,
    vitesse_maximale_autorisee  TEXT NOT NULL,
    shape                       GEOMETRY NOT NULL
);

DROP TABLE bikeways;

COMMIT;