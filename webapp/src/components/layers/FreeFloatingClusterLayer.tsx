import { CompositeLayer } from '@deck.gl/core';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { UpdateParameters } from "deck.gl";
import Supercluster, { PointFeature } from 'supercluster';

import { FreeFloatingBikeProperties } from '../../domain/Domain';
import Bounds from '../../domain/Paris';

interface ClusteredStationProperties extends FreeFloatingBikeProperties {
    cluster: boolean;
    total: number;
}

type ClusterPointFeature = PointFeature<ClusteredStationProperties>;

function getScatterPlotColor(d: ClusterPointFeature): [number, number, number] {
    const total = d.properties.total;

    if (!d.properties.cluster) {
        // For individual bikes, use battery level to determine color
        const batteryLevel = d.properties.current_range_meters / 95885;
        // Color gradient from red (low battery) to green (high battery)
        return [
            Math.round(255 * (1 - batteryLevel)), // Red component decreases as battery increases
            Math.round(255 * batteryLevel),       // Green component increases as battery increases
            0                                     // No blue component
        ];
    }

    // For clusters
    if (total < 50) return [0, 150, 25];        // Darker Lime
    if (total < 100) return [0, 130, 22];       // Even darker Lime
    if (total < 200) return [0, 110, 18];       // Very dark Lime
    return [0, 90, 15];                         // Deepest Lime
}

function getTextColor(d: ClusterPointFeature): [number, number, number] {
    if (!d.properties.cluster) {
        return [0, 70, 12];  // Dark green for individual stations
    }
    return [255, 255, 255];  // White for clusters
}

function getLineColor(d: ClusterPointFeature): [number, number, number] {
    if (!d.properties.cluster) {
        return [0, 70, 12];  // Dark green for individual stations
    }
    return [0, 150, 25];    // Darker Lime for clusters
}

function getText(d: ClusterPointFeature): string {
    if (d.properties.cluster)
        return d.properties.total.toString();
    return '';
}

function getFillOpacity(d: ClusterPointFeature): number {
    if (!d.properties.cluster) {
        // For individual bikes, use battery level to determine fill opacity
        return d.properties.current_range_meters / 95885;
    }
    return 1; // Full opacity for clusters
}

interface ClusterLayerProps {
    zoom: number;
}

class FreeFloatingClusterLayer extends CompositeLayer<ClusterLayerProps> {
    shouldUpdateState({ changeFlags }: UpdateParameters<this>) {
        return changeFlags.somethingChanged;
    }

    updateState({ changeFlags }: UpdateParameters<this>) {
        if (changeFlags.somethingChanged) {
            const cluster = new Supercluster({
                radius: this.context.viewport.zoom * 3,
                maxZoom: 14,
                reduce: (accumulated, props) => {
                    accumulated.total += props.total;
                    accumulated.current_range_meters += props.current_range_meters;
                },
                map: (props) => {
                    return {
                        total: 1,
                        current_range_meters: props.current_range_meters,
                    }
                },
            });

            cluster.load(this.props.data as ClusterPointFeature[]);
            const clusteredData = cluster.getClusters(Bounds, this.props.zoom);
            this.setState({
                data: clusteredData,
            });
        }
    }

    renderLayers() {
        const data = this.state.data as ClusterPointFeature[];

        return [
            new ScatterplotLayer({
                id: 'free-floating-scatter-plot-layer',
                data: data,
                pickable: true,
                stroked: true,
                getPosition: (d: ClusterPointFeature) => d.geometry.coordinates as [number, number, number],
                getRadius: (d: ClusterPointFeature): number => {
                    return ((d.properties.total + 20) * 5) / this.context.viewport.zoom;
                },
                radiusScale: 6,
                radiusUnits: 'meters',
                getFillColor: getScatterPlotColor,
                getLineColor: getLineColor,
                getLineWidth: (d: ClusterPointFeature) => d.properties.cluster ? 40 : 20,
                getCursor: () => 'pointer',
                opacity: 1,
                getFillOpacity: getFillOpacity,
            }),
            new TextLayer({
                id: 'free-floating-text-layer',
                data: data,
                pickable: true,
                getPosition: (d: ClusterPointFeature) => d.geometry.coordinates as [number, number],
                getText: getText,
                getColor: getTextColor,
                getSize: (d: ClusterPointFeature): number => {
                    return Math.min(Math.max(d.properties.total, 20), 30);
                },
                getAngle: 0,
                getTextAnchor: 'middle',
                getAlignmentBaseline: 'center',
                fontFamily: 'system-ui',
                fadeInDuration: 100,
                fadeOutDuration: 100
            }),
        ]
    }
}

FreeFloatingClusterLayer.layerName = 'free-floating-cluster-layer';

export default FreeFloatingClusterLayer;