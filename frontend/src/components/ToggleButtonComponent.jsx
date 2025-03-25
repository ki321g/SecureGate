import { Typography, Button, Stack } from '@mui/material';
import { SecurityOutlined, Dashboard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react'; // Add this import
import { cardUidContext } from '../contexts/cardUidContext'; // Add this import
import { userContext } from '../contexts/userContext'; // Add this import

const styles = {
  toggleButtonStack: {
    position: 'absolute',
    padding: 2,
    margin: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '6px',
    top: 0,
    left: 0,
    zIndex: 10, // Higher z-index than the webcam
  },
};

// Initial user state from userContext.jsx
const initialUserState = {
  uid: '123456',
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'firstName@lastName.com',
  password: '3322',
  phone_number: '1234567890',
  role_id: '1234',
  card_uid: '123456789',
  user_picture: null,
  last_seen_at: '2025-01-31T16:02:00.000Z',
  created_at: '2025-01-01T00:00:00.000Z',
};

const ToggleButtonComponent = ({ 
  activeComponent, 
  setActiveComponent,
  showFaceDector,
  setShowFaceDector
}) => {
  const navigate = useNavigate();
  const { setCardUID } = useContext(cardUidContext); // Access cardUID context
  const { setUser } = useContext(userContext); // Access user context
  
  // Function to handle setting the active component
  const handleComponentChange = (componentName) => {
    // If entering PIN component, set the cardUID and user
    if (componentName === 'enterPin') {
      setCardUID('690402134');
      setUser(initialUserState); // Set user to initial state
    }
    setActiveComponent(componentName);
  };
  
  const handleToggle = () => {
    setShowFaceDector((previousState) => !previousState); // Toggle faceDetector state
  };
  
  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <Stack id='toggleButtonStack' direction="column" spacing={2} sx={styles.toggleButtonStack}>
        {/* Toggle Face Detector/Logo Button */}
        <Button id='toggleButton' variant="contained" onClick={handleToggle}>
          {!showFaceDector ? "Toggle to FaceDector" : "Toggle to Logo"}
        </Button>
        
        {/* Buttons for each active component */}
        <Button 
          variant="contained" 
          color={activeComponent === 'scanCard' ? 'secondary' : 'primary'}
          onClick={() => handleComponentChange('scanCard')}
        >
          Scan Card
        </Button>
        
        <Button 
          variant="contained" 
          color={activeComponent === 'enterPin' ? 'secondary' : 'primary'}
          onClick={() => handleComponentChange('enterPin')}
        >
          Enter PIN
        </Button>
        
        <Button 
          variant="contained" 
          color={activeComponent === 'userRecognition' ? 'secondary' : 'primary'}
          onClick={() => handleComponentChange('userRecognition')}
        >
          User Recognition
        </Button>
        
        <Button 
          variant="contained" 
          color={activeComponent === 'failedUserRecognition' ? 'secondary' : 'primary'}
          onClick={() => handleComponentChange('failedUserRecognition')}
        >
          Failed Recognition
        </Button>
        
        <Button 
          variant="contained" 
          color={activeComponent === 'deviceSelection' ? 'secondary' : 'primary'}
          onClick={() => handleComponentChange('deviceSelection')}
        >
          Device Selection
        </Button>

        {/* Dashboard Navigation Button */}
        <Button
          id='dashboardButton'
          variant="contained"
          color="primary"
          onClick={navigateToDashboard}
          startIcon={<Dashboard />}
        >
          Go to Dashboard
        </Button>

        {/* Display current state */}
        <Typography>
          Active Component: {activeComponent}
        </Typography>
        <Typography>
          {!showFaceDector ? "Logo (showFaceDector is OFF)" : "FaceDector (showFaceDector is ON)"}
        </Typography>
      </Stack>
    </>
  );
};

export default ToggleButtonComponent;
