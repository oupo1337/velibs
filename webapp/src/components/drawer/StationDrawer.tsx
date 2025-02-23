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

import { 
    useStationsDistribution,
    useStationsInformation,
    useStationsTimeseries
} from "../../hooks/Hooks";

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
            <FormControl sx={{ flex: 1, maxWidth: '70%' }}>
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

    if (isLoading || isPending)
        return <DrawerLoader />;
    if (isError)
        return <DrawerError />;
    return <StackedAreaChart stations={stations} timeseries={data} />;
}

interface DistributionDisplayProps {
    stations: StationInformation[]
}

const DistributionDisplay: React.FC<DistributionDisplayProps> = ({ stations }) => {
    const { isLoading, isError, isPending, data } = useStationsDistribution(stations);

    if (isLoading || isPending)
        return <DrawerLoader />;
    if (isError)
        return <DrawerError />;
    return <DistributionChart data={data} />;
}

interface StationDisplayProps {
    stations: StationInformation[]
}

const StationDisplay: React.FC<StationDisplayProps> = ({ stations }) => {
    const [currentStations, setCurrentStations] = useState(stations);

    return (
        <Stack spacing={4} sx={{ 
            width: '100%', 
            px: 4,
            '& .recharts-wrapper': {  // Target Recharts containers
                width: '100% !important',
                display: 'flex',
                justifyContent: 'center'
            },
            '& .recharts-surface': {  // Target chart SVGs
                width: '100% !important'
            }
        }}>
            <Box sx={{ 
                py: 2,
                width: '100%',
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
            }}>
                <StationLabel stations={stations} setCurrentStations={setCurrentStations} />
            </Box>
            
            <Box sx={{ 
                py: 2,
                width: '100%',
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
            }}>
                <Typography variant="h6" gutterBottom>
                    Evolution temporelle
                </Typography>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <TimeseriesDisplay stations={currentStations} />
                </Box>
            </Box>
            
            <Box sx={{ 
                py: 2,
                width: '100%'
            }}>
                <Typography variant="h6" gutterBottom>
                    Distribution
                </Typography>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <DistributionDisplay stations={currentStations} />
                </Box>
            </Box>
        </Stack>
    );
}

const StationDrawer: React.FC = () => {
    const { isLoading, isError, isPending, data } = useStationsInformation();

    if (isLoading || isPending)
        return <DrawerLoader />;
    if (isError)
        return <DrawerError />;
    return (
        <Box sx={{ 
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            bgcolor: '#ffffff',
            '&::-webkit-scrollbar': {
                width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#bdbdbd',
                borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
                backgroundColor: '#f5f5f5',
            }
        }}>
            <StationDisplay stations={data} />
        </Box>
    );
}

export default StationDrawer;