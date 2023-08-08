import React, { useEffect, useRef } from "react";

import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
    DatasetComponent,
    DataZoomComponent,
    GridComponent,
    LegendComponent,
    MarkLineComponent,
    TitleComponent,
    TooltipComponent,
    TransformComponent
} from 'echarts/components';

import type {
    DatasetComponentOption,
    GridComponentOption,
    MarkLineComponentOption,
    TitleComponentOption,
    TooltipComponentOption,
} from 'echarts/components';

import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type { ComposeOption } from 'echarts/core';

import {Station, TimeSeries} from "../../domain/Domain";

type ECOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
    | MarkLineComponentOption
>;

echarts.use([
    MarkLineComponent,
    LegendComponent,
    DataZoomComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LineChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

interface GraphProps {
    data : Station
}

function cleanTimeSeries(data: TimeSeries[]) {
    return data.map(d => ({
        date: new Date(d.date),
        mechanical: +d.mechanical,
        electric: +d.electric,
    }));
}

const StackedAreaChart: React.FC<GraphProps> = ({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) {
            return
        }

        const cleanData = cleanTimeSeries(data.time_series);
        const option: ECOption = {
            responsive: true,
            legend: {
                data: ['Éléctriques', 'Mécaniques']
            },
            tooltip: {
                trigger: 'axis',
                showContent: true
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            dataset: {
                source: cleanData,
            },
            xAxis: [
                {
                    type: 'time',
                },
            ],
            yAxis: [
                {
                    type: 'value',
                    max: data.capacity + 10,
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    start: 90,
                    end: 100
                },
            ],
            series: [
                {
                    name: 'Éléctriques',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
                    smooth: true,
                    encode: {
                        x: 'date',
                        y: 'electric',
                    },
                    markLine: {
                        data: [{
                            name: "Capacité",
                            yAxis: data.capacity,
                            label: {
                                position: "insideEndTop",
                                formatter: params => "Capacité"
                            },
                            lineStyle: {
                                color: "red",
                            }
                        }]
                    }
                },
                {
                    name: 'Mécaniques',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
                    smooth: true,
                    encode: {
                        x: 'date',
                        y: 'mechanical',
                    },
                },
            ],
        };

        const chart = echarts.init(chartRef.current);

        chart.setOption(option);
    }, [data]);

    return <div ref={chartRef} style={{ width: '80vw', height: '450px' }} />;
}

export default StackedAreaChart;