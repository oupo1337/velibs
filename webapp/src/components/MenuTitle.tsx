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
            <img src="https://i.imgur.com/d0VNuqq.png" alt='logo' style={{maxHeight: '5rem', width: '5rem'}} />
            <Typography variant="h4" component="h1">
                Paname Velibs
            </Typography>
        </Box>
    )
}

export default MenuTitle;