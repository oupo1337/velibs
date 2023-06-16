import React, {useState} from 'react';

import {Station} from "./domain/Domain";

import DateDisplay from "./components/DateDisplay";
import DateSlider from './components/DateSlider';
import StationDrawer from "./components/StationDrawer";
import VelibMap from './components/VelibMap';
import VelibTypeRadio from "./components/VelibTypeRadio";

import './App.css';
import { Box, Paper, Typography } from '@mui/material';

function App() {
    const [data, setData] = useState("http://runtheit.com:8080/api/statuses.geojson");
    const [timestamps, setTimestamps] = useState<string[]>([]);
    const [value, setValue] = useState(0);
    const [velibType, setVelibType] = useState('bikes');
    const [station, setStation] = useState<Station|null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <React.Fragment>
            <Paper elevation={3} className="sidebar-container">
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                    <img src="https://i.imgur.com/d0VNuqq.png" alt='logo' style={{maxHeight: '5rem', width: '5rem'}} />
                    <Typography variant="h4" component="h1">
                        Paname Velibs
                    </Typography>
                </Box>
                <VelibTypeRadio velibType={velibType} setVelibType={setVelibType} />
                <DateDisplay date={timestamps[value]}/>
                <DateSlider timestamps={timestamps} setTimestamps={setTimestamps} value={value} setValue={setValue} setData={setData} />
            </Paper>
            <VelibMap data={data} velibType={velibType} setStation={setStation} setDrawerOpen={setDrawerOpen}/>
            <StationDrawer station={station} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}/>
        </React.Fragment>
    );
}

export default App;
