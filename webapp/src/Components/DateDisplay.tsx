import React from "react";

import dayjs from 'dayjs'

interface DateDisplayProps {
    date : string
}

const DateDisplay : React.FC<DateDisplayProps> = ({ date }) => {
    return (
        <div className="sidebar">
            {dayjs(date).format('D MMMM hh:mm')}
        </div>
    );
}

export default DateDisplay;