import React, {useEffect} from "react";
import * as d3 from "d3";

import {GraphData, TimeSeries} from "../Domain/Domain";
import {NumberValue} from "d3";

interface GraphProps {
    data : GraphData | null
}

const mechanical = {label: "Mécaniques", color:'#00561b', class: 'mechanical'};
const electric = {label: "Électriques", color:'#87CEEB', class: 'electric'};
const margin = {top: 20, right: 20, bottom: 30, left: 50};
const graph = {width: 800, height:600};

const drawGraph = (data : GraphData) => {
    const timeSeries = data.time_series;
    const width = graph.width - margin.left - margin.right;
    const height = graph.height - margin.top - margin.bottom;

    timeSeries.forEach((d) => {
        d.date = new Date(d.date);
        d.mechanical = +d.mechanical;
        d.electric = +d.electric;
    });

    const svg = d3.select("#graph-container")
        .append("svg")
            .attr("width", graph.width)
            .attr("height", graph.height)
        .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(timeSeries, (d) => d.date) as [Date, Date])
        .range([0, width]);
    const xAxis = svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
        .domain([0, data.capacity + 5])
        .range([height, 0]);
    svg.append('g')
        .call(d3.axisLeft(y));

    const mechanicalGenerator = d3.line<TimeSeries>()
        .x((d) => x(d.date))
        .y((d) => y(d.mechanical))
        .curve(d3.curveBasis);

    const electricGenerator = d3.line<TimeSeries>()
        .x((d) => x(d.date))
        .y((d) => y(d.electric))
        .curve(d3.curveBasis);

    svg.append('path')
        .datum(timeSeries)
        .attr('class', mechanical.class)
        .attr('fill', 'none')
        .attr('stroke', mechanical.color)
        .attr('stroke-width', 1.2)
        .attr('d', mechanicalGenerator);

    svg.append('path')
        .datum(timeSeries)
        .attr('class', electric.class)
        .attr('fill', 'none')
        .attr('stroke', electric.color)
        .attr('stroke-width', 1.2)
        .attr('d', electricGenerator);

    const brush = d3.brushX()
        .extent( [[0, 0], [width, height]])
        .on("end", updateGraph);

    const brushArea = svg.append('g')
        .attr("class", "brush")
        .call(brush);

    function updateGraph(event : d3.D3BrushEvent<SVGGElement>) {
        const selection = event.selection;
        if (!selection) {
            return
        }

        const newX1 = selection[0] as NumberValue;
        const newX2 = selection[1] as NumberValue;

        x.domain([x.invert(newX1), x.invert(newX2)]);
        drawLines();
        brushArea.call(brush.move, null);
    }

    function drawLines() {
        const duration = 1000;
        
        xAxis.transition().duration(duration).call(d3.axisBottom(x))
        svg.select(`.${mechanical.class}`)
            .datum(timeSeries)
            .transition()
            .duration(duration)
            .attr('d', mechanicalGenerator);

        svg.select(`.${electric.class}`)
            .datum(timeSeries)
            .transition()
            .duration(duration)
            .attr('d', electricGenerator);
    }

    svg.append('line')
        .style("stroke-dasharray", ("10, 10"))
        .style("stroke", "red")
        .attr('stroke-width', 3)
        .attr('x1', x(x.domain()[0]))
        .attr('y1', y(data.capacity))
        .attr('x2', x(x.domain()[1]))
        .attr('y2', y(data.capacity));

    svg.append("circle").attr("cx",600).attr("cy",30).attr("r", 8).style("fill", mechanical.color);
    svg.append("text").attr("x", 610).attr("y", 35).text(mechanical.label).style("font-size", "15px").attr("alignment-baseline","middle");
    svg.append("circle").attr("cx",600).attr("cy",60).attr("r", 8).style("fill", electric.color);
    svg.append("text").attr("x", 610).attr("y", 65).text(electric.label).style("font-size", "15px").attr("alignment-baseline","middle");

    svg.on("dblclick",function(){
        x.domain(d3.extent(timeSeries, (d) => d.date) as [Date, Date])
        drawLines();
    });
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