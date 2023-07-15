import React, { useState } from 'react';

import DateDisplay from "./components/DateDisplay";
import DateSlider from './components/DateSlider';
import MenuTitle from './components/MenuTitle';
import VelibMap from './components/VelibMap';
import VelibTypeRadio from "./components/VelibTypeRadio";

import { Drawer, Paper } from '@mui/material';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';

import './App.css';

function App() {
    const navigate = useNavigate();
    const match = useMatch('/:stationId');
    const [data, setData] = useState("http://runtheit.com:8080/api/statuses.geojson");
    const [timestamps, setTimestamps] = useState<Date[]>([]);
    const [value, setValue] = useState(0);
    const [velibType, setVelibType] = useState('bikes');

    const drawerOpen = Boolean(match);

    const handleClose = () => {
        navigate('/');
    }

    return (
        <React.Fragment>
            <Paper elevation={3} className="sidebar-container">
                <MenuTitle />
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
