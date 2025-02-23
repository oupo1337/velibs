import { useState, useEffect } from 'react';
import axios from 'axios';

import { API_URL } from '../configuration/Configuration';

import { StationGeoJSON } from '../domain/Domain';
import toaster from '../toaster/Toaster';

export const useStations = (timestamp: Date | undefined) => {
    const [stations, setStations] = useState<StationGeoJSON>([]);

    useEffect(() => {
        if (timestamp === undefined) {
            return;
        }

        axios.get(`${API_URL}/api/v1/stations.geojson?timestamp=${timestamp.toISOString()}`)
            .then(response => setStations(response.data.features))
            .catch(error => toaster.displayError("Une erreur est survenue lors du chargement des stations Velib'.", error));
    }, [timestamp]);

    return stations;
};