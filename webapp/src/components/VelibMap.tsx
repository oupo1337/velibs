import React, {useRef} from 'react';

import mapbox from 'mapbox-gl';

import Map, { MapRef, Source } from 'react-map-gl';

import ClusterLayer from "./layers/ClusterLayer";
import SymbolCountLayer from "./layers/SymbolCountLayer";
import UnClusteredLayer from "./layers/UnClusteredLayer";
import { useNavigate } from 'react-router-dom';

const mapboxAccessToken = 'pk.eyJ1Ijoib3VwbzQyIiwiYSI6ImNqeGRiYWJ6ZTAzeHAzdG9jMjlteWRqc24ifQ.vJ6kDNRfFbBH-i6K06_4yg';

interface VelibMapProps {
    data : string
    velibType : string
}

const VelibMap: React.FC<VelibMapProps> = ({ data, velibType,  }) => {
    const mapRef = useRef<MapRef>(null);
    const navigate = useNavigate();

    const clusterProperties = {
        bikes: ['+', ['get', 'bikes']],
        mechanical: ['+', ['get', 'mechanical']],
        electric: ['+', ['get', 'electric']]
    }

    const handleClick = (event: any) => {
        if (event.features && event.features.length > 0) {
            const feature = event.features[0];
            if (feature.properties === null || mapRef.current === null) {
                return
            }

            const clusterId = feature.properties.cluster_id;
            const mapboxSource = mapRef.current.getSource('velibs-data') as mapbox.GeoJSONSource;
            mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) {
                    return;
                }

                if (clusterId === undefined && feature.properties) {
                    navigate(`/${feature.properties.station_id}`);
                } else {
                    mapRef.current?.easeTo({
                        center: feature.geometry.coordinates,
                        zoom: zoom,
                        duration: 500
                    });
                }
            });
        }
    }

    return <Map
        initialViewState={{longitude: 2.3522, latitude: 48.8566, zoom: 11}}
        style={{width: '100vw', height: '100vh'}}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxAccessToken}
        interactiveLayerIds={['clusters', 'un-clustered-point']}
        onClick={handleClick}
        ref={mapRef}
    >
        <Source id="velibs-data" type="geojson" cluster={true} data={data} clusterProperties={clusterProperties}>
            <ClusterLayer />
            <SymbolCountLayer velibType={velibType} />
            <UnClusteredLayer />
        </Source>
    </Map>
};

export default VelibMap;
