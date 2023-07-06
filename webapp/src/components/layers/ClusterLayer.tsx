import React from "react";

import { Layer, LayerProps } from "react-map-gl";

const ClusterLayer: React.FC = () => {
    const props : LayerProps = {
        id: 'clusters',
        type: 'circle',
        source: 'velibs-data',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                200,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                200,
                40
            ]
        }
    }

    return (
        <Layer {...props} />
    );
}

export default ClusterLayer;
