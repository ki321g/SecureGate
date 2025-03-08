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
import DeviceSelectionComponent from '../components/DeviceSelectionComponent';
import EnterPinComponent from '../components/EnterPinComponent';

//Testing
import ToggleButtonComponent from '../components/ToggleButtonComponent';

// API
import { rolesApi, devicesApi, roleToDeviceApi } from '../api/supabase/supabaseApi'

//Context 
import { useCardUID } from '../contexts/cardUidContext';
import { useUser } from '../contexts/userContext';
import { useData } from '../contexts/dataContext';

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
    const [ activeComponent, setActiveComponent ] = useState('scanCard'); 
    
    useEffect(() => {

        const fetchRolesData = async () => {
            try {
                    const { data, error } = await rolesApi.getAll();
                
                    if (error) throw error;
                    setRoles(data);
                    console.log('ROLES:', data);
            } catch (error) {
                console.error('Error fetching ROLES data:', error.message);
            }
        };

        const fetchDevicesData = async () => {
            try {
                const { data, error } = await devicesApi.getAll();
                
                if (error) throw error;
                setDevices(data);
                console.log('DEVICES:', data);

            } catch (error) {
                console.error('Error fetching DEVICES data:', error.message);
            }
        };

        const fetchRolesToDevicesData = async () => {
            try {
                const { data, error } = await roleToDeviceApi.getAll();
                
                if (error) throw error;
                setRolesToDevices(data); 
                console.log('RoleToDevices:', data);

            } catch (error) {
                console.error('Error fetching RolesToDevices data:', error.message);
            }
        };
            //devicesApi, roleToDeviceApi roleToDevices
        fetchRolesData();
        fetchDevicesData();
        fetchRolesToDevicesData();
    }, []);

  return (
    <>
        {/* ScreenSaver - Logo first Screen*/}
        {!showFaceDector && (
            <Box id='LogoMainBox' sx={ styles.logoMainBox }>
            <Container id='LogoContainer' maxWidth="lg">
                <Box id='LogoContentBox' sx={ styles.logoContentBox }>
                    {/* Logo Component */}
                    <LogoComponent id='LogoComponent' />
                    {/* WebCameraComponent: Video and Canvas  */}
                    <WebCameraObjectDectionComponent setShowFaceDector={setShowFaceDector} isVisable={ false } />
                </Box>
            </Container>
            </Box>
        )}
        {/* Face Detection - Person Object has been dected */}
        {showFaceDector && (
        // {showFaceDector && toggleButton && (
            <Box id='DetectorMainBox' sx={ styles.detectorMainBox}>
                <Container id='DetectorContainer' maxWidth={false} disableGutters sx={ styles.detectorMainContainer }>
                    <Stack id='DetectorStack' direction="row" spacing={2} spacing={3} sx={ styles.detectorMainStack }>
                        {/* Left Column: WebCameraComponent Video and Canvas */}
                        <WebCameraComponent enableDetectFace={ enableDetectFace } isVisable={ true } />
                        {/* Right Column: Content */}
                        <Box id='DetectorContentBox' sx={ styles.detectorContentBox }>
                            {activeComponent === 'scanCard' && 
                                <ScanCardComponent setActiveComponent={ setActiveComponent }/>
                            }
                            {activeComponent === 'enterPin' && 
                                <EnterPinComponent setEnableDetectFace={ setEnableDetectFace } setActiveComponent={ setActiveComponent }/>
                            }
                            {activeComponent === 'userRecognition' && 
                                <UserRecognitionComponent setActiveComponent={ setActiveComponent }/>
                            }
                            {activeComponent === 'deviceSelection' && 
                                <DeviceSelectionComponent setActiveComponent={ setActiveComponent }/>
                            }
                        </Box>
                    </Stack>
                </Container>
            </Box>
        )}	

         {/* ToggleButtonComponent: Used during Development Remove of comment out */}
        <ToggleButtonComponent showFaceDector={ showFaceDector } setShowFaceDector={ setShowFaceDector }/>
    </>
  );
}

export default HomePage;
