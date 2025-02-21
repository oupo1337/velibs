import React from "react";

import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";

interface CheckProps {
    label: string
    checked: boolean
    setChecked: React.Dispatch<React.SetStateAction<boolean>>
}

const Check: React.FC<CheckProps> = ({label, checked, setChecked}) => {
    const handleChange = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setChecked(checked);
    };

    return (
        <div className="menu-item">
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 1, fontWeight: 'medium' }}>
                Extras
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControlLabel
                control={<Checkbox checked={checked} onChange={handleChange} />}
                label={label}
            />
        </div>
    );
}

export default Check;