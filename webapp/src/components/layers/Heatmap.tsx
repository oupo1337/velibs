import React from "react";

import { Layer, LayerProps } from "react-map-gl";

const HeatmapLayer: React.FC = () => {
    const props : LayerProps = {
        id: 'heatmap',
        type: 'heatmap',
        source: 'velibs-data',
    }

    return (
        <Layer {...props} />
    );
}

export default HeatmapLayer;
