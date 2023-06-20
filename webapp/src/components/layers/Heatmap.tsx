import React from "react";

import mapboxgl from "mapbox-gl";
import { Layer } from "react-map-gl";

const HeatmapLayer: React.FC = () => {
    const style : mapboxgl.HeatmapLayer = {
        id: 'velibs-heat',
        type: 'heatmap',
    }

    return (
        <Layer {...style} />
    );
}

export default HeatmapLayer;
