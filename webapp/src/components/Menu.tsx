import { useState } from "react"

import Paper from "@mui/material/Paper"
import Slide from "@mui/material/Slide"
import IconButton from "@mui/material/IconButton"

import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

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
  
const Menu: React.FC<MenuProps> = ({ timestamp, setTimestamp, velibType, setVelibType, format, setFormat, displayBikeways, setDisplayBikeways }) => {
    const [menuOpened, setMenuOpened] = useState(false);

    const handleMenuClick = () => {
        setMenuOpened(!menuOpened);
    }

    return (
        <>
            <Slide direction="down" in={menuOpened}>
                <Paper elevation={3} className="sidebar-container">
                    <MenuTitle />
                    <FormatRadio format={format} setFormat={setFormat} />
                    <VelibTypeRadio velibType={velibType} setVelibType={setVelibType} />
                    <Check label={"Pistes cyclables"} checked={displayBikeways} setChecked={setDisplayBikeways} />
                    <DateDisplay date={timestamp}/>
                    <DateSlider setTimestamp={setTimestamp} />
                </Paper>
            </Slide>

            <Paper elevation={3} className="sidebar-container">
                <IconButton onClick={handleMenuClick}>
                    {menuOpened ? <KeyboardDoubleArrowUpIcon /> : <KeyboardDoubleArrowDownIcon />}
                </IconButton>
            </Paper>
        </>
    )
}

export default Menu;