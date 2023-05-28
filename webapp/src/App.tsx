import React, {useState} from 'react';

import VelibMap from './VelibMap';
import DateDisplay from "./DateDisplay";
import DateSlider from './DateSlider';

import './App.css';

function App() {
    const [data, setData] = useState("http://runtheit.com:8080/api/statuses.geojson");
    const [timestamps, setTimestamps] = useState<string[]>([]);
    const [value, setValue] = useState(0);

    return (
        <div>
            <div className="sidebar-container">
                <DateDisplay date={timestamps[value]}/>
                <DateSlider timestamps={timestamps} setTimestamps={setTimestamps} value={value} setValue={setValue} setData={setData} />
            </div>
            <VelibMap data={data}/>
        </div>
    );
}

export default App;
