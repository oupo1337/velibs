import React from "react";

import Typography from "@mui/material/Typography";

import dayjs from 'dayjs'

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