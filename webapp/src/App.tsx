import React, {useEffect, useState} from 'react';
import {Outlet, useMatch, useNavigate} from 'react-router-dom';

import {Drawer, Paper} from '@mui/material';

import DateDisplay from "./components/DateDisplay";
import DateSlider from './components/DateSlider';
import MenuTitle from './components/MenuTitle';
import VelibMap from './components/VelibMap';
import MapTypeRadio from "./components/MapTypeRadio";
import VelibTypeRadio from "./components/VelibTypeRadio";

import './App.css';

function App() {
    const navigate = useNavigate();
    const match = useMatch('/:stationId');
    const [data, setData] = useState({});
    const [timestamps, setTimestamps] = useState<Date[]>([]);
    const [value, setValue] = useState(0);
    const [velibType, setVelibType] = useState('bikes');
    const [mapType, setMapType] = useState('points');

    const drawerOpen = Boolean(match);

    const handleClose = () => {
        navigate('/');
    }

    useEffect(() => {
        fetch('http://runtheit.com:8080/api/statuses.geojson')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error(error));
    }, [])

    return (
        <>
            <Paper elevation={3} className="sidebar-container">
                <MenuTitle />
                <MapTypeRadio mapType={mapType} setMapType={setMapType} />
                <VelibTypeRadio velibType={velibType} setVelibType={setVelibType} />
                <DateDisplay date={timestamps[value]}/>
                <DateSlider timestamps={timestamps} setTimestamps={setTimestamps} value={value} setValue={setValue} setData={setData} />
            </Paper>

            <VelibMap data={data} velibType={velibType} mapType={mapType}/>

            <Drawer anchor='right' open={drawerOpen} onClose={handleClose}>
                <Outlet />
            </Drawer>
        </>
    );
}

export default App;
