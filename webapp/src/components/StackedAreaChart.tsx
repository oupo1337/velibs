import React, { useEffect, useRef } from "react";

import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { LegendComponent, DataZoomComponent, TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent } from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type { TitleComponentOption, TooltipComponentOption, GridComponentOption, DatasetComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

import { GraphData } from "../domain/Domain";

type ECOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
>;

echarts.use([
    LegendComponent,
    DataZoomComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    BarChart,
    LineChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

interface GraphProps {
    data : GraphData | null
}

const StackedAreaChart: React.FC<GraphProps> = ({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current || !data) {
            return
        }

        console.log(data.time_series);
        const cleanData = data.time_series.map(d => ({
            date: new Date(d.date),
            mechanical: +d.mechanical,
            electric: +d.electric,
        }));
        console.log(cleanData);

        const chart = echarts.init(chartRef.current);
        const option: ECOption = {
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
                    type: 'category',
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 10
                },
                {
                    start: 0,
                    end: 10
                }
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
                }
            ],
        };

        chart.setOption(option);
    }, [data]);

    return <div ref={chartRef} style={{ width: '800px', height: '600px' }} />;
}

export default StackedAreaChart;