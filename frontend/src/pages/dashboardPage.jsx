import React, { useState } from 'react';
// Material UI Componnents
import { 
        Box, 
        Toolbar, 
        CssBaseline, 
        Typography
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

const drawerWidth = 320;

const styles = {  
  headerText: {
    mt: 0,
    fontSize: '2.5rem',
    color: 'text.primary',
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
  }else if (selectedItem === '/logs') {
      return <LogsContent />;
    }else if (selectedItem === '/logs/access') {
        return <AccessLogsContent />;
      }else if (selectedItem === '/logs/device') {
          return <DeviceLogsContent />;
  }else if (selectedItem === '/users') {
      return <UsersContent />;
  }
  return <DashboardContent />;
}

const DashboardPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('/'); // Initial selection

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
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <SidebarContent selectedItem={selectedItem} />
      </Box>
    </Box>
  );
};

export default DashboardPage;
