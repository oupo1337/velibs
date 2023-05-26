import { useRef, useEffect, useState } from 'react';

import mapboxgl from 'mapbox-gl';
import Slider from '@mui/material/Slider';
import moment from 'moment';

import './App.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoib3VwbzQyIiwiYSI6ImNqeGRiYWJ6ZTAzeHAzdG9jMjlteWRqc24ifQ.vJ6kDNRfFbBH-i6K06_4yg';

function addPointsClusterLayer(map) {
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'bikes',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'bikes',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': `{all}`,
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });


    map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'bikes',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    map.on('click', 'clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('bikes').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.current.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.name;
        const electric = e.features[0].properties.electric;
        const mechanical = e.features[0].properties.mechanical;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`<strong>${name}</strong><br>mechanical: ${mechanical}<br>electric: ${electric}`)
            .addTo(map.current);
    });

    map.on('mouseenter', 'clusters', () => {
        map.current.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.current.getCanvas().style.cursor = '';
    });
}

export default function App() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [timestamps, setTimestamps] = useState([]);
    const [value, setValue] = useState(0);

    const handleSliderChange = (e, newValue) => {
        const timestamp = timestamps[newValue];
        map.current
            .getSource('bikes')
            .setData(`http://runtheit.com:8080/api/statuses.geojson?timestamp=${timestamp}`);
        setValue(newValue);
    }

    const displayDate = () => {
        moment.locale("fr");
        const d = moment(timestamps[value]);

        return d.calendar();
    }

    useEffect(() => {
        fetch('http://runtheit.com:8080/api/timestamps')
            .then(response => response.json())
            .then(data => {
                setTimestamps(data||[])
                setValue(data.length - 1)
            })
            .catch(error => console.error(error));
    }, []);

    useEffect(() => {
        if (map.current)
            return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [2.3522, 48.8566],
            zoom: 11
        });
    }, []);

    useEffect(() => {
        if (!map.current)
            return;

        map.current.on('load', () => {
            map.current.addSource('bikes', {
                type: 'geojson',
                data: 'http://runtheit.com:8080/api/statuses.geojson',
                cluster: true,
                clusterMaxZoom: 50,
                clusterRadius: 50,
                clusterProperties: {
                    all: ['+', ['get', 'bikes']],
                    mechanical: ['+', ['get', 'mechanical']],
                    electric: ['+', ['get', 'electric']]
                }
            });

            addPointsClusterLayer(map.current);
        });
    }, []);

    return (
        <div style={{height: '100%'}}>
            <div className="sidebar-container">
                <div className="sidebar">
                    Date: {displayDate()}
                </div>
                <div className="sidebar" style={{flex: 1}}>
                    <Slider
                        aria-label="Temperature"
                        valueLabelDisplay="off"
                        defaultValue={timestamps.length - 1}
                        value={value}
                        onChange={handleSliderChange}
                        step={1}
                        marks
                        min={0}
                        max={timestamps.length - 1}
                    />
                </div>
            </div>
            <div ref={mapContainer} className="map-container" />
        </div>
    );
}
