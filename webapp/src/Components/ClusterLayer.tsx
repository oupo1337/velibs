import React from "react";
import {Layer} from "react-map-gl";
import mapboxgl from "mapbox-gl";

const ClusterLayer: React.FC = () => {
    const style : mapboxgl.CircleLayer = {
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
        <Layer {...style} />
    );
}

export default ClusterLayer;
