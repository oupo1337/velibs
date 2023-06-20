import React from "react";

import mapboxgl from "mapbox-gl";
import { Layer } from "react-map-gl";

const UnClusteredLayer : React.FC = () => {
    const style : mapboxgl.CircleLayer = {
        id: 'un-clustered-point',
        type: 'circle',
        source: 'velibs-data',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    }

    return (
        <Layer {...style} />
    );
}

export default UnClusteredLayer;
