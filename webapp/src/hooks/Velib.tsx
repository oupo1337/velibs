import axios from "axios";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Distribution, StationInformation, Timeseries } from "../domain/Domain";

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