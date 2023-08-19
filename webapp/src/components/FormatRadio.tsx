import React, {ChangeEvent} from "react";

import {FormControl, FormControlLabel, Radio, RadioGroup} from "@mui/material";

interface FormatRadioProps {
    format : string
    setFormat : React.Dispatch<React.SetStateAction<string>>
}

const FormatRadio : React.FC<FormatRadioProps> = ({format, setFormat}) => {
    const handleChange = (event : ChangeEvent<HTMLElement>, value : string) => {
        setFormat(value);
    }

    return (
        <div className="sidebar">
            <FormControl>
                <RadioGroup row value={format} onChange={handleChange}>
                    <FormControlLabel value="points" control={<Radio />} label="Points" />
                    <FormControlLabel value="heatmap" control={<Radio />} label="Heatmap" />
                    <FormControlLabel value="h3" control={<Radio />} label="H3" />
                </RadioGroup>
            </FormControl>
        </div>
    );
}

export default FormatRadio;