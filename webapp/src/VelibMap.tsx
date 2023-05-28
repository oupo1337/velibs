import React from 'react';
import Map, {Source} from 'react-map-gl';

import UnClusteredLayer from "./UnClusteredLayer";
import SymbolCountLayer from "./SymbolCountLayer";
import ClusterLayer from "./ClusterLayer";

const mapboxAccessToken = 'pk.eyJ1Ijoib3VwbzQyIiwiYSI6ImNqeGRiYWJ6ZTAzeHAzdG9jMjlteWRqc24ifQ.vJ6kDNRfFbBH-i6K06_4yg';

interface VelibMapProps {
    data : string
}

const VelibMap: React.FC<VelibMapProps> = ({ data }) => {
    const clusterProperties = {
        bikes: ['+', ['get', 'bikes']],
        mechanical: ['+', ['get', 'mechanical']],
        electric: ['+', ['get', 'electric']]
    }

    const initialViewState = {
        longitude: 2.3522,
        latitude: 48.8566,
        zoom: 11
    }

    const style = {
        width: '100vw',
        height: '100vh',
    }

    return <Map
        initialViewState={initialViewState}
        style={style}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxAccessToken}
    >
        <Source id="velibs-data" type="geojson" cluster={true} data={data} clusterProperties={clusterProperties}>
            <ClusterLayer />
            <SymbolCountLayer />
            <UnClusteredLayer />
        </Source>
    </Map>
};

export default VelibMap;
