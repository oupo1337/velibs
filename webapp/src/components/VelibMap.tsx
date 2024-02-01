import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Map from 'react-map-gl';

import DeckGL from '@deck.gl/react/typed';
import { PickingInfo } from '@deck.gl/core/typed'
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers/typed';
import { HeatmapLayer } from '@deck.gl/aggregation-layers/typed';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';


import ClusterLayer from "./layers/ClusterLayer";
import { Feature } from '../domain/Domain';

import { API_URL, MAPBOX_ACCESS_TOKEN, MAP_STYLE } from '../configuration/Configuration';

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
}

const VelibMap: React.FC<VelibMapProps> = ({ timestamp, format, displayBikeWays }) => {
    const navigate = useNavigate();

    const [bikeways, setBikeways] = useState<Feature[]>([]);
    const [stations, setStations] = useState<Feature[]>([]);
    const [districts, setDistricts] = useState<Feature[]>([]);
    const [boroughs, setBoroughs] = useState<Feature[]>([]);
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
                const velibCount = data.features.map((f: Feature) => f.properties.mechanical + f.properties.electric);

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
                const velibCount = data.features.map((f: Feature) => f.properties.mechanical + f.properties.electric);

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

    const handleViewStateChange = ({viewState}: any) => {
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
        onClick: (info: PickingInfo) => {
            if (info.object.properties.cluster) {
                return
            }
            navigate(`/stations/${info.object.properties.station_id}`);
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
        getLineWidth: 1
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
    });

    const districtsBoroughsTooltip = (info: PickingInfo) => {
        return {
            html: `
                <b>${info.object.properties.name}</b><br/><br/>
                Mécaniques&nbsp;: ${info.object.properties.mechanical}<br/>
                Éléctriques&nbsp;: ${info.object.properties.electric}<br/>
                Total&nbsp;: ${info.object.properties.mechanical + info.object.properties.electric}`,
        };
    }

    const stationTooltip = (info: PickingInfo) => {
        let tooltipTitle = ""
        if (info.object.properties.cluster) {
            const nbStations = 5;
            const names = info.object.properties.name.slice(0, nbStations).join('<br/>');

            tooltipTitle = `<b>${info.object.properties.point_count} stations</b><br/><br/>${names}`;
            if (info.object.properties.name.length > nbStations) {
                tooltipTitle += `<br/>et ${info.object.properties.name.length - nbStations} autres`;
            }
            tooltipTitle += `<br/><br/>`;
        } else {
            tooltipTitle = `<b>${info.object.properties.name}</b><br/><br/>`;
        }

        return {
            html: `
                ${tooltipTitle}
                Mécaniques&nbsp;: ${info.object.properties.mechanical}<br/>
                Éléctriques&nbsp;: ${info.object.properties.electric}<br/>
            `,
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