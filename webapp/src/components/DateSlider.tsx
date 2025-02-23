import React from "react";

import dayjs from 'dayjs'

import Divider from "@mui/material/Divider";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

import { useTimestamps } from '../hooks/Hooks';

interface DateSliderProps {
    date : Date | undefined;
    setTimestamp: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

const DateSlider: React.FC<DateSliderProps> = ({ date, setTimestamp }) => {
    const { timestamps, currentIndex, setCurrentIndex } = useTimestamps(setTimestamp);

    const handleChange = (_ : Event, value : number | number[]) => {
        const newValue = value as number;
        setCurrentIndex(newValue);
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
                value={currentIndex}
                onChange={handleChange}
                step={1}
                min={0}
                max={timestamps.length - 1}
            />
        </div>
    );
}

export default DateSlider;