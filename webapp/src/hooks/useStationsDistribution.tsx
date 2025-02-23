import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Distribution, StationInformation } from "../domain/Domain";

import { API_URL } from "../configuration/Configuration";

export const useStationsDistribution = (stations: StationInformation[]) => {
    const stationsIDs = stations.map((station) => station.station_id);
    const fetchStationDistribution = async () => {
        const response = await axios.get(`${API_URL}/api/v1/distributions`, { params: { ids: stationsIDs }});
        return response.data;
    };

    return useQuery<Distribution[], Error>({
        queryKey: ['velib_stations_distribution', stationsIDs],
        queryFn: fetchStationDistribution,
    });
};