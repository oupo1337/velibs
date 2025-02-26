import { CompositeLayer } from '@deck.gl/core';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { UpdateParameters } from "deck.gl";
import Supercluster, { PointFeature } from 'supercluster';

import { StationProperties } from '../../domain/Domain';
import Bounds from '../../domain/Paris';


interface ClusteredStationProperties extends StationProperties {
    cluster: boolean;
    total: number;
}

type ClusterPointFeature = PointFeature<ClusteredStationProperties>;

function getScatterPlotColor(d: ClusterPointFeature): [number, number, number] {
    if (!d.properties.cluster) {
        const total = d.properties.mechanical + d.properties.electric;
        if (total < 10) return [0, 180, 30];     // Light Lime
        if (total < 20) return [0, 200, 33];     // Lime
        if (total < 30) return [0, 220, 37];     // Official Lime green
        if (total < 40) return [0, 240, 40];     // Bright Lime
        return [0, 255, 43];                     // Brightest Lime
    }

    // For clusters
    const total = d.properties.total;
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

    const value = d.properties.mechanical + d.properties.electric;
    return value.toString();
}

interface ClusterLayerProps {
    zoom: number;
    velibType: string;
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
                },
                map: () => {
                    return {
                        total: 1,
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
                    let value = d.properties.total;
                    if (!d.properties.cluster) {
                        if (this.props.velibType === 'mechanical') {
                            value = d.properties.mechanical;
                        } else if (this.props.velibType === 'electric') {
                            value = d.properties.electric;
                        } else {
                            value = d.properties.mechanical + d.properties.electric;
                        }
                    }
                    return ((value + 20) * 5) / this.context.viewport.zoom;
                },
                radiusScale: 6,
                radiusUnits: 'meters',
                getFillColor: getScatterPlotColor,
                getLineColor: getLineColor,
                getLineWidth: (d: ClusterPointFeature) => d.properties.cluster ? 40 : 20,
                getCursor: () => 'pointer',
            }),
            new TextLayer({
                id: 'free-floating-text-layer',
                data: data,
                pickable: true,
                getPosition: (d: ClusterPointFeature) => d.geometry.coordinates as [number, number],
                getText: getText,
                getColor: getTextColor,
                getSize: (d: ClusterPointFeature): number => {
                    let value = d.properties.total;
                    if (!d.properties.cluster) {
                        value = d.properties.mechanical + d.properties.electric;
                    }
                    return Math.min(Math.max(value, 20), 30);
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