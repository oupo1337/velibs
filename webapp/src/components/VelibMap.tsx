import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import Map from 'react-map-gl';

import DeckGL from '@deck.gl/react/typed';
import {PickingInfo} from '@deck.gl/core/typed'
import {GeoJsonLayer, PolygonLayer} from '@deck.gl/layers/typed';
import {HeatmapLayer} from '@deck.gl/aggregation-layers/typed';
import {H3HexagonLayer} from '@deck.gl/geo-layers/typed';


import ClusterLayer from "./layers/ClusterLayer";
import { GeoJSON } from '../domain/Domain';

import { API_URL } from '../configuration/Configuration';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoib3VwbzQyIiwiYSI6ImNqeGRiYWJ6ZTAzeHAzdG9jMjlteWRqc24ifQ.vJ6kDNRfFbBH-i6K06_4yg';

interface ViewState {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
}

interface VelibMapProps {
    data: GeoJSON
    displayBikeWays: boolean
    format: string
}


const VelibMap: React.FC<VelibMapProps> = ({ data, displayBikeWays, format  }) => {
    const navigate = useNavigate();
    
    const [bikeWays, setBikeWays] = useState<GeoJSON>({
        type: "",
        features: []
    });

    const [viewport, setViewport] = useState<ViewState>({
        longitude: 2.3522,
        latitude: 48.8566,
        zoom: 11,
        pitch: 0,
        bearing: 0
    });

    useEffect(() => {
        fetch(`${API_URL}/api/v1/bikeways`)
          .then(response => response.json())
          .then(data => setBikeWays(data))
          .catch(error => console.error(error))
    }, []);
    

    const handleViewStateChange = ({viewState}: any) => {
        setViewport(viewState);
        return viewState;
    };

    const heatmapLayer = new HeatmapLayer({
        id: 'heatmap-layer',
        visible: format === 'heatmap',
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
        visible: format === 'h3',
        data: data.features,
        pickable: true,
        wireframe: true,
        filled: true,
        extruded: true,
        elevationScale: 20,
        getHexagon: d => d.properties.hexagon,
        getFillColor: d => [d.properties.bikes * 5, 0, 255],
        getElevation: d => d.properties.bikes
    });

    const clusterLayer = new ClusterLayer({
        visible: format === 'points',
        data: data.features,
        zoom: viewport.zoom,
        onClick: (info: PickingInfo) => {
            if (info.object.properties.cluster) {
                return
            }
            navigate(`/stations/${info.object.properties.station_id}`);
        },
    });

    const bikeWaysLayer = new GeoJsonLayer({
        visible: displayBikeWays,
        id: 'bike-ways-layer',
        data: bikeWays.features,
        pickable: true,
        stroked: false,
        filled: true,
        extruded: true,
        pointType: 'circle',
        lineWidthScale: 10,
        lineWidthMinPixels: 1,
        getFillColor: [160, 160, 180, 200],
        getLineColor: [8, 166, 56],
        getPointRadius: 100,
        getLineWidth: 1,
    })

    const polygonLayer = new PolygonLayer({
        visible: format === 'polygon',
        id: 'polygon-layer',
        pickable: true,
        stroked: true,
        filled: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: d => d.contour,
        getElevation: d => d.population / d.area / 10,
        getFillColor: d => [d.population / d.area / 60, 140, 0],
        getLineColor: [80, 80, 80],
        getLineWidth: 1
    })

    return (
        <DeckGL
            initialViewState={viewport}
            onViewStateChange={handleViewStateChange}
            controller={true}
            layers={[bikeWaysLayer, clusterLayer, heatmapLayer, h3Layer, polygonLayer]}
        >
            <Map
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                mapStyle="mapbox://styles/oupo42/clpzr3osp01ld01qtcduf4ta6"
            />
        </DeckGL>
    );
};

export default VelibMap;