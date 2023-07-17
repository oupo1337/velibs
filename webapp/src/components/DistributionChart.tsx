import React from "react";
import {Distribution} from "../domain/Domain";

interface DistributionChartProps {
    data : Distribution[]
}

const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
    return (
        <div>
            HELLO WORLD
        </div>
    )
}

export default DistributionChart;
