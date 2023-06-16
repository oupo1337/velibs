import React, {useRef} from 'react';

import { EventData, MapMouseEvent } from 'mapbox-gl';
import Map, { GeoJSONSource, MapRef, Source } from 'react-map-gl';

import { Station } from "../domain/Domain";
import ClusterLayer from "./layers/ClusterLayer";
import SymbolCountLayer from "./layers/SymbolCountLayer";
import UnClusteredLayer from "./layers/UnClusteredLayer";

const mapboxAccessToken = 'pk.eyJ1Ijoib3VwbzQyIiwiYSI6ImNqeGRiYWJ6ZTAzeHAzdG9jMjlteWRqc24ifQ.vJ6kDNRfFbBH-i6K06_4yg';

interface VelibMapProps {
    data : string
    velibType : string
    setStation: React.Dispatch<React.SetStateAction<Station | null>>
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const VelibMap: React.FC<VelibMapProps> = ({ data, velibType, setStation, setDrawerOpen,  }) => {
    const mapRef = useRef<MapRef>(null);

    const clusterProperties = {
        bikes: ['+', ['get', 'bikes']],
        mechanical: ['+', ['get', 'mechanical']],
        electric: ['+', ['get', 'electric']]
    }

    const handleClick = (event: MapMouseEvent & EventData) => {
        if (event.features && event.features.length > 0) {
            const feature = event.features[0];
            if (feature.properties === null || mapRef.current === null) {
                return
            }

            const clusterId = feature.properties.cluster_id;
            const mapboxSource = mapRef.current.getSource('velibs-data') as GeoJSONSource;
            mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) {
                    return;
                }

                if (clusterId === undefined) {
                    setStation({
                        name: feature.properties.name,
                        id: feature.properties.station_id,
                    });
                    setDrawerOpen(true);
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
