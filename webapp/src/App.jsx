import React, { useRef, useEffect, useState } from 'react';

import mapboxgl from 'mapbox-gl';
import Slider from '@mui/material/Slider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import moment from 'moment';

import './App.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoib3VwbzQyIiwiYSI6ImNqeGRiYWJ6ZTAzeHAzdG9jMjlteWRqc24ifQ.vJ6kDNRfFbBH-i6K06_4yg';

export default function App() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(2.3522);
    const [lat, setLat] = useState(48.8566);
    const [zoom, setZoom] = useState(11);
    const [timestamps, setTimestamps] = useState([]);
    const [value, setValue] = useState(0);
    const [type, setType] = useState('all');

    const handleRadioChange = (e) => {
        setType(e.target.value);
    }

    const handleSliderChange = (e, newValue, activeThumb) => {
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
            center: [lng, lat],
            zoom: zoom
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

            map.current.addLayer({
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

            map.current.addLayer({
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

            map.current.on('click', 'clusters', (e) => {
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

            map.current.on('click', 'unclustered-point', (e) => {
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

            map.current.on('mouseenter', 'clusters', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'clusters', () => {
                map.current.getCanvas().style.cursor = '';
            });
        });
    }, []);

    return (
        <div style={{height: '100%'}}>
            <div className="sidebar-container">
                <div className="sidebar">
                    Date: {displayDate()}
                </div>
                <div className="sidebar">
                    <FormControl>
                        <RadioGroup row defaultValue={type} onChange={handleRadioChange} aria-labelledby="demo-row-radio-buttons-group-label" name="row-radio-buttons-group">
                            <FormControlLabel value="all" control={<Radio />} label="Tous" />
                            <FormControlLabel value="electric" control={<Radio />} label="Éléctriques" />
                            <FormControlLabel value="mechanic" control={<Radio />} label="Mécaniques" />
                        </RadioGroup>
                    </FormControl>
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
