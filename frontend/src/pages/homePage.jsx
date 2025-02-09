
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'

// Import: Video Processing Libraries
import Webcam from 'react-webcam'
import {
          ObjectDetector,
          FilesetResolver,
        } from "@mediapipe/tasks-vision"

// Import: Material UI Components
import {
          Box,
          Typography,
          Container
        } from '@mui/material'

// Import: Custom Components
import LogoComponent from '../components/homepage/logo'
import TempButtonsComponent from '../components/homepage/tempButtons'


const refVideoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
}
const styles = {
  mainBox: {
    display: 'flex',
    minHeight: '100vh',
    minWidth: '100vw',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'background.paper'
  },
  contentBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 4,
    py: 8
  },
  webcam: {
    display: 'none', // Hides the webcam element
  },
  canvas: {
    display: 'none', // Hide the canvas as well
  },
  
  // webcam: {
  //   position: 'absolute',
  //   marginLeft: 'auto',
  //   marginRight: 'auto',
  //   // display: 'none', 
  //   left: 0,
  //   right: 0,
  //   textAlign: 'center',
  //   zindex: 9,
  //   width: 1280,
  //   height: 720,
  // },
  // canvas: {
  //   position: 'absolute',
  //   marginLeft: 'auto',
  //   marginRight: 'auto',
  //   // display: 'none', 
  //   left: 0,
  //   right: 0,
  //   textAlign: 'center',
  //   zindex: 9,
  //   width: 1280,
  //   height: 720,
  // },
}

const HomePage = () => {
  const navigate = useNavigate()
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [personDetected, setPersonDetected] = useState(false);
  const [objectDetector, setObjectDetector] = useState(null); 
  const [lastVideoTime, setLastVideoTime] = useState(-1);

  useEffect(() => {
    const initializeObjectDetector = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "/node_modules/@mediapipe/tasks-vision/wasm"
      );
      const detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
          delegate: "CPU"
        },
        scoreThreshold: 0.5,
        runningMode: "VIDEO"
      });
      setObjectDetector(detector); // Set the state with the created detector
    };
    initializeObjectDetector();
  }, []);



  useEffect(() => {
    if (!webcamRef.current || !objectDetector) {
      return; // Exit if webcam or detector isn't ready
    }
    // console.log('Detect Function Initialized');

    const detect = async () => {
      const video = webcamRef.current.video;
      // console.log('Video:', video);
      if (!video) {
        return
      }

      let startTimeMs = performance.now();
      let results = null;
      if (video.currentTime !== lastVideoTime) {
        setLastVideoTime(video.currentTime);
        const detections = objectDetector.detectForVideo(video, startTimeMs);
        results = detections;
      }

      // Reset detection state each frame
      setPersonDetected(false);

      if (results.detections.length > 0) {
        for (const detection of results.detections) {
          if (detection.categories[0].categoryName === 'person') {
            setPersonDetected(true);
            navigate('/camera')
            break; // Exit loop if a person is found
          }
        }

        // Bounding box drawing code (optional, can be removed)
        const canvasCtx = canvasRef.current.getContext("2d");
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        for (const detection of results.detections) {
          const boundingBox = detection.boundingBox;
          const category = detection.categories[0];
          canvasCtx.beginPath();
          canvasCtx.rect(boundingBox.originX, boundingBox.originY, boundingBox.width, boundingBox.height);
          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = 'red';
          canvasCtx.stroke();
          canvasCtx.font = '16px Arial';
          canvasCtx.fillStyle = 'red';
          canvasCtx.fillText(`${category.categoryName} (${Math.round(category.score * 100)}%)`, boundingBox.originX + 5, boundingBox.originY + 20);
        }
        canvasCtx.restore();
      } else {
          const canvasCtx = canvasRef.current.getContext("2d");
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      requestAnimationFrame(detect); // Continue detection loop
    };

    const id = requestAnimationFrame(detect); // Start detection loop
    return () => cancelAnimationFrame(id);     // Cleanup on unmount

  }, [objectDetector]); // Depend on the objectDetector state


  return (
    <>
     {/* {personDetected && (
      <Typography variant="h4" color="error">
        Detected a Person
      </Typography>
     )} */}
    <Box sx={ styles.mainBox }>
      <Container maxWidth="lg">
        <Box sx={ styles.contentBox }>
          <LogoComponent />
          {/* {personDetected && (
            <Typography variant="h4" color="error">
              Detected a Person
            </Typography>
          )} */}
          {/* <TempButtonsComponent /> */}
          {/* <Webcam ref={webcamRef} audio={false} 
            height={720} width={1280} screenshotFormat="image/jpeg" videoConstraints={ refVideoConstraints } style={styles.webcam} /> */}
          <Webcam
            ref={webcamRef}
            audio={false}
            height={720}
            screenshotFormat="image/jpeg"
            width={1280}
            videoConstraints={ refVideoConstraints}
            style={styles.webcam}
          />
          <canvas ref={canvasRef} style={styles.canvas}
          />
        </Box>
      </Container>
    </Box>
    </>
  )
}

export default HomePage















// import React, { useRef, useEffect, useState } from 'react';

// // Import: Video Processing Libraries
// import Webcam from 'react-webcam'
// import {
//           ObjectDetector,
//           FaceLandmarker,
//           FilesetResolver,
//           DrawingUtils,
//           FaceDetector
//         } from "@mediapipe/tasks-vision"

// // Import: Material UI Components
// import { 
//           Box, 
//           Typography, 
//           Container
//         } from '@mui/material'

// // Import: Custom Components
// import LogoComponent from '../components/homepage/logo'
// import TempButtonsComponent from '../components/homepage/tempButtons'
// const styles = {
//   mainBox: {
//     display: 'flex',
//     minHeight: '100vh',
//     minWidth: '100vw',
//     alignItems: 'center',
//     justifyContent: 'center',
//     bgcolor: 'background.paper'
//   },
//   contentBox: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     textAlign: 'center',
//     gap: 4,
//     py: 8
//   },
// }

// const HomePage = () => {

//   return (
//     <Box sx={ styles.mainBox }>
//       <Container maxWidth="lg">
//         <Box sx={ styles.contentBox }>
//           <LogoComponent />
//           <TempButtonsComponent />
//         </Box>
//       </Container>
//     </Box>
//   )
// }

// export default HomePage