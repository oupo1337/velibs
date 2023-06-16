import React, { useEffect, useRef } from "react";

import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent } from 'echarts/components';
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

        const cleanData = data.time_series.map(d => ({
            date: new Date(d.date),
            mechanical: +d.mechanical,
            electric: +d.electric,
        }));

        const chart = echarts.init(chartRef.current);
        const option: ECOption = {
            legend: {},
            tooltip: {
                trigger: 'axis',
                showContent: false
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
            series: [
                {
                    name: 'Éléctriques',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
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