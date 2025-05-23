import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Material UI Components
import { 
    Drawer, 
    Toolbar, 
    Divider, 
    Typography,
    Button,
    Box,
    List,
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
} from '@mui/material';

// Material Icons
import { SecurityOutlined } from '@mui/icons-material'
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import ImportantDevicesIcon from '@mui/icons-material/ImportantDevices';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import BadgeIcon from '@mui/icons-material/Badge';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import ErrorIcon from '@mui/icons-material/Error';

// Auth Context
import { useAuth } from '../../contexts/authContext';

// Custom Components
import NavItem from './NavItemComponent';

const styles = { 
  securityIcon: {
    fontSize: 60,
    color: 'primary.main'
  },
  navText: {
    mt: 0,
    fontSize: '2rem',
    fontFamily: "'Montserrat', sans-serif",
    alignItems: 'center',
    fontWeight: '900',
    color: 'primary.main'
  },
  navIcon : {
    minWidth: 0, 
    mr: 2, 
    '& .MuiSvgIcon-root': { 
      fontSize: '3rem' 
    },
  },
  logoutText: {
    py: 1.5, 
    spx: 2,
    mt: 0,
    fontSize: '2rem',
    fontFamily: "'Montserrat', sans-serif",
    color: 'text.primary',
    alignItems: 'center',
    fontWeight: '900', 
    '& .MuiButton-startIcon': {
      marginRight: 1, 
    },
    '& .MuiSvgIcon-root': {
      fontSize: '3rem',  
    }
  },
};

const NAVIGATION = [
  {
    segment: '/', // Use root path for Dashboard
    title: 'DASHBOARD',
    icon: <DashboardIcon />,
  },
  {
      kind: 'divider',
  },
  {
    segment: '/devices', 
    title: 'DEVICES',
    icon: <ImportantDevicesIcon />,
  },
  {
      kind: 'divider',
  },
  {
    segment: '/roles', 
    title: 'ROLES',
    icon: <BadgeIcon />,
  },
  {
      kind: 'divider',
  },
  {
    segment: '/users', 
    title: 'USERS',
    icon: <GroupIcon />,
  },
  {
      kind: 'divider',
  },
  {
    segment: '/logs', 
    title: 'LOGS',
    icon: <ListAltIcon />,
    children: [
      {
        segment: '/logs/access',
        title: 'ACCESS LOGS',
        icon: <MeetingRoomIcon />,
      },
      {
        segment: '/logs/device',
        title: 'DEVICE LOGS',
        icon: <DevicesOtherIcon />,
      },
    ],
  },
  {
      kind: 'divider',
  },
  {
    segment: '/fails', 
    title: 'FAILED LOGIN',
    icon: <ErrorIcon />,
  },
];

const SidebarComponent = ({ drawerWidth, mobileOpen, handleDrawerToggle, onSelectItem }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Toolbar sx={{ height: 74 }} />
      <Divider />
      
      {/* Main navigation - will take available space */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ py: 0 }}>
          {NAVIGATION.map((item, index) => {
            if (item.kind === 'header') {
              return (
                <Typography key={index} variant="overline" display="block" sx={{ px: 2, pt: 1, fontSize: '0.9rem', fontWeight: 500 }}>
                  {item.title}
                </Typography>
              );
            }
            if (item.kind === 'divider') {
              return <Divider key={index} />;
            }
            return <NavItem key={index} item={item} onSelectItem={onSelectItem} />;
          })}
        </List>
      </Box>
      
      {/* Logout section - fixed at bottom, styled like NavItems */}
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <List sx={{ py: 0, }}>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout} 
              sx={{ 
                py: 2,
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'rgba(211, 47, 47, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.5)' // Light red hover effect
                }
              }}
            >
              <ListItemIcon sx={{ ...styles.navIcon, color: '#fofofo' }}>
                <LogoutIcon sx={{ fontSize: '3rem' }} />
              </ListItemIcon>
              <ListItemText
                primary="LOG OUT"
                primaryTypographyProps={{
                  ...styles.navText,
                  color: '#fofofo' // Red text color
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );  

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default SidebarComponent;