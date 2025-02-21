import React, { useEffect, useState } from 'react';
import { createSearchParams, useNavigate } from 'react-router-dom';

import Map from 'react-map-gl';

import DeckGL from '@deck.gl/react';
import { PickingInfo, ViewStateChangeParameters } from '@deck.gl/core';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';

import ClusterLayer from "./layers/ClusterLayer";

import type { StationFeature, StationGeoJSON } from '../domain/Domain';

import { API_URL, MAPBOX_ACCESS_TOKEN, MAP_STYLE } from '../configuration/Configuration';

import '../styles/Map.css';

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
    displayBikeWays: boolean
    velibType: string
}

const VelibMap: React.FC<VelibMapProps> = ({ timestamp, format, displayBikeWays, velibType }) => {
    const navigate = useNavigate();

    const [bikeways, setBikeways] = useState<StationGeoJSON>([]);
    const [stations, setStations] = useState<StationGeoJSON>([]);
    const [districts, setDistricts] = useState<StationGeoJSON>([]);
    const [boroughs, setBoroughs] = useState<StationGeoJSON>([]);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(0);

    const [viewport, setViewport] = useState<ViewState>({
        longitude: 2.3522,
        latitude: 48.8566,
        zoom: 12,
        pitch: 0,
        bearing: 0
    });

    useEffect(() => {
        if (timestamp === undefined || format === 'districts') {
            return
        }

        fetch(`${API_URL}/api/v1/stations.geojson?timestamp=${timestamp.toISOString()}`)
            .then(response => response.json())
            .then(data => setStations(data.features))
            .catch(error => console.error(error));
    }, [timestamp, format]);

    useEffect(() => {
        if (timestamp === undefined || format !== 'districts') {
            return
        }

        fetch(`${API_URL}/api/v1/districts.geojson?timestamp=${timestamp.toISOString()}`)
            .then(response => response.json())
            .then(data => {
                const velibCount = data.features.map((f: StationFeature) => f.properties.mechanical + f.properties.electric);

                setMin(Math.min(...velibCount));
                setMax(Math.max(...velibCount));
                setDistricts(data.features);
            })
            .catch(error => console.error(error));
    }, [timestamp, format]);

    useEffect(() => {
        if (timestamp === undefined || format !== 'boroughs') {
            return
        }

        fetch(`${API_URL}/api/v1/boroughs.geojson?timestamp=${timestamp.toISOString()}`)
            .then(response => response.json())
            .then(data => {
                const velibCount = data.features.map((f: StationFeature) => f.properties.mechanical + f.properties.electric);

                setMin(Math.min(...velibCount));
                setMax(Math.max(...velibCount));
                setBoroughs(data.features);
            })
            .catch(error => console.error(error));
    }, [timestamp, format]);

    useEffect(() => {
        fetch(`${API_URL}/api/v1/bikeways.geojson`)
            .then(response => response.json())
            .then(data => setBikeways(data.features))
            .catch(error => console.error(error));
    }, []);

    const handleViewStateChange = ({viewState}: ViewStateChangeParameters) => {
        setViewport(viewState);
        return viewState;
    };

    const heatmapLayer = new HeatmapLayer({
        id: 'heatmap-layer',
        visible: format === 'heatmap',
        data: stations,
        pickable: false,
        getPosition: d => d.geometry.coordinates,
        getWeight: d => (d.properties.mechanical + d.properties.electric) * 10,
        radiusPixels: 30,
        intensity: 1,
        threshold: 0.05,
    });

    const clusterLayer = new ClusterLayer({
        id: 'cluster-layer',
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

    const bikewaysLayer = new GeoJsonLayer({
        visible: displayBikeWays,
        id: 'bikeways-layer',
        data: bikeways,
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
        id: 'districts-layer',
        data: districts,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: d => d.geometry.coordinates,
        getElevation: d => (d.properties.mechanical + d.properties.electric) * 3,
        getFillColor: d => {
            const red = (d.properties.mechanical + d.properties.electric - min) * (255/(max-min));
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
        id: 'boroughs-layer',
        data: boroughs,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: d => d.geometry.coordinates,
        getElevation: d => (d.properties.mechanical + d.properties.electric) * 3,
        getFillColor: d => {
            const red = (d.properties.mechanical + d.properties.electric - min) * (255/(max-min));
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

    const districtsBoroughsTooltip = (info: PickingInfo) => {
        const total = info.object.properties.mechanical + info.object.properties.electric;
        return {
            html: `
                <div style="background: rgba(255, 255, 255, 0.95); padding: 12px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); min-width: 200px; backdrop-filter: blur(2px);">
                    <h3 style="margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0; color: #2d3748; font-size: 14px;">
                        ${info.object.properties.name}
                    </h3>
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="color: #4a5568;">Mécaniques</span>
                            <span style="color: #2d3748; font-weight: 500;">${info.object.properties.mechanical}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="color: #4a5568;">Électriques</span>
                            <span style="color: #2d3748; font-weight: 500;">${info.object.properties.electric}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #f0f0f0; margin-top: 8px;">
                            <span style="color: #2d3748; font-weight: 600;">Total</span>
                            <span style="color: #2d3748; font-weight: 600;">${total}</span>
                        </div>
                    </div>
                </div>`,
        };
    }

    const stationTooltip = (info: PickingInfo) => {
        let tooltipContent = "";
        if (info.object.properties.cluster) {
            const nbStations = 5;
            const names = info.object.properties.name.slice(0, nbStations);
            const remainingCount = info.object.properties.name.length - nbStations;

            tooltipContent = `
                <h3 style="margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0; color: #2d3748; font-size: 14px;">
                    ${info.object.properties.point_count} stations
                </h3>
                <div style="margin-bottom: 8px; color: #4a5568; font-size: 13px;">
                    ${names.join('<br/>')}
                    ${remainingCount > 0 ? `<br/><span style="color: #718096; font-style: italic;">et ${remainingCount} autres</span>` : ''}
                </div>`;
        } else {
            tooltipContent = `
                <h3 style="margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0; color: #2d3748; font-size: 14px;">
                    ${info.object.properties.name}
                </h3>`;
        }

        return {
            html: `
                <div style="background: rgba(255, 255, 255, 0.95); padding: 12px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); min-width: 200px; backdrop-filter: blur(2px);">
                    ${tooltipContent}
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="color: #4a5568;">Mécaniques</span>
                            <span style="color: #2d3748; font-weight: 500;">${info.object.properties.mechanical}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="color: #4a5568;">Électriques</span>
                            <span style="color: #2d3748; font-weight: 500;">${info.object.properties.electric}</span>
                        </div>
                    </div>
                </div>`,
        };
    }

    const BikewaysTooltip = (info: PickingInfo) => {
        return {
            html: `<b>${info.object.properties.route}</b></br></br>
                    ${info.object.properties.typology}<br/>
                    ${info.object.properties.direction}<br/>
                    ${info.object.properties.status}`,
        };
    }

    const getTooltip = (info: PickingInfo) => {
        if (info.object === undefined || info.object === null || info.layer == null) {
            return null;
        }

        switch (info.layer.id) {
            case 'districts-layer':
                return districtsBoroughsTooltip(info);
            case 'boroughs-layer':
                return districtsBoroughsTooltip(info);
            case 'cluster-layer':
                return stationTooltip(info);
            case 'bikeways-layer':
                return BikewaysTooltip(info);
            default:
                return null;
        }
    }

    return (
        <DeckGL
            initialViewState={viewport}
            onViewStateChange={handleViewStateChange}
            controller={true}
            layers={[bikewaysLayer, clusterLayer, heatmapLayer, districtsLayer, boroughsLayer]}
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