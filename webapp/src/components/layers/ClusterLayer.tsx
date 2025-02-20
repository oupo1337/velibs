import { BBox } from 'geojson';

import Supercluster, { PointFeature } from 'supercluster';

import { CompositeLayer } from '@deck.gl/core';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { UpdateParameters } from "deck.gl";
import { StationProperties } from '../../domain/Domain';

type ClusterPointFeature = PointFeature<ClusteredStationProperties>;

interface ClusteredStationProperties extends StationProperties {
    cluster: boolean;
    total: number;
}

function getTextSize(d: ClusterPointFeature): number {
    let value = d.properties.total;
    if (!d.properties.cluster) {
        value = d.properties.mechanical + d.properties.electric;
    }
    return Math.min(Math.max(value, 20), 30);
}

function getScatterPlotColor(d: ClusterPointFeature): [number, number, number] {
    if (!d.properties.cluster)
        return [17, 68, 225];
    if (d.properties.total < 30)
        return [81, 187, 214];
    if (d.properties.total < 100)
        return [241, 240, 117];
    return [242, 140, 177];
}

function getText(d: ClusterPointFeature): string {
    if (d.properties.cluster)
        return d.properties.total.toString();

    const value = d.properties.mechanical + d.properties.electric;
    return value.toString();
}

const bounds: BBox = [
    1.812744, 48.663757,
    2.801514, 49.008150,
];

interface ClusterLayerProps {
    zoom: number;
}

class ClusterLayer extends CompositeLayer<ClusterLayerProps> {
    shouldUpdateState({changeFlags}: UpdateParameters<this>) {
        return changeFlags.somethingChanged;
    }

    updateState({changeFlags}: UpdateParameters<this>) {
        if (changeFlags.somethingChanged) {
            const cluster = new Supercluster({
                radius: this.context.viewport.zoom * 3,
                maxZoom: 14,
                reduce: (accumulated, props) => {
                    accumulated.name = [...accumulated.name, ...props.name];
                    accumulated.station_id = [...accumulated.station_id, ...props.station_id];
                    accumulated.total += props.total;
                    accumulated.mechanical += props.mechanical;
                    accumulated.electric += props.electric;
                },
                map: (props) => {
                    return {
                        name: [props.name],
                        station_id: [props.station_id],
                        total: props.mechanical + props.electric,
                        mechanical: props.mechanical,
                        electric: props.electric,
                    }
                },
            });

            cluster.load(this.props.data as ClusterPointFeature[]);
            const clusteredData = cluster.getClusters(bounds, this.props.zoom);
            this.setState({
                data: clusteredData,
            });
        }
    }

    renderLayers() {
        const data = this.state.data as ClusterPointFeature[];

        return [
            new ScatterplotLayer({
                id: 'scatter-plot-layer',
                data: data,
                pickable: true,
                stroked: true,
                opacity: 0.8,
                getPosition: d => d.geometry.coordinates as [number, number, number],
                getRadius: (d: ClusterPointFeature): number => {
                    let value = d.properties.total;
                    if (!d.properties.cluster) {
                        value = d.properties.mechanical + d.properties.electric;
                    }

                    return ((value + 20) * 5) / this.context.viewport.zoom;
                },
                radiusScale: 6,
                radiusUnits: 'meters',
                getFillColor: getScatterPlotColor,
                getLineColor: [0, 0, 0],
                getLineWidth: (d: ClusterPointFeature) => d.properties.cluster ? 1 : 3,
            }),
            new TextLayer({
                id: 'text-layer',
                data: data,
                pickable: true,
                getPosition: (d: ClusterPointFeature) => d.geometry.coordinates as [number, number],
                getText: getText,
                getSize: getTextSize,
                getAngle: 0,
                getTextAnchor: 'middle',
                getAlignmentBaseline: 'center',
                fontFamily: 'system-ui',
            }),
        ]
    }
}

ClusterLayer.layerName = 'cluster-layer';

export default ClusterLayer;