import React from 'react';

// Material UI Components
import { 
    Drawer, 
    Toolbar, 
    Divider, 
    List, 
    Typography
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


// Custom Components
import NavItem from './NavItemComponent';

const styles = { 
  securityIcon: {
    fontSize: 60,
    color: 'primary.main'
  },
};

const NAVIGATION = [
  // {
  //   kind: 'header',
  //   title: 'Main items',
  // },
  {
    segment: '/', // Use root path for Dashboard
    title: 'DASHBOARD',
    icon: <DashboardIcon />,
  },
  {
      kind: 'divider',
  },
  {
    segment: '/devices', // Example path
    title: 'DEVICES',
    icon: <ImportantDevicesIcon />,
  },
  {
      kind: 'divider',
  },
  {
    segment: '/roles', // Example path
    title: 'ROLES',
    icon: <BadgeIcon />,
  },
  {
      kind: 'divider',
  },
  {
    segment: '/users', // Example path
    title: 'USERS',
    icon: <GroupIcon />,
  },
  {
      kind: 'divider',
  },
  {
    segment: '/logs', // Example path
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
];

const SidebarComponent = ({ drawerWidth, mobileOpen, handleDrawerToggle, onSelectItem }) => {
  
  const drawer = (
    <div>
      <Toolbar sx={{ height: 74 }} />
      <Divider />
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
      <Divider />
    </div>
  );  

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' }, // Correct display for desktop
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
