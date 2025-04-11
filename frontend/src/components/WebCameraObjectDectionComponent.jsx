import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';

// Import: Video Processing Libraries
import Webcam from 'react-webcam'
import {
          ObjectDetector,
          FilesetResolver,
          FaceLandmarker,
          DrawingUtils,
          FaceDetector
        } from "@mediapipe/tasks-vision"

//Context 
import { useCamera } from '../contexts/cameraContext'; 

const videoWidth = 1024;
const videoHeight = 576;
const refVideoConstraints = {
    width: videoWidth,
    height: videoHeight,
    facingMode: "user"
  }

const styles = {
    cameraBox: {
        position: 'relative',
        overflow: 'hidden',
        width: videoWidth,
        height: videoHeight,
        backgroundColor: 'primary.main', 
        border: (theme) => `10px solid ${theme.palette.primary.main}`,
        borderRadius: '8px',
    },
    cameraBoxDisplayNone: {
        display: 'none', // Hides the webcam element
        width: videoWidth,
        height: videoHeight,
    },
    webcam: {
        position: 'absolute',
        marginLeft: 'auto',
        marginRight: 'auto',
        left: 0,
        right: 0,
        textAlign: 'center',
        zindex: 9,
        width: videoWidth,
        height: videoHeight,
    },
    webCamDisplayNone: {
        display: 'none', // Hides the webcam element
        width: videoWidth,
        height: videoHeight,
    },
    canvas: {
        position: 'absolute',
        marginLeft: 'auto',
        marginRight: 'auto',
        left: 0,
        right: 0,
        textAlign: 'center',
        zindex: 9,
        width: videoWidth,
        height: videoHeight,
    },
    canvasDisplayNone: {
        display: 'none', // Hide the canvas as well
        width: videoWidth,
        height: videoHeight,
    },
}

const WebCameraObjectDectionComponent = ({ setShowFaceDector, isVisable }) => {
    const { webcamRef, canvasRef } = useCamera();
    const [personDetected, setPersonDetected] = useState(false);
    const [objectDetector, setObjectDetector] = useState(null); 
    const [lastVideoTime, setLastVideoTime] = useState(-1)

  useEffect(() => {
    const initializeObjectDetector = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "/node_modules/@mediapipe/tasks-vision/wasm"
      );
      const detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
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
    
    // Add a small delay to ensure camera is fully initialized
    const initTimeout = setTimeout(() => {
      const detect = async () => {
        const video = webcamRef.current?.video;
        if (!video || video.readyState !== 4) { // 4 = HAVE_ENOUGH_DATA
          requestAnimationFrame(detect);
          return;
        }
  
        try {
          let startTimeMs = performance.now();
          const detections = objectDetector.detectForVideo(video, startTimeMs);
          
          // Reset detection state each frame
          setPersonDetected(false);
  
          // Process detections
          if (detections && detections.detections && detections.detections.length > 0) {
            for (const detection of detections.detections) {
              if (detection.categories[0].categoryName === 'person') {
                setPersonDetected(true);
                setShowFaceDector(true); 
                break; // Exit loop if a person is found
              }
            }
  
            // Draw bounding boxes
            // if (canvasRef.current) {
            //   const canvasCtx = canvasRef.current.getContext("2d");
            //   canvasCtx.save();
            //   canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              
            //   for (const detection of detections.detections) {
            //     const boundingBox = detection.boundingBox;
            //     const category = detection.categories[0];
                
            //     // Use actual detection dimensions with a small margin
            //     canvasCtx.beginPath();
            //     canvasCtx.rect(
            //       boundingBox.originX, 
            //       boundingBox.originY,
            //       boundingBox.width, 
            //       boundingBox.height
            //     );
            //     canvasCtx.lineWidth = 2;
            //     canvasCtx.strokeStyle = 'red';
            //     canvasCtx.stroke();
            //     canvasCtx.font = '16px Arial';
            //     canvasCtx.fillStyle = 'red';
            //     canvasCtx.fillText(
            //       `${category.categoryName} (${Math.round(category.score * 100)}%)`, 
            //       boundingBox.originX + 5, 
            //       boundingBox.originY + 20
            //     );
            //   }
            //   canvasCtx.restore();
            // }
          } else {
            // Clear canvas if no detections
            if (canvasRef.current) {
              const canvasCtx = canvasRef.current.getContext("2d");
              canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
        } catch (error) {
          console.error("Detection error:", error);
        }
  
        requestAnimationFrame(detect); // Continue detection loop
      };
  
      const id = requestAnimationFrame(detect); // Start detection loop
      return () => {
        cancelAnimationFrame(id);     // Cleanup on unmount
      };
    }, 500); // 500ms delay to ensure camera is ready
    
    return () => clearTimeout(initTimeout);
  }, [objectDetector, webcamRef, canvasRef, setShowFaceDector]);
  

  return (
    <>
        <Box id='WebCameraComponent' sx={ isVisable ? styles.cameraBox : styles.cameraBoxDisplayNone }>
            <Webcam
                ref={webcamRef}
                mirrored={false}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={ refVideoConstraints }
                style={ isVisable ? styles.webcam : styles.webCamDisplayNone }
            />
            <canvas 
                ref={canvasRef}
                style={ isVisable ? styles.canvas : styles.canvasDisplayNone }
            />
        </Box>
    </>
  );
}

export default WebCameraObjectDectionComponent;