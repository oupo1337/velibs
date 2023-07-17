import * as React from "react";

import { LoaderFunctionArgs, redirect, useLoaderData, defer, Await } from "react-router-dom";

import { Box, Typography } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';

import {Distribution, Station} from "../domain/Domain";
import StackedAreaChart from "./StackedAreaChart";
import DistributionChart from "./DistributionChart";

export type LoaderData = {
    station: Promise<Station>
    distribution: Promise<Distribution[]>
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

    return defer({ station, distribution } satisfies LoaderData);
}

const DrawerLoader = () => {
    return (
        <Box style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={100}/>
        </Box>
    );
}

const DrawerError = () => {
    return (
        <p>Error loading package location!</p>
    );
}

const StationDrawer = () => {
    const { station, distribution } = useLoaderData() as LoaderData;

    return (
        <Box style={{ width: '80vw', height: '80vh' }}>
            <React.Suspense fallback={<DrawerLoader />}>
                <Await resolve={station} errorElement={<DrawerError />}>
                    {(resolvedStation: Station) => (
                        <React.Fragment>
                            <Typography variant="h4" component="h2" sx={{textAlign: 'center'}}>
                                { resolvedStation.name }
                            </Typography>
                            <StackedAreaChart data={resolvedStation} />
                        </React.Fragment>
                    )}
                </Await>
            </React.Suspense>
            <React.Suspense fallback={<DrawerLoader />}>
                <Await resolve={distribution} errorElement={<DrawerError />}>
                    {(resolvedDistribution: Distribution[]) => (
                        <React.Fragment>
                            <DistributionChart data={resolvedDistribution} />
                        </React.Fragment>
                    )}
                </Await>
            </React.Suspense>
        </Box>
    );
}

export default StationDrawer;