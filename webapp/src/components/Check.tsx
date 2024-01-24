import React from "react";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

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
        <div className="sidebar" style={{flex: 1}}>
            <FormControlLabel
                control={<Checkbox checked={checked} onChange={handleChange} />}
                label={label}
            />
        </div>
    );
}

export default Check;