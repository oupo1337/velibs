import { useState, useEffect } from 'react';
import { API_URL } from "../configuration/Configuration";
import toaster from '../toaster/Toaster';
import axios from 'axios';

interface UseTimestampsResult {
    timestamps: Date[];
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
}

export const useTimestamps = (
    onTimestampChange: (timestamp: Date) => void
): UseTimestampsResult => {
    const [timestamps, setTimestamps] = useState<Date[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        axios.get(`${API_URL}/api/v2/timestamps`)
            .then(response => {
                const data = response.data;
                const interval = 10;
                const max = new Date(data.max);
                let timestamp = new Date(data.min);
                
                const timestamps: Date[] = [];
                while (timestamp <= max) {
                    timestamps.push(timestamp);
                    timestamp = new Date(timestamp.getTime() + interval*60*1000);
                }

                setTimestamps(timestamps);
                setCurrentIndex(timestamps.length - 1);
                onTimestampChange(max);
            })
            .catch(error => toaster.displayError("Error fetching timestamps", error));
    }, [onTimestampChange]);

    return { timestamps, currentIndex, setCurrentIndex };
};