import { useState } from "react"

import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography";

import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import Check from "./Check"
import DateSlider from "./DateSlider"
import FormatRadio from "./FormatRadio"
import VelibTypeRadio from "./VelibTypeRadio"

import '../styles/Menu.css'

interface MenuProps {
    timestamp: Date | undefined
    setTimestamp: React.Dispatch<React.SetStateAction<Date | undefined>>

    velibType: string
    setVelibType: React.Dispatch<React.SetStateAction<string>>

    format: string
    setFormat: React.Dispatch<React.SetStateAction<string>>

    displayBikeLanes: boolean
    setDisplayBikeLanes: React.Dispatch<React.SetStateAction<boolean>>
}

const Menu: React.FC<MenuProps> = ({ timestamp, setTimestamp, velibType, setVelibType, format, setFormat, displayBikeLanes, setDisplayBikeLanes }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-inner">
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 1, fontWeight: 'medium' }}>
                        Paris Open Data
                    </Typography>
                    <div className="sidebar-controls">
                        <DateSlider date={timestamp} setTimestamp={setTimestamp} />
                        <FormatRadio format={format} setFormat={setFormat} />
                        <VelibTypeRadio velibType={velibType} setVelibType={setVelibType} />
                        <Check label={"Pistes cyclables"} checked={displayBikeLanes} setChecked={setDisplayBikeLanes} />
                    </div>
                </div>
            </div>

            <Paper 
                elevation={3}
                className={`toggle-button ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                sx={{ 
                    transform: isOpen ? 'translateX(480px)' : 'translateX(0)',
                    transition: 'transform 0.3s ease'
                }}
            >
                <KeyboardDoubleArrowRightIcon />
            </Paper>
        </>
    )
}

export default Menu;