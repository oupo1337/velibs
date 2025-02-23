import axios from "axios";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { StationInformation } from "../domain/Domain";

import { API_URL } from "../configuration/Configuration";

export const useStationsInformation = () => {
    const { search } = useLocation();
    const stationIDs = new URLSearchParams(search).getAll('ids');

    const fetchStationsInformation = async () => {
        const response = await axios.get(`${API_URL}/api/v1/stations`, { params: { ids: stationIDs }});
        return response.data;
    };

    return useQuery<StationInformation[], Error>({
        queryKey: ['velib_stations_information', stationIDs],
        queryFn: fetchStationsInformation,
    });
};