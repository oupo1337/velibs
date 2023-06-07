import React from "react";

import dayjs from 'dayjs'
import { Typography } from "@mui/material";

interface DateDisplayProps {
    date : string
}

const DateDisplay : React.FC<DateDisplayProps> = ({ date }) => {
    return (
        <div className="sidebar">
            <Typography>{dayjs(date).format('D MMMM hh:mm')}</Typography>
        </div>
    );
}

export default DateDisplay;