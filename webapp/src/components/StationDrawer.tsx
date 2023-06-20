import { Box, Typography } from "@mui/material";

import { GraphData } from "../domain/Domain";
import StackedAreaChart from "./StackedAreaChart";
import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router-dom";

export type LoaderData = {
    station: GraphData
};

export const stationLoader = async ({ params }: LoaderFunctionArgs) => {
    const { stationId } = params;
    if (!stationId) {
        return redirect("/");
    }
    const station = await fetch(`http://runtheit.com:8080/api/stations/${stationId}`)
        .then(response => response.json())
        .catch(() => redirect("/"))

    return { station } satisfies LoaderData;
}

const StationDrawer = () => {
    const { station } = useLoaderData() as LoaderData;

    return (
        <Box sx={{p: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <Typography variant="h4" component="h2" sx={{textAlign: 'center'}}>
                TEMP
            </Typography>
            <StackedAreaChart data={station} />
        </Box>
    );
}

export default StationDrawer;