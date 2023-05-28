import React, {useEffect, useRef} from "react";

import {Drawer} from "@mui/material";

import * as d3 from 'd3';

interface StationDrawerProps {
    stationId: number | null
    drawerOpen: boolean
}

interface GraphData {
    date: Date
    mechanical: number
    electric: number
}

const StationDrawer: React.FC<StationDrawerProps> = ({ stationId, drawerOpen }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    const setGraphData = (data: GraphData[]) => {
        // Set up the SVG container
        const svg = d3.select(svgRef.current);
        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width = +svg.attr('width')! - margin.left - margin.right;
        const height = +svg.attr('height')! - margin.top - margin.bottom;
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Set up the scales
        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        // Set up the line generator
        const line = d3
            .line<GraphData>()
            .x((d) => x(d.date))
            .y((d) => y(d.mechanical));

        // Format the data
        data.forEach((d) => {
            d.date = new Date(d.date);
            d.mechanical = +d.mechanical;
        });

        // Set the domains of the scales
        const dateExtent = d3.extent(data, (d) => d.date) as [Date, Date];
        x.domain(dateExtent);
        y.domain([0, d3.max(data, (d) => d.mechanical) || 0]);

        // Append the line
        g.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // Append the x-axis
        g.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        // Append the y-axis
        g.append('g').call(d3.axisLeft(y));
    }

    useEffect(() => {
        if (stationId === null) {
            return
        }

        fetch(`http://runtheit.com:8080/api/stations/${stationId}`)
            .then(response => response.json())
            .then(data => setGraphData(data))
            .catch(error => console.error(error))
    }, [stationId]);

    return (
        <Drawer anchor='right' open={drawerOpen}>
            STATION: {stationId}
            <svg ref={svgRef} width={800} height={600}></svg>
        </Drawer>
    );
}

export default StationDrawer;