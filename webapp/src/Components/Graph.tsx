import React, {useEffect} from "react";
import * as d3 from "d3";

import {GraphData, TimeSeries} from "../Domain/Domain";

interface GraphProps {
    data : GraphData | null
}

interface Line {
    class : string
    color : string
    data : d3.Line<TimeSeries>
}

const mechanical = {label: "Mécaniques", color:'#00561b', class: 'mechanical'};
const electric = {label: "Électriques", color:'#87CEEB', class: 'electric'};
const margin = {top: 20, right: 20, bottom: 30, left: 50};
const graph = {width: 800, height:600};

const drawGraph = (data : GraphData) => {
    const timeSeries = data.time_series;
    const width = graph.width - margin.left - margin.right;
    const height = graph.height - margin.top - margin.bottom;
    const svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", graph.width)
        .attr("height", graph.height);

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const lines : Line[] = [
        {
            class: mechanical.class,
            color: mechanical.color,
            data: d3.line<TimeSeries>()
                .x((d) => x(d.date))
                .y((d) => y(d.mechanical))
                .curve(d3.curveBasis)
        },
        {
            class: electric.class,
            color: electric.color,
            data: d3.line<TimeSeries>()
                .x((d) => x(d.date))
                .y((d) => y(d.electric))
                .curve(d3.curveBasis)
        }
    ]

    timeSeries.forEach((d) => {
        d.date = new Date(d.date);
        d.mechanical = +d.mechanical;
        d.electric = +d.electric;
    });

    x.domain(d3.extent(timeSeries, (d) => d.date) as [Date, Date]);
    y.domain([0, data.capacity]);

    lines.forEach((line) => {
        g.append('path')
            .datum(data.time_series)
            .attr('class', line.class)
            .attr('fill', 'none')
            .attr('stroke', line.color)
            .attr('stroke-width', 1.2)
            .attr('d', line.data);
    })

    g.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(x));
    g.append('g').call(d3.axisLeft(y));

    g.append("circle").attr("cx",600).attr("cy",30).attr("r", 8).style("fill", mechanical.color);
    g.append("text").attr("x", 610).attr("y", 35).text(mechanical.label).style("font-size", "15px").attr("alignment-baseline","middle");
    g.append("circle").attr("cx",600).attr("cy",60).attr("r", 8).style("fill", electric.color);
    g.append("text").attr("x", 610).attr("y", 65).text(electric.label).style("font-size", "15px").attr("alignment-baseline","middle");
}

const Graph: React.FC<GraphProps> = ({ data }) => {
    useEffect(() => {
        if (data == null) {
            return
        }

        d3.select("#graph-container svg").remove();
        drawGraph(data);
    }, [data]);

    return (
        <div id="graph-container"></div>
    );
}

export default Graph;