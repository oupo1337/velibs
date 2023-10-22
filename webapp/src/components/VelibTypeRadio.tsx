import React, {ChangeEvent} from "react";

import {FormControl, FormControlLabel, Radio, RadioGroup} from "@mui/material";

interface VelibTypeRadioProps {
    velibType : string
    setVelibType : React.Dispatch<React.SetStateAction<string>>
}

const VelibTypeRadio : React.FC<VelibTypeRadioProps> = ({ velibType, setVelibType }) => {
    const handleChange = (_event : ChangeEvent<HTMLElement>, value : string) => {
        setVelibType(value);
    }

    return (
        <div className="sidebar">
            <FormControl>
                <RadioGroup row value={velibType} onChange={handleChange}>
                    <FormControlLabel value="bikes" control={<Radio />} label="Tous" />
                    <FormControlLabel value="mechanical" control={<Radio />} label="Mécaniques" />
                    <FormControlLabel value="electric" control={<Radio />} label="Éléctriques" />
                </RadioGroup>
            </FormControl>
        </div>
    );
}

export default VelibTypeRadio;