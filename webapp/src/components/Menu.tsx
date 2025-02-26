import { useState } from "react"

import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"

import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import Check from "./Check"
import DateSlider from "./DateSlider"
import FormatRadio from "./FormatRadio"
import VelibTypeRadio from "./VelibTypeRadio"

import '../styles/Menu.css'
import { Divider } from "@mui/material"

interface VelibMenuProps {
    velibType: string
    setVelibType: React.Dispatch<React.SetStateAction<string>>

    format: string
    setFormat: React.Dispatch<React.SetStateAction<string>>
}

const VelibMenu: React.FC<VelibMenuProps> = ({ velibType, setVelibType, format, setFormat }) => {
    return (
        <>
            <FormatRadio format={format} setFormat={setFormat} />
            <VelibTypeRadio velibType={velibType} setVelibType={setVelibType} />
        </>
    );
};

interface FreeFloatingMenuProps {
    freeFloatingFormat: string
    setFreeFloatingFormat: React.Dispatch<React.SetStateAction<string>>
}

const FreeFloatingMenu: React.FC<FreeFloatingMenuProps> = ({ freeFloatingFormat, setFreeFloatingFormat }) => {
    return (
        <>
            <FormatRadio format={freeFloatingFormat} setFormat={setFreeFloatingFormat} />
        </>
    );
};

interface MenuProps {
    timestamp: Date | undefined
    setTimestamp: React.Dispatch<React.SetStateAction<Date | undefined>>

    velibType: string
    setVelibType: React.Dispatch<React.SetStateAction<string>>

    format: string
    setFormat: React.Dispatch<React.SetStateAction<string>>

    displayBikeLanes: boolean
    setDisplayBikeLanes: React.Dispatch<React.SetStateAction<boolean>>

    freeFloatingFormat: string
    setFreeFloatingFormat: React.Dispatch<React.SetStateAction<string>>
}

const Menu: React.FC<MenuProps> = ({ timestamp, setTimestamp, velibType, setVelibType, format, setFormat, displayBikeLanes, setDisplayBikeLanes, freeFloatingFormat, setFreeFloatingFormat }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);

    const renderActiveTab = () => {
        switch (activeTab) {
            case 0:
                return <VelibMenu
                    velibType={velibType} 
                    setVelibType={setVelibType} 
                    format={format} 
                    setFormat={setFormat} 
                />;
            case 1:
                return <FreeFloatingMenu 
                    freeFloatingFormat={freeFloatingFormat}
                    setFreeFloatingFormat={setFreeFloatingFormat}
                />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-inner">
                    <div className="sidebar-controls">
                        <Typography variant="h6" sx={{ textAlign: 'center', mb: 1, fontWeight: 'medium' }}>
                            Paris Open Data
                        </Typography>
                            <DateSlider date={timestamp} setTimestamp={setTimestamp} />
                            <Check label={"Pistes cyclables"} checked={displayBikeLanes} setChecked={setDisplayBikeLanes} />
                        <Divider sx={{ my: 2 }} />
                        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }} variant="fullWidth">
                            <Tab label="Vélib" />
                            <Tab label="Free-floating" />
                        </Tabs>
                        {renderActiveTab()}
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
    );
};

export default Menu;