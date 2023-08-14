import React, {useEffect, useState} from 'react';
import {Outlet, useMatch, useNavigate} from 'react-router-dom';

import {Checkbox, Drawer, FormControlLabel, Paper} from '@mui/material';

import DateDisplay from "./components/DateDisplay";
import DateSlider from './components/DateSlider';
import MenuTitle from './components/MenuTitle';
import VelibMap from './components/VelibMap';
import MapTypeRadio from "./components/MapTypeRadio";

import './App.css';

interface CheckProps {
    checked : boolean
    setChecked : React.Dispatch<React.SetStateAction<boolean>>
}

const Check: React.FC<CheckProps> = ({checked, setChecked}) => {
    const handleChange = (event: any) => {
        setChecked(event.target.checked);
    };
    return (
        <div className="sidebar" style={{flex: 1}}>
            <FormControlLabel
                control={<Checkbox checked={checked} onChange={handleChange} />}
                label="Pistes cyclables"
            />
        </div>
    );
}

function App() {
    const navigate = useNavigate();
    const match = useMatch('/stations/:stationId');
    const [data, setData] = useState({});
    const [bikeWays, setBikeWays] = useState({});
    const [timestamps, setTimestamps] = useState<Date[]>([]);
    const [value, setValue] = useState(0);
    const [mapType, setMapType] = useState('points');
    const [displayBikeWays, setDisplayBikeWays] = React.useState(false);

    const drawerOpen = Boolean(match);

    const handleClose = () => {
        navigate('/');
    }

    useEffect(() => {
        fetch(`https://api.velib.runtheit.com/api/statuses.geojson`)
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error(error));

        fetch(`https://api.velib.runtheit.com/api/v1/bikeways`)
            .then(response => response.json())
            .then(data => setBikeWays(data))
            .catch(error => console.error(error))
    }, [])

    return (
        <>
            <Paper elevation={3} className="sidebar-container">
                <MenuTitle />
                <MapTypeRadio mapType={mapType} setMapType={setMapType} />
                <Check checked={displayBikeWays} setChecked={setDisplayBikeWays} />
                <DateDisplay date={timestamps[value]}/>
                <DateSlider timestamps={timestamps} setTimestamps={setTimestamps} value={value} setValue={setValue} setData={setData} />
            </Paper>

            <VelibMap data={data} bikeWays={bikeWays} displayBikeWays={displayBikeWays} mapType={mapType}/>

            <Drawer anchor='right' open={drawerOpen} onClose={handleClose}>
                <Outlet />
            </Drawer>
        </>
    );
}

export default App;
