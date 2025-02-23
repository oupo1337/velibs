import { useState, useEffect } from 'react';
import axios from 'axios';

import { API_URL } from '../configuration/Configuration';

import { DistrictFeatureCollection, DistrictFeature } from '../domain/Domain';

import toaster from '../toaster/Toaster';

interface BoroughsData {
    boroughs: DistrictFeature[];
    boroughsMin: number;
    boroughsMax: number;
}

export const useBoroughs = (timestamp: Date | undefined): BoroughsData => {
    const [boroughs, setBoroughs] = useState<DistrictFeature[]>([]);
    const [boroughsMin, setBoroughsMin] = useState(0);
    const [boroughsMax, setBoroughsMax] = useState(0);

    useEffect(() => {
        if (timestamp === undefined) {
            return;
        }

        axios.get<DistrictFeatureCollection>(`${API_URL}/api/v1/boroughs.geojson?timestamp=${timestamp.toISOString()}`)
            .then(response => {
                const velibCount = response.data.features.map(f => f.properties.mechanical + f.properties.electric);

                setBoroughsMax(Math.max(...velibCount));
                setBoroughsMin(Math.min(...velibCount));
                setBoroughs(response.data.features);
            })
            .catch(error => toaster.displayError("Une erreur est survenue lors du chargement des arrondissements.", error));
    }, [timestamp]);

    return { boroughs, boroughsMin, boroughsMax };
};