import React from 'react';
import {useNavigate} from 'react-router-dom';

import Map from 'react-map-gl';

import DeckGL from '@deck.gl/react/typed';
import {Layer} from '@deck.gl/core/typed';
import {ScatterplotLayer} from '@deck.gl/layers/typed';
import {HeatmapLayer} from '@deck.gl/aggregation-layers/typed';
import {H3HexagonLayer} from '@deck.gl/geo-layers/typed';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoib3VwbzQyIiwiYSI6ImNqeGRiYWJ6ZTAzeHAzdG9jMjlteWRqc24ifQ.vJ6kDNRfFbBH-i6K06_4yg';

const INITIAL_VIEW_STATE = {
    longitude: 2.3522,
    latitude: 48.8566,
    zoom: 11,
    pitch: 0,
    bearing: 0
};

interface VelibMapProps {
    data : any
    velibType : string
    mapType : string
}

const VelibMap: React.FC<VelibMapProps> = ({ data, velibType, mapType,  }) => {
    const navigate = useNavigate();

    const scatterPlotLayer = new ScatterplotLayer({
        id: 'scatter-plot-layer',
        pickable: true,
        data: data.features,
        getPosition: d => d.geometry.coordinates,
        getRadius: 50,
        getFillColor: [255, 0, 0],
        getLineColor: [0, 0, 0],
        radiusMaxPixels: 100,
        lineWidthMinPixels: 1,
        onClick: info => navigate(`/${info.object.properties.station_id}`),
        onError: error => console.error(error),
    });

    const heatmapLayer = new HeatmapLayer({
        id: 'heatmap-layer',
        pickable: false,
        data: data.features,
        getPosition: d => d.geometry.coordinates,
        getWeight: d => {
            switch (velibType) {
            case 'mechanical':
                return d.properties.mechanical * 10;
            case 'electric':
                return d.properties.electric * 10;
            default:
                return d.properties.bikes * 10;
            }
        },
        radiusPixels: 30,
        intensity: 1,
        threshold: 0.05,
    })

    const h3Layer = new H3HexagonLayer({
        id: 'h3-hexagon-layer',
        data: data.features,
        pickable: true,
        wireframe: false,
        filled: true,
        extruded: true,
        elevationScale: 20,
        getHexagon: d => d.properties.hexagon,
        getFillColor: d => [d.properties.bikes * 5, 0, 255],
        getElevation: d => d.properties.bikes
    });

    const layers: Layer[] = [];
    if (mapType === 'points') {
        layers.push(scatterPlotLayer);
    } else if (mapType === 'heatmap') {
        layers.push(heatmapLayer);
    } else {
        layers.push(h3Layer);
    }

    return (
        <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}>
            <Map mapboxAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle="mapbox://styles/mapbox/dark-v11"/>
        </DeckGL>
    );
};

export default VelibMap;