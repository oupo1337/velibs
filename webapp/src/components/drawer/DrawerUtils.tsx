import Box from "@mui/material/Box/Box";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";

export const DrawerLoader = () => {
    return (
        <Box style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={200}/>
        </Box>
    );
}

export const DrawerError = () => {
    return (
        <Box style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Impossible de charger les données.</p>
        </Box>
    );
}