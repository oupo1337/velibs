import React, {useState} from 'react';

import DateDisplay from "./Components/DateDisplay";
import DateSlider from './Components/DateSlider';
import StationDrawer from "./Components/StationDrawer";
import VelibMap from './Components/VelibMap';
import VelibTypeRadio from "./Components/VelibTypeRadio";

import './App.css';

function App() {
    const [data, setData] = useState("http://runtheit.com:8080/api/statuses.geojson");
    const [timestamps, setTimestamps] = useState<string[]>([]);
    const [value, setValue] = useState(0);
    const [velibType, setVelibType] = useState('bikes');
    const [stationId, setStationId] = useState<number|null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div>
            <div className="sidebar-container">
                <DateDisplay date={timestamps[value]}/>
                <VelibTypeRadio velibType={velibType} setVelibType={setVelibType} />
                <DateSlider timestamps={timestamps} setTimestamps={setTimestamps} value={value} setValue={setValue} setData={setData} />
            </div>
            <VelibMap data={data} velibType={velibType} setStationId={setStationId} setDrawerOpen={setDrawerOpen}/>
            <StationDrawer stationId={stationId} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}/>
        </div>
    );
}

export default App;
