import React, { useEffect, useState, useRef } from 'react';

import { 
    Box,
    Typography,
    Container,
    Stack,
    Button,
} from '@mui/material';

// Components
import CardReader from '../components/CardReader';
import ScreenSaverComponent from '../components/ScreenSaverComponent';
import WebCameraComponent from '../components/WebCameraComponent';
import WebCameraObjectDectionComponent from '../components/WebCameraObjectDectionComponent';
import LogoComponent from '../components/LogoComponent';
import ScanCardComponent from '../components/ScanCardComponent';
import UserRecognitionComponent from '../components/UserRecognitionComponent';
import FailedUserRecognitionComponent from '../components/FailedUserRecognitionComponent';
import DeviceSelectionComponent from '../components/DeviceSelectionComponent';
import EnterPinComponent from '../components/EnterPinComponent';
import SuccessComponent from '../components/SuccessComponent';

//Testing
import ToggleButtonComponent from '../components/ToggleButtonComponent';

// API
import { rolesApi, devicesApi, roleToDeviceApi } from '../api/supabase/supabaseApi'

//Context 
import { useCardUID } from '../contexts/cardUidContext';
import { useData } from '../contexts/dataContext';
import { useUser } from '../contexts/userContext';

const videoWidth = 1024;
const videoHeight = 576;

const styles = {
    logoMainBox: {
      display: 'flex',
      minHeight: '100vh',
      minWidth: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.paper'
    },
    logoContentBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 4,
      py: 8
    },
    logoStack: {
        minWidth: '100vw',
        width: '100%',
    },
    detectorMainBox: {
        display: 'flex',
        minHeight: '100vh',
        minWidth: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper'
    },
    detectorMainContainer: {
        padding: 0,
        // maxWidth: 'lg',
    },
    detectorMainStack: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 8,
        gap: 4,
    },
    detectorContentBox: {
        display: 'flex',
        overflowY: 'none',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: videoHeight,
        textAlign: 'center',
        backgroundColor: '#3D3D3D',
        border: (theme) => `10px solid ${theme.palette.primary.main}`, 
        borderRadius: '8px',
        padding: '0px',
        width: 500,
        mt: 4,
    },
    detectorContentHeading: {
        color: 'black',
        fontSize: '60px',
        fontWeight: 'bold',
    },
    pulsingText: {
        mt: 2,
        color: 'text.secondary',
        animation: 'pulse 2s infinite'
      }
  }

const HomePage = () => {
    const { devices, setDevices } = useData();
    const { roles, setRoles } = useData();
    const { roleToDevices, setRolesToDevices } = useData();
    const { cardUID, setCardUID } = useCardUID();
    const { user, setUser } = useUser();
    const [ cardReader, setCardReader ] = useState(false);
    const [ showFaceDector, setShowFaceDector ] = useState(false);
    const [ enableDetectFace, setEnableDetectFace ] = useState(false);
    const [recognitionAttempts, setRecognitionAttempts] = useState(0);
    const [ activeComponent, setActiveComponent ] = useState('scanCard');
    const [resetKey, setResetKey] = useState(0);
    const [status, setStatus] = useState({
        text: 'DETECTING FACE',
        color: '#4CAF50'
    });

    // Call this function when you want to reset the WebCameraComponent
const resetWebcamComponent = () => {
    setResetKey(prevKey => prevKey + 1);
  };
  

  return (
    <>
        {/* ScreenSaver - Logo first Screen*/}
        {!showFaceDector && (
            <Box 
                id='LogoMainBox' 
                sx={{ 
                    ...styles.logoMainBox,
                    cursor: 'pointer' // Add cursor pointer to indicate it's clickable
                }}
                onClick={() => setShowFaceDector(true)} // Add onClick handler
            >
            <Container id='LogoContainer' maxWidth="lg">
                <Box id='LogoContentBox' sx={ styles.logoContentBox }>
                    {/* Logo Component */}
                    <LogoComponent id='LogoComponent' />
                    <Typography 
                        variant="h2" 
                        sx={{ 
                            mt: 0, 
                            color: 'text.secondary',
                            animation: 'pulse 2s infinite',
                            fontSize: '10rem',
                            fontWeight: '900'
                        }}
                    >
                        TAP SCREEN 
                    </Typography>
                </Box>
            </Container>
            </Box>
            // <Box id='LogoMainBox' sx={ styles.logoMainBox }>
            // <Container id='LogoContainer' maxWidth="lg">
            //     <Box id='LogoContentBox' sx={ styles.logoContentBox }>
            //         {/* Logo Component */}
            //         <LogoComponent id='LogoComponent' />
            //         {/* WebCameraComponent: Video and Canvas  */}
            //         <WebCameraObjectDectionComponent setShowFaceDector={setShowFaceDector} isVisable={ false } />
            //     </Box>
            // </Container>
            // </Box>
        )}
        {/* Face Detection - Person Object has been dected */}
        {showFaceDector && (
        // {showFaceDector && toggleButton && (
            <Box id='DetectorMainBox' sx={ styles.detectorMainBox}>
                <Container id='DetectorContainer' maxWidth={false} disableGutters sx={ styles.detectorMainContainer }>
                    <Stack id='DetectorStack' direction="row" spacing={2} spacing={3} sx={ styles.detectorMainStack }>
                        {/* Left Column: WebCameraComponent Video and Canvas */}
                        {/* <WebCameraComponent 
                            enableDetectFace={enableDetectFace} 
                            isVisable={activeComponent === 'userRecognition'} 
                            setActiveComponent={setActiveComponent} 
                            setStatus={setStatus}
                        /> */}




                        {/* <WebCameraComponent 
                            enableDetectFace={enableDetectFace} 
                            isVisable={ true} 
                            setActiveComponent={setActiveComponent} 
                            setStatus={setStatus}
                        /> */}

                        <WebCameraComponent 
                            key={resetKey}
                            enableDetectFace={enableDetectFace}
                            isVisable={activeComponent === 'userRecognition'}
                            setActiveComponent={setActiveComponent}
                            setStatus={setStatus}
                        />

 {/* Another way to reset component is to use a key prop that changes whenever you want to reset the component. Here's how you can implement this approach:

1. In the parent component that renders WebCameraComponent, add a state variable for the reset key:

ADD
const [resetKey, setResetKey] = useState(0);

2. Then pass this key to the WebCameraComponent:
// In the parent component's render method
<WebCameraComponent 
  key={resetKey}
  enableDetectFace={enableDetectFace}
  isVisable={isVisable}
  setActiveComponent={setActiveComponent}
  setStatus={setStatus}
/>

3. When you want to reset the component (for example, when a user fails verification and you want to try again), increment the key:

// Call this function when you want to reset the WebCameraComponent
const resetWebcamComponent = () => {
  setResetKey(prevKey => prevKey + 1);
};

This approach doesn't require any changes to the WebCameraComponent itself. The parent component controls when to reset it by changing the key prop.

Alternatively, if you prefer to stick with the current approach of resetting within the component, you can modify your useEffect to depend on both isVisable and enableDetectFace:

useEffect(() => {
    resetComponent();
    
    return () => {
        // Cleanup code
    };
}, [isVisable, enableDetectFace]); // Depend on both visibility and detection flag

This way, the component will reset whenever it becomes visible or when face detection is enabled/disabled.


*/}

                        {/* Right Column: Content */}
                        <Box id='DetectorContentBox' sx={ styles.detectorContentBox }>
                            {activeComponent === 'scanCard' && 
                                <ScanCardComponent setActiveComponent={ setActiveComponent }/>
                            }
                            {activeComponent === 'enterPin' && 
                                <EnterPinComponent setEnableDetectFace={ setEnableDetectFace } setActiveComponent={ setActiveComponent }/>
                            }
                            {activeComponent === 'userRecognition' && 
                                <UserRecognitionComponent setActiveComponent={ setActiveComponent } status={ status }/>
                            }
                            {activeComponent === 'failedUserRecognition' && 
                                <FailedUserRecognitionComponent 
                                    setActiveComponent={ setActiveComponent }
                                    setShowFaceDector={setShowFaceDector}
                                />
                            }
                            {activeComponent === 'deviceSelection' && 
                                <DeviceSelectionComponent setActiveComponent={ setActiveComponent }/>
                            }
                            {activeComponent === 'successUserRecognition' && 
                                <SuccessComponent 
                                    setActiveComponent={ setActiveComponent }
                                    setShowFaceDector={setShowFaceDector}
                                />
                            }
                        </Box>
                    </Stack>
                </Container>
            </Box>
        )}	

         {/* ToggleButtonComponent: Used during Development Remove of comment out */}
        {/* <ToggleButtonComponent showFaceDector={ showFaceDector } setShowFaceDector={ setShowFaceDector }/> */}
        {/* <ToggleButtonComponent 
            activeComponent={activeComponent} 
            setActiveComponent={setActiveComponent}
            showFaceDector={showFaceDector}
            setShowFaceDector={setShowFaceDector}
            /> */}
  
    </>
  );
}

export default HomePage;
