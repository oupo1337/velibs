import * as React from "react";

import { LoaderFunctionArgs, redirect, useLoaderData, defer, Await } from "react-router-dom";

import { Box, Typography } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';

import {Distribution, Station} from "../../domain/Domain";

import StackedAreaChart from "./StackedAreaChart";
import DistributionChart from "./DistributionChart";

type StationData = [
    station: Station,
    distribution: Distribution[]
]
export type LoaderData = {
    stationData: Promise<StationData>
};

export const stationLoader = async ({ params }: LoaderFunctionArgs) => {
    const { stationId } = params;
    if (!stationId) {
        return redirect("/");
    }

    const station = fetch(`http://runtheit.com:8080/api/stations/${stationId}`)
        .then(response => response.json())
        .catch(() => redirect("/"))

    const distribution = fetch(`http://runtheit.com:8080/api/v1/distributions/${stationId}`)
        .then(response => response.json())
        .catch(() => redirect("/"))

    const stationData = Promise.all([station, distribution]);

    return defer({ stationData } satisfies LoaderData);
}

const DrawerLoader = () => {
    return (
        <Box style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={200}/>
        </Box>
    );
}

const DrawerError = () => {
    return (
        <p>Error loading package location!</p>
    );
}

const StationDrawer = () => {
    const { stationData } = useLoaderData() as LoaderData;

    return (
        <Box style={{ flex: 1, width: '80vw', paddingTop: '4rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'space-between' }}>
            <React.Suspense fallback={<DrawerLoader />}>
                <Await resolve={stationData} errorElement={<DrawerError />}>
                    {([station, distribution]: StationData) => (
                        <>
                            <Typography variant="h4" component="h2" sx={{textAlign: 'center'}}>
                                { station.name }
                            </Typography>
                            <StackedAreaChart data={station} />
                            <DistributionChart data={distribution} />
                        </>
                    )}
                </Await>
            </React.Suspense>
        </Box>
    );
}

export default StationDrawer;