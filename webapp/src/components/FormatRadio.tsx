import React, {ChangeEvent} from "react";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

interface FormatRadioProps {
    format : string
    setFormat : React.Dispatch<React.SetStateAction<string>>
}

const FormatRadio : React.FC<FormatRadioProps> = ({format, setFormat}) => {
    const handleChange = (_ : ChangeEvent<HTMLElement>, value : string) => {
        setFormat(value);
    }

    return (
        <div className="sidebar">
            <FormControl>
                <RadioGroup row value={format} onChange={handleChange}>
                    <FormControlLabel value="points" control={<Radio />} label="Points" />
                    <FormControlLabel value="heatmap" control={<Radio />} label="Heatmap" />
                    <FormControlLabel value="districts" control={<Radio />} label="Quartiers" />
                    <FormControlLabel value="boroughs" control={<Radio />} label="Ard." />
                </RadioGroup>
            </FormControl>
        </div>
    );
}

export default FormatRadio;