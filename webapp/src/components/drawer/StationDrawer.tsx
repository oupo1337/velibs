import React, { useState } from "react";

import Box from "@mui/material/Box/Box";
import FormControl from "@mui/material/FormControl/FormControl";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select/Select";
import Stack from "@mui/material/Stack/Stack";
import Typography from "@mui/material/Typography/Typography";

import { StationInformation } from "../../domain/Domain";

import { DrawerError, DrawerLoader } from "./DrawerUtils";
import StackedAreaChart from "../charts/StackedAreaChart";
import DistributionChart from "../charts/DistributionChart";

import { useStationsDistribution, useStationsInformation, useStationsTimeseries } from "../../hooks/Velib";

interface StationLabelProps {
    stations: StationInformation[]
    setCurrentStations: React.Dispatch<React.SetStateAction<StationInformation[]>>
}

const StationLabel: React.FC<StationLabelProps> = ({ stations, setCurrentStations }) => {
    if (stations.length === 1) {
        return (
            <Typography variant="h4" component="h2" sx={{textAlign: 'center'}}>
                { stations[0].name }
            </Typography>
        );
    }

    const handleChange = (event: SelectChangeEvent) => {
        if (event.target.value === "all") {
            console.log('all');
            setCurrentStations(stations);
            return
        }

        const station = stations.find((station) => station.station_id.toString() == event.target.value);
        if (station === undefined) {
            return
        }

        setCurrentStations([station]);
    };

    return (
        <Stack justifyContent="space-evenly" direction="row" spacing={2}>
            <Typography variant="h4" component="h2" sx={{textAlign: 'center'}}>
                { stations.length } stations
            </Typography>
            <FormControl style={{minWidth: 600}}>
                <InputLabel>Station</InputLabel>
                <Select label="Station" defaultValue={"all"} onChange={handleChange}>
                    <MenuItem key={0} value={"all"}>Toutes les stations</MenuItem> 
                    {stations.map((station, index) => <MenuItem key={index+1} value={station.station_id}>{station.name}</MenuItem>)}
                </Select>
            </FormControl>
        </Stack>
    );
}

interface TimeseriesDisplay {
    stations: StationInformation[]
}

const TimeseriesDisplay: React.FC<TimeseriesDisplay> = ({ stations }) => {
    const { isLoading, isError, isPending, data } = useStationsTimeseries(stations);
    if (isLoading || isPending) {
        return <DrawerLoader />;
    }
    if (isError) {
        return <DrawerError />;
    }
    return <StackedAreaChart stations={stations} timeseries={data} />;
}

interface DistributionDisplayProps {
    stations: StationInformation[]
}

const DistributionDisplay: React.FC<DistributionDisplayProps> = ({ stations }) => {
    const { isLoading, isError, isPending, data } = useStationsDistribution(stations);
    if (isLoading || isPending) {
        return <DrawerLoader />;
    }
    if (isError) {
        return <DrawerError />;
    }
    return <DistributionChart data={data} />;
}

interface StationDisplayProps {
    stations: StationInformation[]
}

const StationDisplay: React.FC<StationDisplayProps> = ({ stations }) => {
    const [currentStations, setCurrentStations] = useState(stations);

    return (
        <>
            <StationLabel stations={stations} setCurrentStations={setCurrentStations} />
            <TimeseriesDisplay stations={currentStations} />
            <DistributionDisplay stations={currentStations} />
        </>
    );
}

const StationDrawer: React.FC = () => {
    const { isLoading, isError, isPending, data } = useStationsInformation();
    if (isLoading || isPending) {
        return <DrawerLoader />;
    }
    if (isError) {
        return <DrawerError />;
    }

    return (
        <Box style={{ flex: 1, width: '80vw', paddingTop: '4rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'space-between' }}>
            <StationDisplay stations={data} />
        </Box>
    );
}

export default StationDrawer;