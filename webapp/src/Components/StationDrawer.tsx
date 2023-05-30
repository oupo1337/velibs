import React, {useEffect, useState} from "react";

import {Drawer} from "@mui/material";

import {GraphData, Station} from "./Domain";
import Graph from "./Graph";

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
            <h1 style={{textAlign: 'center'}}>{station?.name}</h1>
            <Graph data={data} />
        </Drawer>
    );
}

export default StationDrawer;