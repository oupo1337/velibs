import React, {useState} from 'react';

import DateDisplay from "./components/DateDisplay";
import DateSlider from './components/DateSlider';
import VelibMap from './components/VelibMap';
import VelibTypeRadio from "./components/VelibTypeRadio";

import './App.css';
import { Box, Drawer, Paper, Typography } from '@mui/material';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';

function App() {
    const navigate = useNavigate();
    const match = useMatch('/:stationId');
    const [data, setData] = useState("http://runtheit.com:8080/api/statuses.geojson");
    const [timestamps, setTimestamps] = useState<string[]>([]);
    const [value, setValue] = useState(0);
    const [velibType, setVelibType] = useState('bikes');

    const drawerOpen = Boolean(match);

    const handleClose = () => {
        navigate('/');
    }

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
            <VelibMap data={data} velibType={velibType} />

            <Drawer anchor='right' open={drawerOpen} onClose={handleClose}>
                <Outlet />
            </Drawer>
        </React.Fragment>
    );
}

export default App;
