import React, {useEffect, useState} from "react";

import {Drawer} from "@mui/material";

import Graph from "./Graph";
import GraphData from "./GraphData";

interface StationDrawerProps {
    stationId: number | null
    drawerOpen: boolean
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const StationDrawer: React.FC<StationDrawerProps> = ({ stationId, drawerOpen, setDrawerOpen }) => {
    const [data, setData] = useState<GraphData[] | null>(null);

    const handleClose = () => {
        setDrawerOpen(false);
    }

    useEffect(() => {
        if (stationId === null) {
            return
        }

        fetch(`http://runtheit.com:8080/api/stations/${stationId}`)
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error(error))
    }, [stationId]);

    return (
        <Drawer anchor='right' open={drawerOpen} onClose={handleClose}>
            <Graph data={data} />
        </Drawer>
    );
}

export default StationDrawer;