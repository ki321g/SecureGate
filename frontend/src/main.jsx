
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom";
import palette from './theme/palette';
import './assets/fonts/fonts.css';
import './main.css'

// Contexts
import AppContextProvider from './contexts/appContexts';

// Routes/Pages
import HomePage from "./pages/homePage";
import DashboardPage from "./pages/dashboardPage"
import AboutPage from "./pages/aboutPage"
import CameraPage from "./pages/cameraPage"
import TestPage from "./pages/testPage"

// Set Theme
const currentTheme = createTheme(palette)

// Query client it used to make API calls and cache the data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 360000,
      refetchInterval: 360000, 
      refetchOnWindowFocus: false
    },
  },
});

/* 
 * App is the main component that sets up the application.
 * It provides the query client, theme, routing, and user context to the app.
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>  {/* Provides the query client to the app */}
      <ThemeProvider theme={currentTheme}>      {/* Provides the theme to the app */}
          <BrowserRouter>                       {/* Provides the routing to the app */}
            <AppContextProvider>               {/* Provides the user context to the app */}
              <Routes>                          {/* Defines the routes for the app */}
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/camera" element={<CameraPage />} />
                <Route path="/test" element={<TestPage />} />
              </Routes>
            </AppContextProvider>
          </BrowserRouter>
        </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

/* 
 * StrictMode is a tool for highlighting potential problems in an application. 
 * Like Fragment, StrictMode does not render any visible UI. 
 * It activates additional checks and warnings for its descendants.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

