import React from 'react';

import ReactDOM from 'react-dom/client';

import 'dayjs/locale/fr'
import dayjs from 'dayjs'

import './index.css';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import App from './App';
import StationDrawer from './components/drawer/StationDrawer';

dayjs.locale('fr');

const lightTheme = createTheme({
  palette: { mode: 'light' },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/stations",
        element: <StationDrawer  />,
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
