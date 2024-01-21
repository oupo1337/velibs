import React from "react";

import axios from "axios";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
import Typography from "@mui/material/Typography";

import { Distribution, Station } from "../../domain/Domain";

import StackedAreaChart from "./StackedAreaChart";
import DistributionChart from "./DistributionChart";

const DrawerLoader = () => {
    return (
        <Box style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={200}/>
        </Box>
    );
}

const DrawerError = () => {
    return (
        <Box style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Impossible de charger les données.</p>
        </Box>
    );
}

interface StationProps {
    stationID: string | undefined
}

const StationDisplay: React.FC<StationProps> = ({stationID}) => {
    const fetchStation = async () => {
        const response = await axios.get(`https://api.velib.runtheit.com/api/stations/${stationID}`);
        return response.data;
    }

    const { isLoading, isError, isPending, data } = useQuery<Station, Error>({
        queryKey: ['station', stationID],
        queryFn: fetchStation,
    });

    if (isLoading || isPending) {
        return <DrawerLoader />
    }

    if (isError) {
        return <DrawerError />
    }

    return (
        <>
            <Typography variant="h4" component="h2" sx={{textAlign: 'center'}}>
                { data.name }
            </Typography>
            <StackedAreaChart data={data} />
        </>
    );
}

const DistributionDisplay: React.FC<StationProps> = ({stationID}) => {
    const fetchStationDistribution = async () => {
        const response = await axios.get(`https://api.velib.runtheit.com/api/v1/distributions/${stationID}`);
        return response.data;
    }

    const { isLoading, isError, isPending, data } = useQuery<Distribution[], Error>({
        queryKey: ['station_distribution', stationID],
        queryFn: fetchStationDistribution,
    });

    if (isLoading || isPending) {
        return <DrawerLoader />
    }

    if (isError) {
        return <DrawerError />
    }

    return (
        <DistributionChart data={data} />
    );
}

const StationDrawer: React.FC = () => {
    const { stationId } = useParams();

    return (
        <Box style={{ flex: 1, width: '80vw', paddingTop: '4rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'space-between' }}>
            <StationDisplay stationID={stationId} />
            <DistributionDisplay stationID={stationId} />
        </Box>
    );
}

export default StationDrawer;
