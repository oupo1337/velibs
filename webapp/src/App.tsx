import React, {useState} from 'react';

import DateDisplay from "./Components/DateDisplay";
import DateSlider from './Components/DateSlider';
import VelibMap from './Components/VelibMap';
import VelibTypeRadio from "./Components/VelibTypeRadio";

import './App.css';

function App() {
    const [data, setData] = useState("http://runtheit.com:8080/api/statuses.geojson");
    const [timestamps, setTimestamps] = useState<string[]>([]);
    const [value, setValue] = useState(0);
    const [velibType, setVelibType] = useState('bikes');

    return (
        <div>
            <div className="sidebar-container">
                <DateDisplay date={timestamps[value]}/>
                <VelibTypeRadio velibType={velibType} setVelibType={setVelibType} />
                <DateSlider timestamps={timestamps} setTimestamps={setTimestamps} value={value} setValue={setValue} setData={setData} />
            </div>
            <VelibMap data={data} velibType={velibType}/>
        </div>
    );
}

export default App;
