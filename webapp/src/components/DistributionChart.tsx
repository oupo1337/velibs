import React, {useEffect, useRef} from "react";

import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
    DatasetComponent,
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
    TitleComponentOption,
    TooltipComponentOption,
} from 'echarts/components';

import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import type { BarSeriesOption } from 'echarts/charts';
import type { ComposeOption } from 'echarts/core';

import {Distribution} from "../domain/Domain";

type ECOption = ComposeOption<
    | BarSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
>;

echarts.use([
    MarkLineComponent,
    LegendComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    BarChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

interface DistributionChartProps {
    data : Distribution[]
}

const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) {
            return
        }

        const cleanData = data.map(item => ({
            time: item.time,
            bikes: item.electric + item.mechanical,
        }));

        console.log(cleanData);
        const option: ECOption = {
            responsive: true,
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
                },
            ],
            yAxis: [
                {
                    type: 'value',
                }
            ],
            series: [
                {
                    name: 'Vélos',
                    type: 'bar',
                    emphasis: {
                        focus: 'series'
                    },
                    encode: {
                        x: 'time',
                        y: 'bikes',
                    },
                },
            ],
        };

        const chart = echarts.init(chartRef.current);

        chart.setOption(option);
    }, [data]);

    return <div ref={chartRef} style={{ width: '80vw', height: '45vh' }} />;
}

export default DistributionChart;
