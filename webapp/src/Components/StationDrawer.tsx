import React, {useEffect, useState} from "react";

import { Box, Drawer, Typography } from "@mui/material";

import { GraphData, Station } from "../Domain/Domain";
import StackedAreaChart from "./StackedAreaChart";

interface StationDrawerProps {
    station: Station | null
    drawerOpen: boolean
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const StationDrawer: React.FC<StationDrawerProps> = ({ station, drawerOpen, setDrawerOpen }) => {
    const [data, setData] = useState<GraphData | null>(null);

    const handleClose = () => {
        setDrawerOpen(false);
    }

    useEffect(() => {
        if (station === null) {
            return
        }

        fetch(`http://runtheit.com:8080/api/stations/${station.id}`)
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error(error))
    }, [station]);

    return (
        <Drawer anchor='right' open={drawerOpen} onClose={handleClose}>
            <Box sx={{p: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <Typography variant="h4" component="h2" sx={{textAlign: 'center'}}>
                    {station?.name}
                </Typography>
                <StackedAreaChart data={data} />
            </Box>
        </Drawer>
    );
}

export default StationDrawer;