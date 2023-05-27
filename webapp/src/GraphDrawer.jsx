import SwipeableDrawer from "@mui/material/SwipeableDrawer";

export default function GraphDrawer(props) {
    const onOpen = (e) => {
        console.log('on open');
    }

    const onClose = (e) => {
        console.log('on close');
    }

    return (
        <SwipeableDrawer
            anchor='right'
            open={props.open}
            onOpen={onOpen}
            onClose={onClose}
        >
            <div style={{width: '50%', display: 'inline-block'}}>
                bonjour
            </div>
        </SwipeableDrawer>
    );
}