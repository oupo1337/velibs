import React from "react";

import { Box, Typography } from "@mui/material";

function MenuTitle() {
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
        }}>
            <Typography variant="h4" component="h1">
                Paname Velibs
            </Typography>
        </Box>
    )
}

export default MenuTitle;