import React from "react";

import { Layer, LayerProps } from "react-map-gl";

const HeatmapLayer: React.FC = () => {
    const props : LayerProps = {
        id: 'velibs-heat',
        type: 'heatmap',
    }

    return (
        <Layer {...props} />
    );
}

export default HeatmapLayer;
