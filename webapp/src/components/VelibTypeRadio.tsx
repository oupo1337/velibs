import React, {ChangeEvent} from "react";

import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";

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
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 1, fontWeight: 'medium' }}>
                Type de vélo
            </Typography>
            <Divider sx={{ mb: 2 }} />
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