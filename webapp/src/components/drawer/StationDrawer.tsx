import React from "react";

import axios from "axios";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Box from "@mui/material/Box/Box";
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';
import FormControl from "@mui/material/FormControl/FormControl";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Select from "@mui/material/Select/Select";
import Typography from "@mui/material/Typography/Typography";

import { Distribution, Station, StationInformation } from "../../domain/Domain";

import StackedAreaChart from "../charts/StackedAreaChart";
import DistributionChart from "../charts/DistributionChart";

import { API_URL } from "../../configuration/Configuration";


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

interface StationLabelProps {
    stations: StationInformation[]
}

const StationLabel: React.FC<StationLabelProps> = ({ stations }) => {
    if (stations.length === 1) {
        return (
            <Typography variant="h4" component="h2" sx={{textAlign: 'center'}}>
                { stations[0].name }
            </Typography>
        );
    }

    return (
        <FormControl margin="normal">
            <InputLabel>Station</InputLabel>
            <Select label="Station">
                {stations.map((station, index) => <MenuItem key={index} value={station.id}>{station.name}</MenuItem>)}
            </Select>
        </FormControl>
    );
}

interface StationProps {
    ids: string[]
}

const StationDisplay: React.FC<StationProps> = ({ ids }) => {
    const fetchStation = async () => {
        const response = await axios.get(`${API_URL}/api/v1/stations`, { params: { ids: ids }});
        return response.data;
    }

    const { isLoading, isError, isPending, data } = useQuery<Station, Error>({
        queryKey: ['stations', ids],
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
            <StationLabel stations={data.stations} />
            <StackedAreaChart data={data} />
        </>
    );
}

const DistributionDisplay: React.FC<StationProps> = ({ ids }) => {
    const fetchStationDistribution = async () => {
        const response = await axios.get(`${API_URL}/api/v1/distributions`, { params: { ids: ids }});
        return response.data;
    }

    const { isLoading, isError, isPending, data } = useQuery<Distribution[], Error>({
        queryKey: ['station_distribution', ids],
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
    const { search } = useLocation();
    const ids = new URLSearchParams(search).getAll('ids');

    return (
        <Box style={{ flex: 1, width: '80vw', paddingTop: '4rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'space-between' }}>
            <StationDisplay ids={ids} />
            <DistributionDisplay ids={ids} />
        </Box>
    );
}

export default StationDrawer;