import React from "react";
import {Checkbox, FormControlLabel} from "@mui/material";

interface CheckProps {
    label: string
    checked: boolean
    setChecked: React.Dispatch<React.SetStateAction<boolean>>
}

const Check: React.FC<CheckProps> = ({label, checked, setChecked}) => {
    const handleChange = (event: any) => {
        setChecked(event.target.checked);
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