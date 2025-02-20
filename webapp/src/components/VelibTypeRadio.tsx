import React, {ChangeEvent} from "react";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

interface VelibTypeRadioProps {
    velibType : string
    setVelibType : React.Dispatch<React.SetStateAction<string>>
}

const VelibTypeRadio : React.FC<VelibTypeRadioProps> = ({ velibType, setVelibType }) => {
    const handleChange = (_event : ChangeEvent<HTMLElement>, value : string) => {
        setVelibType(value);
    }

    return (
        <div className="menu-item">
            <FormControl fullWidth>
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