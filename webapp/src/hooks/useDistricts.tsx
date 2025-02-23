import { useState, useEffect } from 'react';
import axios from 'axios';

import { API_URL } from '../configuration/Configuration';

import { DistrictFeature, DistrictFeatureCollection } from '../domain/Domain';
import toaster from '../toaster/Toaster';

interface DistrictsData {
    districts: DistrictFeature[];
    districtsMin: number;
    districtsMax: number;
}

export const useDistricts = (timestamp: Date | undefined): DistrictsData => {
    const [districts, setDistricts] = useState<DistrictFeature[]>([]);
    const [districtsMin, setDistrictsMin] = useState(0);
    const [districtsMax, setDistrictsMax] = useState(0);

    useEffect(() => {
        if (timestamp === undefined) {
            return;
        }

        axios.get<DistrictFeatureCollection>(`${API_URL}/api/v1/districts.geojson?timestamp=${timestamp.toISOString()}`)
            .then(response => {
                const velibCount = response.data.features.map(f => f.properties.mechanical + f.properties.electric);

                setDistrictsMin(Math.min(...velibCount));
                setDistrictsMax(Math.max(...velibCount));
                setDistricts(response.data.features);
            })
            .catch(error => toaster.displayError("Une erreur est survenue lors du chargement des quartiers.", error));
    }, [timestamp]);

    return { districts, districtsMin, districtsMax };
};