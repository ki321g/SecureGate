import React, { useState, useEffect } from 'react';
// Material UI Componnents
import { 
        Box, 
        Toolbar, 
        CssBaseline, 
        Typography,
        GlobalStyles
       } from '@mui/material';

// Custom Components
import HeaderComponent from '../components/dashboard/HeaderComponent';
import SidebarComponent from '../components/dashboard/SidebarComponent';
import DevicesContent from '../components/dashboard/devices/DevicesContent';
import UsersContent from '../components/dashboard/users/UsersContent';
import RolesContent from '../components/dashboard/roles/RolesContent';
import AccessLogsContent from '../components/dashboard/logs/AccessLogsContent';
import DeviceLogsContent from '../components/dashboard/logs/DeviceLogsContent';
import DashboardContent from '../components/dashboard/DashboardContent';
import FailedLoginComponent from '../components/dashboard/fails/FailedLoginComponent';

// Import DataContext
import { useUser } from '../contexts/userContext';// API

// API
import { failedAttemptsApi } from '../api/supabase/supabaseApi'

const drawerWidth = 340;

const styles = {  
  headerText: {
    mt: 0,
    fontSize: '2.5rem',
    alignItems: 'center',
    fontWeight: '900',
    color: 'primary.main'
  },
}


function SidebarContent({selectedItem}){
  if (selectedItem === '/') {
      return <DashboardContent />;
  } else if (selectedItem === '/devices') {
      return <DevicesContent />;
  } else if (selectedItem === '/roles') {
      return <RolesContent />;
  } else if (selectedItem === '/logs') {
      return <LogsContent />;
    }else if (selectedItem === '/logs/access') {
        return <AccessLogsContent />;
      }else if (selectedItem === '/logs/device') {
          return <DeviceLogsContent />;
  } else if (selectedItem === '/users') {
      return <UsersContent />;
  } else if (selectedItem === '/fails') {
      return <FailedLoginComponent />;
  }
  return <DashboardContent />;
}

const DashboardPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('/'); // Initial selection
  const { user } = useUser();

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Reset facial recognition attempts
        await deleteFailedAttemptsInDatabase(user.uid);

      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize. Please try again.");
      }
    };

    initializeComponent();

  }, [user.uid]);

  // function to delete failed attempts in the database
  const deleteFailedAttemptsInDatabase = async () => {
    try {
      const { error } = await failedAttemptsApi.delete(user.uid);
      
      if (error) {
        console.error('Error deleting failed attempts:', error);
      } else {
        console.log('Failed attempts record deleted successfully');
      }
    } catch (err) {
      console.error('Failed to delete failed attempts record:', err);
      // Don't throw here as this isn't critical for the component to function
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    // Close the drawer on mobile when an item is selected
    if (mobileOpen) {
      handleDrawerToggle();
    }
  };

  return (
    <>
      <GlobalStyles
        styles={{
          'body': {
            overflowY: 'hidden',
          },
          '*::-webkit-scrollbar-vertical': {
            display: 'none',
          },
        }}
      />
      <Box sx={{ display: 'flex' }}> {/* This MUST be 'flex' */}
        <CssBaseline />
        <HeaderComponent drawerWidth={drawerWidth} handleDrawerToggle={handleDrawerToggle} />
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} // Correct width and flexShrink
          aria-label="mailbox folders"
        >
          <SidebarComponent
            drawerWidth={drawerWidth}
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            onSelectItem={handleSelectItem}
          />
        </Box>
        <Box
          component="main"
          // sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
          sx={{ 
            flexGrow: 1, 
            py: 12,
            px: 2,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start', // Align content to the top
            height: '100vh', // Take full viewport height
            overflow: 'auto' // Add scrolling if content is too tall
          }}
        >
          {/* <Toolbar /> */}
          <SidebarContent selectedItem={selectedItem}/>
        </Box>
      </Box>
    </>
  );
};

export default DashboardPage;
