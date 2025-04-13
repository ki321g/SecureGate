import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';

import { SecurityOutlined } from '@mui/icons-material'

const styles = {  
  headerText: {
    mt: 0,
    ml: 1,
    fontSize: '4rem',
    alignItems: 'center',
    fontWeight: '900',
    color: 'primary.main'
  },
  securityIcon: {
    ml: -2,
    fontSize: 60,
  },
};

function HeaderComponent({ drawerWidth, handleDrawerToggle }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <SecurityOutlined sx={ styles.securityIcon } />
        <Typography variant="h1" sx={ styles.headerText } noWrap component="div">
         SecureGate
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderComponent;
