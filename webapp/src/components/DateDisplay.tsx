import React from "react";

import dayjs from 'dayjs'
import { Typography } from "@mui/material";

interface DateDisplayProps {
    date : Date
}

const DateDisplay : React.FC<DateDisplayProps> = ({ date }) => {
    return (
        <div className="sidebar">
            <Typography>{dayjs(date).format('dddd D MMMM HH:mm')}</Typography>
        </div>
    );
}

export default DateDisplay;