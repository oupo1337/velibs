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
        if (total < 10) return [239, 68, 68];     // Red for very low capacity
        if (total < 20) return [251, 146, 60];    // Orange for low capacity
        if (total < 30) return [250, 204, 21];    // Yellow for medium capacity
        if (total < 40) return [34, 197, 94];     // Green for good capacity
        return [6, 182, 212];                     // Cyan for high capacity
    }

    // For clusters
    const total = d.properties.total;
    if (total < 50) return [99, 102, 241];       // Indigo for small clusters
    if (total < 100) return [168, 85, 247];      // Purple for medium clusters
    if (total < 200) return [236, 72, 153];      // Pink for large clusters
    return [244, 63, 94];                        // Rose for very large clusters
}

function getText(d: ClusterPointFeature): string {
    if (d.properties.cluster)
        return d.properties.total.toString();

    const value = d.properties.mechanical + d.properties.electric;
    return value.toString();
}

function getTextColor(d: ClusterPointFeature): [number, number, number] {
    if (!d.properties.cluster) {
        return [0, 0, 0];
    }
    
    // More contrasting text colors for clusters based on size
    const total = d.properties.total;
    if (total < 50) return [199, 210, 254];     // Stronger blue-white for small clusters
    if (total < 100) return [216, 180, 254];    // Stronger purple-white for medium clusters
    if (total < 200) return [251, 207, 232];    // Stronger pink-white for large clusters
    return [254, 202, 202];                     // Stronger rose-white for very large clusters
}

function getLineColor(d: ClusterPointFeature): [number, number, number] {
    if (!d.properties.cluster) {
        return [0, 0, 0];
    }
    
    // Matching stroke colors for clusters
    const total = d.properties.total;
    if (total < 50) return [67, 56, 202];      // Darker indigo for small clusters
    if (total < 100) return [126, 34, 206];    // Darker purple for medium clusters
    if (total < 200) return [190, 24, 93];     // Darker pink for large clusters
    return [190, 18, 60];                      // Darker rose for very large clusters
}

interface ClusterLayerProps {
    zoom: number;
    velibType: string;
}

class ClusterLayer extends CompositeLayer<ClusterLayerProps> {
    shouldUpdateState({ changeFlags }: UpdateParameters<this>) {
        return changeFlags.somethingChanged;
    }

    updateState({ changeFlags }: UpdateParameters<this>) {
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
                    let total = props.mechanical + props.electric;
                    if (this.props.velibType ==='mechanical') {
                        total = props.mechanical;
                    } else if (this.props.velibType ==='electric') {
                        total = props.electric;
                    }

                    return {
                        name: [props.name],
                        station_id: [props.station_id],
                        total: total,
                        mechanical: props.mechanical,
                        electric: props.electric,
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
                id: 'scatter-plot-layer',
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
            }),
            new TextLayer({
                id: 'text-layer',
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

ClusterLayer.layerName = 'cluster-layer';

export default ClusterLayer;