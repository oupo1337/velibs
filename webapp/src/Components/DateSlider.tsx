import React, {useEffect} from "react";

import Slider from "@mui/material/Slider";

interface DateSliderProps {
    setTimestamps : React.Dispatch<React.SetStateAction<string[]>>
    timestamps : string[]
    value : number
    setValue : React.Dispatch<React.SetStateAction<number>>
    setData : React.Dispatch<React.SetStateAction<string>>
}

const DateSlider: React.FC<DateSliderProps> = ({ setTimestamps, timestamps, value, setValue, setData }) => {
    useEffect(() => {
        fetch('http://runtheit.com:8080/api/timestamps')
            .then(response => response.json())
            .then(data => {
                setTimestamps(data||[]);
                setValue(data.length -1);
            })
            .catch(error => console.error(error));
    }, [setTimestamps, setValue]);

    const handleChange = (_ : Event, value : number | number[]) => {
        const newValue = value as number;
        const timestamp = timestamps[newValue];

        setValue(newValue);
        setData(`http://runtheit.com:8080/api/statuses.geojson?timestamp=${timestamp}`);
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