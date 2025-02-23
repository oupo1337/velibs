import { useState } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Drawer from '@mui/material/Drawer';

import Menu from './components/Menu';
import VelibMap from './components/VelibMap';

const transitionDuration = {
  enter: 300,
  exit: 200
};

const slideProps = {
  easing: {
    enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

const paperProps = {
  sx: {
    width: '100%',
    maxWidth: '80vw',
    height: '100%',
    boxShadow: '-8px 0px 20px rgba(0, 0, 0, 0.15)',
    bgcolor: '#ffffff',
    padding: '24px',
    overflowY: 'auto',
    '& .MuiBox-root': {  // Target MUI Box components
      marginBottom: '24px',
      paddingBottom: '24px',
      borderBottom: '2px solid #e0e0e0',
    },
    '& .MuiPaper-root': {  // Target MUI Paper components
      marginBottom: '24px',
      padding: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    '& .MuiGrid-root': {  // Target MUI Grid components
      gap: '16px',
    }
  }
};

const toastOptions = {
  duration: 4000,
  style: {
    background: '#363636',
    color: '#fff',
  },
  error: {
    duration: 5000,
  },
}

function App() {
  const queryClient = new QueryClient();
  const navigate = useNavigate();
  const match = useMatch('/station');

  const [timestamp, setTimestamp] = useState<Date | undefined>();
  const [velibType, setVelibType] = useState('bikes');
  const [format, setFormat] = useState('points');
  const [displayBikeLanes, setDisplayBikeLanes] = useState(false);

  const drawerOpen = Boolean(match);

  const handleClose = () => navigate('/');

  return (
    <QueryClientProvider client={queryClient}>
      <Menu
        timestamp={timestamp}
        setTimestamp={setTimestamp}
        velibType={velibType}
        setVelibType={setVelibType}
        format={format}
        setFormat={setFormat}
        displayBikeLanes={displayBikeLanes}
        setDisplayBikeLanes={setDisplayBikeLanes}
      />

      <VelibMap
        timestamp={timestamp}
        format={format}
        displayBikeLanes={displayBikeLanes}
        velibType={velibType}
      />

      <Drawer 
        anchor='right' 
        open={drawerOpen} 
        onClose={handleClose}
        transitionDuration={transitionDuration}
        SlideProps={slideProps}
        PaperProps={paperProps}
      >
        <Outlet />
      </Drawer>

      <Toaster position="bottom-right" toastOptions={toastOptions} />
    </QueryClientProvider>
  );
}

export default App;
