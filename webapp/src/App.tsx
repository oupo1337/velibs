import { useState } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Drawer from '@mui/material/Drawer';

import Menu from './components/Menu';
import VelibMap from './components/VelibMap';

import './App.css';

function App() {
  const queryClient = new QueryClient();
  const navigate = useNavigate();
  const match = useMatch('/stations/:stationId');

  const [timestamp, setTimestamp] = useState<Date | undefined>();
  const [velibType, setVelibType] = useState('bikes');
  const [format, setFormat] = useState('points');
  const [displayBikeWays, setDisplayBikeWays] = useState(false);

  const drawerOpen = Boolean(match);

  const handleClose = () => {
    navigate('/');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Menu
        timestamp={timestamp}
        setTimestamp={setTimestamp}
        velibType={velibType}
        setVelibType={setVelibType}
        format={format}
        setFormat={setFormat}
        displayBikeways={displayBikeWays}
        setDisplayBikeways={setDisplayBikeWays}
      />

      <VelibMap
        timestamp={timestamp}
        format={format}
        displayBikeWays={displayBikeWays}
      />

      <Drawer anchor='right' open={drawerOpen} onClose={handleClose}>
        <Outlet />
      </Drawer>
    </QueryClientProvider>
  );
}

export default App;
