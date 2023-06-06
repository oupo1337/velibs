import React, { useEffect, useRef } from "react";
import * as echarts from 'echarts/core';
import {
    BarChart,
    LineChart,
} from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type {
    BarSeriesOption,
    LineSeriesOption,
} from 'echarts/charts';
import type {
    TitleComponentOption,
    TooltipComponentOption,
    GridComponentOption,
    DatasetComponentOption
} from 'echarts/components';
import type {
    ComposeOption,
} from 'echarts/core';

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
            legend: {
                data: ['Mécaniques', 'Éléctriques']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            dataset: {
                source: cleanData,
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            dataZoom: {
                type: 'inside',
                filterMode: 'filter',
            },
            series: [
                {
                    name: 'Mécaniques',
                    type: 'line',
                    stack: 'Total',
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 0.5,
                        color: '#07FF70',

                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgba(58,233,77,0.8)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(58,233,77,0.3)'
                            }
                        ])
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    encode: {
                        x: 'date',
                        y: 'mechanical'
                    }
                },
                {
                    name: 'Éléctriques',
                    type: 'line',
                    stack: 'Total',
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 0.5,
                        color: '#0770FF',
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgba(58,77,233,0.8)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(58,77,233,0.3)'
                            }
                        ])
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    encode: {
                        x: 'date',
                        y: 'electric'
                    }
                },
            ],
        };

        chart.setOption(option);
    }, [data]);

    return <div ref={chartRef} style={{ width: '800px', height: '600px' }} />;
}

export default StackedAreaChart;