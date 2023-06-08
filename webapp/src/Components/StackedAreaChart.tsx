import React, { useEffect, useRef } from "react";

import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent } from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type { TitleComponentOption, TooltipComponentOption, GridComponentOption, DatasetComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

import { GraphData } from "../Domain/Domain";


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
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {},
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
                    max: data.capacity,
                    type: 'value'
                }
            ],
            series: [
                {
                    name: 'Mécanique',
                    type: 'bar',
                    stack: 'bikes',
                    color: '#779F5F',
                    emphasis: {
                        focus: 'series'
                    },
                    encode: {
                      x: 'date',
                      y: 'mechanical',
                    },
                },
                {
                    name: 'Éléctriques',
                    type: 'bar',
                    stack: 'bikes',
                    color: '#529EAE',
                    emphasis: {
                        focus: 'series'
                    },
                    encode: {
                        x: 'date',
                        y: 'electric',
                    },
                },
            ],
        };

        chart.dispatchAction({
            type: 'takeGlobalCursor',
            key: 'brush',
            brushOption: {
                brushType: 'lineX',
                brushMode: 'single'
            }
        });
        chart.setOption(option);
    }, [data]);

    return <div ref={chartRef} style={{ width: '800px', height: '600px' }} />;
}

export default StackedAreaChart;