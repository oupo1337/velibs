import React, { useEffect, useState } from "react";

import dayjs from 'dayjs'

import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

import { API_URL } from "../configuration/Configuration";
import Divider from "@mui/material/Divider";

interface DateSliderProps {
    date : Date | undefined;
    setTimestamp: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

const DateSlider: React.FC<DateSliderProps> = ({ date, setTimestamp }) => {
    const [timestamps, setTimestamps] = useState<Date[]>([]);
    const [value, setValue] = useState(0);

    useEffect(() => {
        fetch(`${API_URL}/api/v2/timestamps`)
            .then(response => response.json())
            .then(data => {
                const interval = 10;
                const max = new Date(data.max);
                let timestamp = new Date(data.min);
                
                const timestamps : Date[] = [];
                while (timestamp <= max) {
                    timestamps.push(timestamp);
                    timestamp = new Date(timestamp.getTime() + interval*60*1000);
                }

                setTimestamps(timestamps);
                setValue(timestamps.length - 1);
                setTimestamp(max);
            })
            .catch(error => console.error(error));
    }, [setTimestamp]);

    const handleChange = (_ : Event, value : number | number[]) => {
        const newValue = value as number;

        setValue(newValue);
        setTimestamp(timestamps[newValue]);
    }

    return (
        <div className="menu-item" style={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 1, fontWeight: 'medium' }}>
                Date
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>{dayjs(date).format('dddd D MMMM HH:mm')}</Typography>
            <Slider
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