import { useState, useEffect } from 'react';
import axios from 'axios';

import { API_URL } from '../configuration/Configuration';

import { BikeLanesGeoJSON } from '../domain/Domain';
import toaster from '../toaster/Toaster';

export const useBikeLanes = (): BikeLanesGeoJSON => {
    const [bikeLanes, setBikeLanes] = useState<BikeLanesGeoJSON>([]);

    useEffect(() => {
        const fetchBikeLanes = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/v1/bikelanes.geojson`);
                setBikeLanes(response.data.features);
            } catch (error) {
                toaster.displayError("Une erreur est survenue lors du chargement des pistes cyclables.", error as Error);
            }
        };

        fetchBikeLanes();
    }, []);

    return bikeLanes;
};