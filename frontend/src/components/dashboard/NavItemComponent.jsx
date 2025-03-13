import React from 'react';
import { 
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    Collapse, 
    List,
    Divider
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const styles = {  
  navText: {
    mt: 0,
    fontSize: '2rem',
    fontFamily: "'Montserrat', sans-serif",
    color: 'text.primary',
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
  childNavIcon : {
    minWidth: 0,
    mr: 2, 
    ml: 3,
    '& .MuiSvgIcon-root': { 
      fontSize: '3rem' 
    },
  },
};


const NavItem = ({ item, onSelectItem }) => {
  const [open, setOpen] = React.useState(false);

  if (item.children) {
    return (
      <>
        <ListItemButton onClick={() => setOpen(!open)} sx={{ py: 2 }}>
          {item.icon && <ListItemIcon sx={{ ...styles.navIcon }}>{item.icon}</ListItemIcon>}
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              ...styles.navText,
            }}
          />
          {open ? <ExpandLess sx={{ fontSize: '3rem', fontWeight: '900' }}/> : <ExpandMore sx={{ fontSize: '3rem', fontWeight: '900' }}/>}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child, index) => (
              <ListItem key={index} disablePadding sx={{ pl: 0 }}>
                <ListItemButton onClick={() => onSelectItem(child.segment)}>
                  {child.icon && <ListItemIcon sx={{ ...styles.childNavIcon }}>{child.icon}</ListItemIcon>}
                  <ListItemText
                    primary={child.title}
                    primaryTypographyProps={{
                      ...styles.navText,
                      fontSize: '1.6rem', 
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <>
    <ListItem key={item.title} disablePadding>
      <ListItemButton onClick={() => onSelectItem(item.segment)} sx={{ py: 2 }}>
        {item.icon && <ListItemIcon sx={{ ...styles.navIcon,  }}>{item.icon}</ListItemIcon>}
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            ...styles.navText
          }}
        />
      </ListItemButton>
    </ListItem>
    </>
  );
}

export default NavItem;
