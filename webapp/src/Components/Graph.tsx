import React, {useEffect, useRef} from "react";
import * as d3 from "d3";

import GraphData from "./GraphData";

interface GraphProps {
    data : GraphData[] | null
}

const Graph: React.FC<GraphProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const mechanicalColor = '#00561b';
    const electricColor = '#87CEEB';

    useEffect(() => {
        if (data == null) {
            return
        }

        const svg = d3.select(svgRef.current);
        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width = +svg.attr('width')! - margin.left - margin.right;
        const height = +svg.attr('height')! - margin.top - margin.bottom;
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const lines = [
            {
                color: mechanicalColor,
                line: d3.line<GraphData>()
                    .x((d) => x(d.date))
                    .y((d) => y(d.mechanical))
                    .curve(d3.curveBasisOpen)
            },
            {
                color: electricColor,
                line: d3.line<GraphData>()
                    .x((d) => x(d.date))
                    .y((d) => y(d.electric))
                    .curve(d3.curveBasisOpen)
            }
        ]

        data.forEach((d) => {
            d.date = new Date(d.date);
            d.mechanical = +d.mechanical;
            d.electric = +d.electric;
        });

        x.domain(d3.extent(data, (d) => d.date) as [Date, Date]);
        y.domain([0, d3.max(data, (d) => d.mechanical + d.electric) || 0]);

        // Append the line
        lines.forEach((line) => {
            g.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', line.color)
                .attr('stroke-width', 2)
                .attr('d', line.line);
        })

        g.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(x));
        g.append('g').call(d3.axisLeft(y));

        g.append("circle").attr("cx",300).attr("cy",30).attr("r", 6).style("fill", mechanicalColor);
        g.append("circle").attr("cx",300).attr("cy",60).attr("r", 6).style("fill", electricColor);
        g.append("text").attr("x", 320).attr("y", 30).text("Mécaniques").style("font-size", "15px").attr("alignment-baseline","middle");
        g.append("text").attr("x", 320).attr("y", 60).text("Éléctriques").style("font-size", "15px").attr("alignment-baseline","middle");
    }, [data]);

    return (
        <div>
            <svg ref={svgRef} width={800} height={600}></svg>
        </div>
    );
}

export default Graph;