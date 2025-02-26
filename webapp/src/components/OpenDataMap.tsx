import React, { useState } from 'react';
import { createSearchParams, useNavigate } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';

import Map from 'react-map-gl';

import DeckGL from '@deck.gl/react';
import { PickingInfo, ViewStateChangeParameters } from '@deck.gl/core';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';

import {
    useBikeLanes,
    useBoroughs,
    useDistricts,
    useStations
} from '../hooks/Hooks.tsx';

import ClusterLayer from "./layers/ClusterLayer.tsx";

import StationTooltip from '../tooltips/StationTooltip.tsx';
import DistrictTooltip from '../tooltips/DistrictTooltip.tsx';
import BikeLanesTooltip from '../tooltips/BikeLanesTooltip.tsx';

import type { DistrictFeature, StationFeature } from '../domain/Domain.tsx';

import { MAPBOX_ACCESS_TOKEN, MAP_STYLE } from '../configuration/Configuration.tsx';

import '../styles/Map.css';
import { useFreeFloatingBikes } from '../hooks/useFreeFloatingBikes.tsx';
import FreeFloatingClusterLayer from './layers/FreeFloatingClusterLayer.tsx';

interface ViewState {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
}

interface VelibMapProps {
    timestamp : Date | undefined
    format: string
    displayBikeLanes: boolean
    velibType: string
    freeFloatingFormat: string
}

const VelibMap: React.FC<VelibMapProps> = ({ timestamp, format, displayBikeLanes, velibType, freeFloatingFormat }) => {
    const navigate = useNavigate();
    const bikeLanes = useBikeLanes();
    const stations = useStations(timestamp);
    const freeFloatingBikes = useFreeFloatingBikes(timestamp);
    const { districts, districtsMin, districtsMax } = useDistricts(timestamp);
    const { boroughs, boroughsMin, boroughsMax } = useBoroughs(timestamp);

    const [viewport, setViewport] = useState<ViewState>({
        longitude: 2.3522,
        latitude: 48.8566,
        zoom: 12,
        pitch: 0,
        bearing: 0
    });

    const handleViewStateChange = ({viewState}: ViewStateChangeParameters) => {
        setViewport(viewState);
        return viewState;
    };

    const heatmapLayer = new HeatmapLayer({
        id: 'velib-heatmap-layer',
        visible: format === 'heatmap',
        data: stations,
        pickable: false,
        getPosition: f => f.geometry.coordinates,
        getWeight: (f: StationFeature) => {
            switch (velibType) {
                case 'mechanical':
                    return f.properties.mechanical * 10;
                case 'electric':
                    return f.properties.electric * 10;
                default:
                    return f.properties.mechanical + f.properties.electric * 10;
            }
        },
        radiusPixels: 30,
        intensity: 1,
        threshold: 0.05,
    });

    const clusterLayer = new ClusterLayer({
        id: 'velib-cluster-layer',
        visible: format === 'points',
        data: stations,
        zoom: viewport.zoom,
        velibType: velibType,
        onClick: (info: PickingInfo) => {
            const stationID = info.object.properties.station_id;
            const ids = info.object.properties.cluster ? stationID : [stationID];

            navigate({pathname: '/station', search: `?${createSearchParams({ ids })}`});
        },
    });

    const freeFloatingClusterLayer = new FreeFloatingClusterLayer({
        id: 'free-floating-cluster-layer',
        visible: freeFloatingFormat === 'points',
        data: freeFloatingBikes,
        zoom: viewport.zoom,
        velibType: velibType,
    });

    const bikeLanesLayer = new GeoJsonLayer({
        visible: displayBikeLanes,
        id: 'bike-lanes-layer',
        data: bikeLanes,
        pickable: true,
        stroked: false,
        filled: true,
        pointType: 'circle',
        lineWidthScale: 10,
        lineWidthMinPixels: 1,
        getFillColor: [160, 160, 180, 200],
        getLineColor: [8, 166, 56],
        getPointRadius: 100,
        getLineWidth: 1,
    });

    const districtsLayer = new PolygonLayer({
        visible: format === 'districts',
        id: 'velib-districts-layer',
        data: districts,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: (f: DistrictFeature) => f.geometry.coordinates,
        getElevation: (f: DistrictFeature) => (f.properties.mechanical + f.properties.electric) * 3,
        getFillColor: (f: DistrictFeature) => {
            const red = (f.properties.mechanical + f.properties.electric - districtsMin) * (255/(districtsMax-districtsMin));
            return [red, 140, 0]
        },
        getLineWidth: 1,
        onClick: (info: PickingInfo) => {
            navigate({
                pathname: '/station',
                search: `?${createSearchParams({ ids: info.object.properties.ids })}`,
            });
        }
    });

    const boroughsLayer = new PolygonLayer({
        visible: format === 'boroughs',
        id: 'velib-boroughs-layer',
        data: boroughs,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: (f: DistrictFeature) => f.geometry.coordinates,
        getElevation: (f: DistrictFeature) => (f.properties.mechanical + f.properties.electric) * 3,
        getFillColor: (f: DistrictFeature) => {
            const red = (f.properties.mechanical + f.properties.electric - boroughsMin) * (255/(boroughsMax-boroughsMin));
            return [red, 140, 0]
        },
        getLineWidth: 1,
        onClick: (info: PickingInfo) => {
            navigate({
                pathname: '/station',
                search: `?${createSearchParams({ ids: info.object.properties.ids })}`,
            });
        }
    });

    const getTooltip = (info: PickingInfo) => {
        if (info.object === undefined || info.object === null || info.layer == null) {
            return null;
        }

        switch (info.layer.id) {
            case 'velib-districts-layer':
            case 'velib-boroughs-layer':
                return { html: ReactDOMServer.renderToString(<DistrictTooltip info={info} />) };
            case 'velib-cluster-layer':
                return { html: ReactDOMServer.renderToString(<StationTooltip info={info} />) };
            case 'bike-lanes-layer':
                return { html: ReactDOMServer.renderToString(<BikeLanesTooltip info={info} />) };
            default:
                return null;
        }
    }

    return (
        <DeckGL
            initialViewState={viewport}
            onViewStateChange={handleViewStateChange}
            controller={true}
            layers={[bikeLanesLayer, clusterLayer, heatmapLayer, districtsLayer, boroughsLayer, freeFloatingClusterLayer]}
            getTooltip={getTooltip}
        >
            <Map
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                mapStyle={MAP_STYLE}
            />
        </DeckGL>
    );
};

export default VelibMap;