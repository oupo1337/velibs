import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { StationInformation, Timeseries } from "../domain/Domain";

import { API_URL } from "../configuration/Configuration";

export const useStationsTimeseries = (stations: StationInformation[]) => {
    const stationsIDs = stations.map((station) => station.station_id);
    const fetchTimeseries = async () => {
        const response = await axios.get(`${API_URL}/api/v1/timeseries`, { params: { ids: stationsIDs }});
        return response.data;
    };

    return useQuery<Timeseries[], Error>({
        queryKey: ['velib_stations_timeseries', stationsIDs],
        queryFn: fetchTimeseries,
    });
};