import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const MenuTitle: React.FC = () => {
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
        }}>
            <Typography variant="h4" component="h1">
                Paris Velib'
            </Typography>
        </Box>
    )
}

export default MenuTitle;