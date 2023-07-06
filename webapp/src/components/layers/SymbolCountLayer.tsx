import React from "react";

import { Layer, LayerProps } from "react-map-gl";

interface SymbolCountLayerProps {
    velibType : string
}

const SymbolCountLayer: React.FC<SymbolCountLayerProps> = ({ velibType }) => {
    const props : LayerProps = {
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
        <Layer {...props} />
    );
}

export default SymbolCountLayer;

