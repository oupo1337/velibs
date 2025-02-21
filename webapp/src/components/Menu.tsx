import { useState } from "react"

import Paper from "@mui/material/Paper"

import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import Check from "./Check"
import DateDisplay from "./DateDisplay"
import DateSlider from "./DateSlider"
import FormatRadio from "./FormatRadio"
import MenuTitle from "./MenuTitle"
import VelibTypeRadio from "./VelibTypeRadio"

interface MenuProps {
    timestamp: Date | undefined
    setTimestamp: React.Dispatch<React.SetStateAction<Date | undefined>>

    velibType: string
    setVelibType: React.Dispatch<React.SetStateAction<string>>

    format: string
    setFormat: React.Dispatch<React.SetStateAction<string>>

    displayBikeways: boolean
    setDisplayBikeways: React.Dispatch<React.SetStateAction<boolean>>
}
  
import '../styles/Menu.css'

const Menu: React.FC<MenuProps> = ({ timestamp, setTimestamp, velibType, setVelibType, format, setFormat, displayBikeways, setDisplayBikeways }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-inner">
                    <MenuTitle />
                    <div className="sidebar-controls">
                        <FormatRadio format={format} setFormat={setFormat} />
                        <VelibTypeRadio velibType={velibType} setVelibType={setVelibType} />
                        <Check label={"Pistes cyclables"} checked={displayBikeways} setChecked={setDisplayBikeways} />
                        <DateDisplay date={timestamp}/>
                        <DateSlider setTimestamp={setTimestamp} />
                    </div>
                </div>
            </div>

            <Paper 
                elevation={3}
                className={`toggle-button ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <KeyboardDoubleArrowLeftIcon /> : <KeyboardDoubleArrowRightIcon />}
            </Paper>
        </>
    )
}

export default Menu;