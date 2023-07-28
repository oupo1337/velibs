import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import Map from 'react-map-gl';

import DeckGL from '@deck.gl/react/typed';
import {HeatmapLayer} from '@deck.gl/aggregation-layers/typed';
import {H3HexagonLayer} from '@deck.gl/geo-layers/typed';

import ClusterLayer from "./layers/ClusterLayer";

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoib3VwbzQyIiwiYSI6ImNqeGRiYWJ6ZTAzeHAzdG9jMjlteWRqc24ifQ.vJ6kDNRfFbBH-i6K06_4yg';

interface ViewState {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
}

interface VelibMapProps {
    data: any
    velibType: string
    mapType: string
}

const VelibMap: React.FC<VelibMapProps> = ({ data, velibType, mapType,  }) => {
    const navigate = useNavigate();
    const [viewport, setViewport] = useState<ViewState>({
        longitude: 2.3522,
        latitude: 48.8566,
        zoom: 11,
        pitch: 0,
        bearing: 0
    });

    const handleViewStateChange = ({viewState}: any) => {
        setViewport(viewState);
        return viewState;
    };

    const heatmapLayer = new HeatmapLayer({
        id: 'heatmap-layer',
        visible: mapType === 'heatmap',
        data: data.features,
        pickable: false,
        getPosition: d => d.geometry.coordinates,
        getWeight: d => d.properties.bikes * 10,
        radiusPixels: 30,
        intensity: 1,
        threshold: 0.05,
    })

    const h3Layer = new H3HexagonLayer({
        id: 'h3-hexagon-layer',
        visible: mapType === 'h3',
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

    const clusterLayer = new ClusterLayer({
        visible: mapType === 'points',
        data: data.features,
        zoom: viewport.zoom,
        onClick: (info: any) => {
            if (info.object.properties.cluster) {
                return
            }
            navigate(`/${info.object.properties.station_id}`);
        },
        onHover: (info: any) => {
            console.log(info);
        }
    })

    return (
        <DeckGL
            viewState={viewport}
            onViewStateChange={handleViewStateChange}
            controller={true}
            layers={[clusterLayer, heatmapLayer, h3Layer]}
        >
            <Map mapboxAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle="mapbox://styles/mapbox/dark-v11"/>
        </DeckGL>
    );
};

export default VelibMap;