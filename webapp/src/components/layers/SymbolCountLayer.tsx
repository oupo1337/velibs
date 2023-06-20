import React from "react";

import mapboxgl from "mapbox-gl";
import { Layer } from "react-map-gl";

interface SymbolCountLayerProps {
    velibType : string
}

const SymbolCountLayer: React.FC<SymbolCountLayerProps> = ({ velibType }) => {
    const style : mapboxgl.SymbolLayer = {
        id: 'cluster-count',
        type: 'symbol',
        source: 'velibs-data',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': `{${velibType}}`,
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    }

    return (
        <Layer {...style} />
    );
}

export default SymbolCountLayer;

