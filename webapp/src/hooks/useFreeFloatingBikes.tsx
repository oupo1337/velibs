import { useState, useEffect } from 'react';
import axios from 'axios';

import { API_URL } from '../configuration/Configuration';

import { StationGeoJSON } from '../domain/Domain';
import toaster from '../toaster/Toaster';

export const useFreeFloatingBikes = (timestamp: Date | undefined) => {
    const [freeFloatingBikes, setFreeFloatingBikes] = useState<StationGeoJSON>([]);

    useEffect(() => {
        if (timestamp === undefined) {
            return;
        }

        axios.get(`${API_URL}/api/v1/freefloatingbikes.geojson?timestamp=${timestamp.toISOString()}`)
            .then(response => setFreeFloatingBikes(response.data.features))
            .catch(error => toaster.displayError("Une erreur est survenue lors du chargement des Vélos Lime'.", error));
    }, [timestamp]);

    return freeFloatingBikes;
};