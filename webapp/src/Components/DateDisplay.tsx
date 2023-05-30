import React from "react";

import dayjs from 'dayjs'

interface DateDisplayProps {
    date : string
}

const DateDisplay : React.FC<DateDisplayProps> = ({ date }) => {
    const displayDate = () : string => dayjs(date).format('D MMMM YYYY hh:mm')

    return (
        <div className="sidebar">
            {displayDate()}
        </div>
    );
}

export default DateDisplay;