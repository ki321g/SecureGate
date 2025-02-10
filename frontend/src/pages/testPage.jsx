import React, { useState } from 'react';
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


//Context 
import { useCardUID } from '../contexts/cardUidContext';
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
    toggleButtonStack: {  // Add this style object
        position: 'absolute',
        padding: 2,
        margin: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.7)', 
        borderRadius: '6px',
        top: 0,
        left: 0,
        zIndex: 10, // Higher z-index than the webcam
    },
  }

const TestPage = () => {
    const { cardUID, setCardUID } = useCardUID();
    const { user, setUser } = useUser();
    const [ cardReader, setCardReader ] = useState(false);
    const [showFaceDector, setShowFaceDector] = useState(false);
    const [enableDetectFace, setEnableDetectFace] = useState(false);

    const handleToggle = () => {
        setShowFaceDector(previousState => !previousState); // Toggle faceDetector state
    };

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
                        {/* Wrap the text content in a div */}
                        <div> 
                            <Typography id='DetectorContentHeading'  variant="h1" sx={ styles.detectorContentHeading } >
                                    STATUS
                            </Typography>
                            
                            {/* Pass setEnableDetectFace as a prop */}
                            <CardReader setEnableDetectFace={setEnableDetectFace} />
                            
                            <Typography variant="body1" color="text.secondary" component="p">
                                Welcome, {user.first_name} {user.last_name}!
                            </Typography>

                        </div> 
                        {/* End of text content wrapper */}
                        </Box>
                    </Stack>
                </Container>
            </Box>
        )}	

         {/* Conditional Rendering based on toggleButton */}
         <Stack id='toggleButtonStack' direction="column" spacing={2} sx={styles.toggleButtonStack}>
            <Button id='bottomButton' variant="contained" onClick={handleToggle}>
                Toggle
            </Button>
            {!showFaceDector ? (
                <Typography>Logo (showFaceDector is OFF)</Typography>
            ) : (
                <Typography>FaceDector (showFaceDector is ON)</Typography>
            )}
        </Stack>
    </>
  );
}

export default TestPage;
