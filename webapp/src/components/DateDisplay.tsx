import React from "react";

import Typography from "@mui/material/Typography";

import dayjs from 'dayjs'

interface DateDisplayProps {
    date : Date | undefined
}

const DateDisplay : React.FC<DateDisplayProps> = ({ date }) => {
    return (
        <div className="menu-item">
            <Typography>{dayjs(date).format('dddd D MMMM HH:mm')}</Typography>
        </div>
    );
}

export default DateDisplay;