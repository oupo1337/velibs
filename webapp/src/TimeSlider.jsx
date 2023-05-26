import Slider from "@mui/material/Slider";

export default function TimeSlider(props) {
    const handleSliderChange = (e, newValue) => {
        const timestamp = props.timestamps[newValue];

        props.map
            .getSource('bikes')
            .setData(`http://runtheit.com:8080/api/statuses.geojson?timestamp=${timestamp}`);
        props.setValue(newValue);
    }

    return (
        <div className="sidebar" style={{flex: 1}}>
            <Slider
                aria-label="Temperature"
                valueLabelDisplay="off"
                defaultValue={props.timestamps.length - 1}
                value={props.value}
                onChange={handleSliderChange}
                step={1}
                marks
                min={0}
                max={props.timestamps.length - 1}
            />
        </div>
    );
}