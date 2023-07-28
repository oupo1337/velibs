import {BBox} from 'geojson';

import Supercluster from 'supercluster';

import {CompositeLayer} from '@deck.gl/core/typed';
import {ScatterplotLayer, TextLayer} from '@deck.gl/layers/typed';

interface ClusterLayerProps {
    zoom: number;
}

interface ClusterData {
    geometry: {
        coordinates: [number, number],
    },
    properties: {
        cluster: boolean,
        sum: number,
        bikes: number,
        electric: number,
        mechanical: number,
    }
}

function getSize(d: ClusterData): number {
    if (!d.properties.cluster)
        return 10;

    if (d.properties.sum < 30)
        return 20;
    if (d.properties.sum < 100)
        return 30;
    return 40;
}

function getScatterPlotColor(d: ClusterData): [number, number, number] {
    if (!d.properties.cluster)
        return [17, 68, 225];

    if (d.properties.sum < 30)
        return [81, 187, 214];
    if (d.properties.sum < 100)
        return [241, 240, 117];
    return [242, 140, 177];
}

function getText(d: ClusterData): string {
    if (d.properties.cluster)
        return d.properties.sum.toString();
    return d.properties.bikes.toString();
}

const bounds: BBox = [
    1.812744, 48.663757,
    2.801514, 49.008150,
];

class ClusterLayer extends CompositeLayer<ClusterLayerProps> {
    shouldUpdateState({changeFlags}: any) {
        return changeFlags.somethingChanged;
    }

    updateState({props, oldProps, changeFlags}: any) {
        if (changeFlags.somethingChanged && props.zoom !== oldProps.zoom) {
            const cluster = new Supercluster({
                radius: 50,
                maxZoom: 14,
                reduce: (accumulated, props) => {
                    accumulated.sum += props.sum;
                },
                map: (props) => {
                    return {sum: props.bikes}
                },
            });

            cluster.load(this.props.data as any);
            this.setState({
                data: cluster.getClusters(bounds, this.props.zoom),
            });
        }
    }

    renderLayers() {
        const {data} = this.state;

        return [
            new ScatterplotLayer({
                id: 'scatter-plot-layer',
                data: data,
                pickable: true,
                stroked: true,
                opacity: 0.8,
                getPosition: (d: ClusterData) => d.geometry.coordinates,
                getRadius: getSize,
                radiusScale: 6,
                radiusUnits: 'meters',
                getFillColor: getScatterPlotColor,
                getLineColor: [0, 0, 0],
                getLineWidth: (d: ClusterData) => d.properties.cluster ? 1 : 3,
            }),
            new TextLayer({
                id: 'text-layer',
                data: data,
                pickable: true,
                getPosition: (d: ClusterData) => d.geometry.coordinates,
                getText: getText,
                getSize: getSize,
                getAngle: 0,
                getTextAnchor: 'middle',
                getAlignmentBaseline: 'center',
                fontFamily: 'system-ui',
            }),
        ]
    }
}

ClusterLayer.layerName = 'ClusterLayer';

export default ClusterLayer;