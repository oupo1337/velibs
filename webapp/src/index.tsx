import React from 'react';
import ReactDOM from 'react-dom/client';
import 'dayjs/locale/fr'
import dayjs from 'dayjs'

import App from './App';
import reportWebVitals from './reportWebVitals';

import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import StationDrawer, { stationLoader } from './components/drawer/StationDrawer';

dayjs.locale('fr');

const lightTheme = createTheme({
    palette: { mode: 'light' },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/:stationId",
        element: <StationDrawer  />,
        loader: stationLoader,
      }
    ]
  },
]);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
