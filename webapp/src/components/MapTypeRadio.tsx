import React, {ChangeEvent} from "react";

import {FormControl, FormControlLabel, Radio, RadioGroup} from "@mui/material";

interface MapTypeRadioProps {
    mapType : string
    setMapType : React.Dispatch<React.SetStateAction<string>>
}

const MapTypeRadio : React.FC<MapTypeRadioProps> = ({ mapType, setMapType }) => {
    const handleChange = (event : ChangeEvent<HTMLElement>, value : string) => {
        setMapType(value);
    }

    return (
        <div className="sidebar">
            <FormControl>
                <RadioGroup row value={mapType} onChange={handleChange}>
                    <FormControlLabel value="points" control={<Radio />} label="Points" />
                    <FormControlLabel value="heatmap" control={<Radio />} label="Heatmap" />
                    <FormControlLabel value="h3" control={<Radio />} label="H3" />
                </RadioGroup>
            </FormControl>
        </div>
    );
}

export default MapTypeRadio;