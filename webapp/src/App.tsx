import {useEffect, useState} from 'react';
import {Outlet, useMatch, useNavigate} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import Drawer from '@mui/material/Drawer';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';

import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import Check from './components/Check';
import DateDisplay from "./components/DateDisplay";
import DateSlider from './components/DateSlider';
import MenuTitle from './components/MenuTitle';
import VelibMap from './components/VelibMap';
import FormatRadio from "./components/FormatRadio";
import VelibTypeRadio from "./components/VelibTypeRadio";

import './App.css';

function App() {
  const queryClient = new QueryClient();
  const navigate = useNavigate();
  const match = useMatch('/stations/:stationId');
  const [data, setData] = useState({});
  const [bikeWays, setBikeWays] = useState({});
  const [timestamps, setTimestamps] = useState<Date[]>([]);
  const [value, setValue] = useState(0);
  const [velibType, setVelibType] = useState('bikes');
  const [format, setFormat] = useState('points');
  const [displayBikeWays, setDisplayBikeWays] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const drawerOpen = Boolean(match);

  const handleClose = () => {
    navigate('/');
  }

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  }

  useEffect(() => {
    fetch(`https://api.velib.runtheit.com/api/statuses.geojson`)
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error(error));
  }, [])

  useEffect(() => {
    fetch(`https://api.velib.runtheit.com/api/v1/bikeways`)
      .then(response => response.json())
      .then(data => setBikeWays(data))
      .catch(error => console.error(error))
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Slide direction="down" in={menuOpen} mountOnEnter unmountOnExit>
        <Paper elevation={3} className="sidebar-container">
          <MenuTitle />
          <FormatRadio format={format} setFormat={setFormat} />
          <VelibTypeRadio velibType={velibType} setVelibType={setVelibType} />
          <Check label={"Pistes cyclables"} checked={displayBikeWays} setChecked={setDisplayBikeWays} />
          <DateDisplay date={timestamps[value]}/>
          <DateSlider format={format} timestamps={timestamps} setTimestamps={setTimestamps} value={value} setValue={setValue} setData={setData} />
        </Paper>
      </Slide>

      <Paper elevation={3} className="sidebar-container">
        <IconButton onClick={handleMenuClick}>
          {menuOpen ? <KeyboardDoubleArrowUpIcon /> : <KeyboardDoubleArrowDownIcon />}
        </IconButton>
      </Paper>

      <VelibMap data={data} bikeWays={bikeWays} displayBikeWays={displayBikeWays} format={format}/>

      <Drawer anchor='right' open={drawerOpen} onClose={handleClose}>
        <Outlet />
      </Drawer>
    </QueryClientProvider>
  );
}

export default App;
