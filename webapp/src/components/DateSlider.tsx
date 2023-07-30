import React, {useEffect} from "react";

import Slider from "@mui/material/Slider";

interface DateSliderProps {
    setTimestamps : React.Dispatch<React.SetStateAction<Date[]>>
    timestamps : Date[]
    value : number
    setValue : React.Dispatch<React.SetStateAction<number>>
    setData : React.Dispatch<React.SetStateAction<string>>
}

const DateSlider: React.FC<DateSliderProps> = ({ setTimestamps, timestamps, value, setValue, setData }) => {
    useEffect(() => {
        fetch('http://runtheit.com:8080/api/v2/timestamps')
            .then(response => response.json())
            .then(data => {
                const minutes = 10;
                const max = new Date(data.max);
                let timestamp = new Date(data.min);

                const timestamps : Date[] = [];
                while (timestamp <= max) {
                    timestamps.push(timestamp);
                    timestamp = new Date(timestamp.getTime() + minutes*60*1000);
                }

                setTimestamps(timestamps);
                setValue(timestamps.length -1);
            })
            .catch(error => console.error(error));
    }, [setTimestamps, setValue])

    const handleChange = (_ : Event, value : number | number[]) => {
        const newValue = value as number;
        const timestamp = timestamps[newValue].toISOString();

        setValue(newValue);
        fetch(`http://runtheit.com:8080/api/statuses.geojson?timestamp=${timestamp}`)
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error(error));
    }

    return (
        <div className="sidebar" style={{flex: 1}}>
            <Slider
                aria-label="Temperature"
                valueLabelDisplay="off"
                value={value}
                onChange={handleChange}
                step={1}
                min={0}
                max={timestamps.length - 1}
            />
        </div>
    );
}

export default DateSlider;