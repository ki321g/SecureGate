/*
https://ai.google.dev/edge/mediapipe/solutions/vision/object_detector/web_js
https://codepen.io/mediapipe-preview/pen/OJBVQJm
 * https://www.npmjs.com/package/@mediapipe/tasks-vision
https://codepen.io/mediapipe-preview/pen/OJByWQr
 * https://codepen.io/mediapipe-preview/pen/OJBVQJm
 * https://codepen.io/mediapipe-preview/pen/OJByWQr
 * https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector#models
 * https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector/web_js#video
 * https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js#video
 */
import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import axios from 'axios';

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
import { useCardUID } from '../contexts/cardUidContext';
import { useUser } from '../contexts/userContext';

// API key and base URL from environment variables
const deepFaceFacialRecognitionModel = import.meta.env.VITE_DEEPFACE_FACE_RECOGNITION_MODEL || "Facenet";
const deepFaceDetector = import.meta.env.VITE_DEEPFACE_DETECTOR_BACKEND || "mediapipe";
const deepFaceDistanceMetric = import.meta.env.VITE_DEEPFACE_DISTANCE_METRIC || "cosine";
const deepFaceServiceEndpoint = import.meta.env.VITE_DEEPFACE_SERVICE_URL;
const deepFaceAntiSpoofing = import.meta.env.VITE_DEEPFACE_ANTI_SPOOFING === "1";
const facialStepDelay = import.meta.env.VITE_FACIAL_STEP_DELAY;


// Constants
const faceDectorModel = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';
const faceLandmarkerModel = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const faceWASM = '/node_modules/@mediapipe/tasks-vision/wasm';
// "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"

const videoWidth = 1024;
const videoHeight = 576;
const faceLandmarkerWait = 200;

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
const WebCameraComponent = ({ enableDetectFace, isVisable, setActiveComponent, setStatus }) => {
    const { webcamRef, canvasRef } = useCamera();
    const [faceDetector, setFaceDetector] = useState(null);
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const [showLandmarks, setShowLandmarks] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [detectingFace, setDetectingFace] = useState(true); 
    const [isReady, setIsReady] = useState(false);
    const { user, setUser } = useUser();
    const [imgSrc, setImgSrc] = useState(null);
    const [hasCapturedImage, setHasCapturedImage] = useState(false);    
    const [isVerified, setIsVerified] = useState(null);  
    const [isAnalyzed, setIsAnalyzed] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [verificationData, setVerificationData] = useState(null);




    /* --- useEffect's for use with Facial Detection and Landmark Detection ---*/
    /* 
     * Different useEffect's are used,
     *   1. Initialize FaceDetector
     *   2. Initialize FaceLandmarker
     *   3. Start Face Detection Loop
     *   4. Start Landmark Drawing Loop
     */

    /* --- 1. Initialize FaceDetector --- */
    useEffect(() => {
        const initializeFaceDetection = async () => {
            const vision = await FilesetResolver.forVisionTasks( faceWASM );

            const detector = await FaceDetector.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: faceDectorModel,
                    delegate: "CPU"
                },
                runningMode: "VIDEO",
                numFaces: 1
            });
            
            // Add 1 second delay before setting status
            setTimeout(() => {
                setStatus({ text: 'DETECTING FACE', color: '#3498db' });                
                setFaceDetector(detector);
            }, facialStepDelay); // 1000 milliseconds = 1 second
        };
        console.log('enableDetectFace: ', enableDetectFace);
        initializeFaceDetection();
    }, []);

    /* --- 2. Initialize FaceLandmarker (Conditional) --- */
    useEffect(() => {
        const initializeFaceLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks( faceWASM );

            const landmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: faceLandmarkerModel,
                    delegate: "CPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 2
            });

            setFaceLandmarker(landmarker);
            // Add 1 second delay before setting status
            setTimeout(() => {
                setStatus({ text: 'ANALYZING', color: '#FFC107' });
                setIsReady(true); // FaceLandmarker is ready
            }, facialStepDelay);
        };

        // Only initialize FaceLandmarker AFTER face is detected AND a delay
        if (faceDetected) {
            setTimeout(() => {
                initializeFaceLandmarker();
            }, faceLandmarkerWait);
        }
    }, [faceDetected]);  // Triggered when faceDetected changes

    /* --- 3. Start Face Detection Loop (Conditional) --- */
    useEffect(() => {
        let animationFrame;
        let localHasCaptured = hasCapturedImage; // Create a local variable


        const detectFace = async () => {
            if (enableDetectFace && webcamRef.current?.video) {
                const video = webcamRef.current.video;
                const results = faceDetector.detectForVideo(video, performance.now());
                if (results.detections.length > 0) {
                    setFaceDetected(true);
                    // Only capture and download if we haven't already done so
                    if (!localHasCaptured) {
                        const imageSrc = webcamRef.current.getScreenshot();
                        setImgSrc(imageSrc);
                        localHasCaptured = true; // Set local variable to true
                        setHasCapturedImage(true);
                        await verify(imageSrc);
                        // downloadBase64File(imageSrc, 'txt'); 
                    };
                    setDetectingFace(false); // Stop showing "Face Not Detected"
                } else {
                    setFaceDetected(false);
                }
            }
            if (enableDetectFace) {
                animationFrame = requestAnimationFrame(detectFace);
            }
        };

        // Initial detection start after card is read
        if (enableDetectFace && webcamRef.current?.video) {
          detectFace();
        }

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [faceDetector, enableDetectFace, hasCapturedImage, imgSrc]); // Triggered when faceDetector enableDetectFace or hasCapturedImage changes

    /* --- 4. Start Landmark Drawing Loop (Conditional) --- */
    useEffect(() => {
        // Exit if FaceLandmarker is not ready
        if (!isReady || !faceLandmarker || !webcamRef.current?.video) return;

        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let lastVideoTime = -1;
        let animationFrame;

        const predictWebcam = async () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            if (video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;
                const results = faceLandmarker.detectForVideo(video, performance.now());
                drawResults(ctx, results); // Pass showLandmarks
            }

            animationFrame = requestAnimationFrame(predictWebcam);
        };

        // Start landmark prediction immediately after FaceLandmarker is ready
        if (isReady) {
            predictWebcam();
        }

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [isReady, faceLandmarker]);    
    /* --- useEfect's End --- */

    /* --- Download Base64 File Function --- */
    const downloadBase64File = (base64Data, fileType) => {
        const link = document.createElement('a');
        const timestamp = Date.now();
        
        if (fileType === 'txt') {
        const blob = new Blob([base64Data], { type: 'text/plain' });
        link.href = URL.createObjectURL(blob);
        link.download = `webcam-base64-${timestamp}.txt`;
        } else {
        link.href = base64Data;
        link.download = `webcam-capture-${timestamp}.jpeg`;
        }
        
        link.click();
    };

    // /* --- Verify User Function --- */
    const verify = async (imageSrc) => {
        try {
            const requestBody = JSON.stringify(
              {
                model_name: deepFaceFacialRecognitionModel,
                detector_backend: deepFaceDetector,
                distance_metric: deepFaceDistanceMetric,
                align: true,
                img1: imageSrc,
                img2: user.user_picture,
                enforce_detection: false,
                anti_spoofing: deepFaceAntiSpoofing,
              }
            );
    
            // console.log(`calling service endpoint ${deepFaceServiceEndpoint}/verify`)
            
            
            const response = await fetch(`${deepFaceServiceEndpoint}/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: requestBody,
            });
    
            const data = await response.json();

            // console.log('response: ', response);
            // console.log('data: ', data);
            // Save verification results to file
            // downloadJsonFile(data, `verification-results-${Date.now()}.json`);
    
            
            // Store the verification data for display
            setVerificationData(data);
            // Open the dialog to show results
            // setOpenDialog(true);
    
            if (response.status !== 200) {
              console.log(data.error);
              setIsVerified(false);
              return
            }
            // if isVerified key is true 
            if (data.verified === true) {
              setIsVerified(true);
              setIsAnalyzed(false);
              setStatus({ text: 'SUCCESS', color: '#4CAF50' });
            //   downloadJsonFile(data, `verification-results-${Date.now()}.json`);
              // Add 1 second delay before setting status
              setTimeout(() => {
                setActiveComponent('deviceSelection');
              }, facialStepDelay); 
            }
            // if isVerified key is false
            if (data.verified === false) {
                setIsVerified(false);
                setStatus({ text: 'FAILED', color: '#F44336' });
                // downloadJsonFile(data, `verification-results-${Date.now()}.json`);
                setTimeout(() => {
                    setActiveComponent('failedUserRecognition');
                }, facialStepDelay);
            }
          
        }
        catch (error) {
          console.error('Exception while verifying image:', error);
          // Show error in dialog
          setVerificationData({ error: error.message });
        //   setOpenDialog(true);
        }
    
      };

      const downloadJsonFile = (data, filename) => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || `verification-results-${Date.now()}.json`;
        link.click();
      };


    // Add a function to handle dialog close
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    /* --- Draw Face Landmark Results Function --- */
    const drawResults = (ctx, results) => {
        if (!results.faceLandmarks) return; // Only draw if landmarks exist

        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const drawingUtils = new DrawingUtils(ctx);

        for (const landmarks of results.faceLandmarks) {
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                { color: '#C0C0C070', lineWidth: 1 });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                { color: '#E0E0E0' });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
                { color: '#E0E0E0' });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                { color: '#E0E0E0' });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
                { color: '#E0E0E0' });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
                { color: '#E0E0E0' });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS,
                { color: '#E0E0E0' });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
                { color: '#E0E0E0', lineWidth: 1 });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
                { color: '#E0E0E0', lineWidth: 1 });
        }
        ctx.restore();
    };

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

         
            {/* Verification Results Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="verification-dialog-title"
                maxWidth="md"
            >
                <DialogTitle id="verification-dialog-title">
                    Face Verification Results
                </DialogTitle>
                <DialogContent>
                    {verificationData && (
                        <List>
                            <ListItem>
                                <ListItemText 
                                    primary="Verification Status" 
                                    secondary={verificationData.verified ? "✅ Verified" : "❌ Not Verified"} 
                                    secondaryTypographyProps={{ 
                                        color: verificationData.verified ? "success.main" : "error.main",
                                        fontWeight: "bold" 
                                    }}
                                />
                            </ListItem>
                            <Divider />
                            {verificationData.model && (
                                <ListItem>
                                    <ListItemText primary="Model Used" secondary={verificationData.model} />
                                </ListItem>
                            )}
                            {verificationData.detector_backend && (
                                <ListItem>
                                    <ListItemText primary="Detector" secondary={verificationData.detector_backend} />
                                </ListItem>
                            )}
                            {verificationData.distance && (
                                <ListItem>
                                    <ListItemText 
                                        primary="Distance Score" 
                                        secondary={verificationData.distance.toFixed(4)} 
                                    />
                                </ListItem>
                            )}
                            {verificationData.threshold && (
                                <ListItem>
                                    <ListItemText primary="Threshold" secondary={verificationData.threshold.toFixed(4)} />
                                </ListItem>
                            )}
                            {verificationData.error && (
                                <ListItem>
                                    <ListItemText 
                                        primary="Error" 
                                        secondary={verificationData.error} 
                                        secondaryTypographyProps={{ color: "error.main" }}
                                    />
                                </ListItem>
                            )}
                            {/* Add more fields as needed based on your API response */}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>


    </>
  );
}

export default WebCameraComponent;
