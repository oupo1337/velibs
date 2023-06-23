import { Box, Typography } from "@mui/material";
import * as React from "react";

import { Station } from "../domain/Domain";
import StackedAreaChart from "./StackedAreaChart";
import { LoaderFunctionArgs, redirect, useLoaderData, defer, Await } from "react-router-dom";

export type LoaderData = {
    station: Promise<Station>
};

export const stationLoader = async ({ params }: LoaderFunctionArgs) => {
    const { stationId } = params;
    if (!stationId) {
        return redirect("/");
    }
    const station = fetch(`http://runtheit.com:8080/api/stations/${stationId}`)
        .then(response => response.json())
        .catch(() => redirect("/"))

    return defer({ station } satisfies LoaderData);
}

const StationDrawer = () => {
    const { station } = useLoaderData() as LoaderData;

    return (
        <Box sx={{p: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <React.Suspense fallback={<p>Loading package location...</p>}>
                <Await resolve={station} errorElement={<p>Error loading package location!</p>}>
                    {(resolvedStation: Station) => (
                        <>
                            <Typography variant="h4" component="h2" sx={{textAlign: 'center'}}>
                                { resolvedStation.name }
                            </Typography>
                            <StackedAreaChart data={resolvedStation} />
                        </>
                    )}
                </Await>
            </React.Suspense>  
        </Box>
    );
}

export default StationDrawer;