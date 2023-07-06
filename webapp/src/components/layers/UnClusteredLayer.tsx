import React from "react";

import { Layer, LayerProps } from "react-map-gl";

const UnClusteredLayer : React.FC = () => {
    const style : LayerProps = {
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
