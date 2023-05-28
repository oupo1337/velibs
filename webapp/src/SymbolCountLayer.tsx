import mapboxgl from "mapbox-gl";
import React from "react";
import {Layer} from "react-map-gl";

const SymbolCountLayer: React.FC = () => {
    const style : mapboxgl.SymbolLayer = {
        id: 'cluster-count',
        type: 'symbol',
        source: 'velibs-data',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': `{bikes}`,
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    }

    return (
        <Layer {...style} />
    );
}

export default SymbolCountLayer;

