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
import React, { useRef, useEffect, useState, useContext } from 'react';
import { Box, Typography, Container, Button, Stack } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

//Context 
import { userContext } from '../contexts/userContext'

//Camera
import Webcam from 'react-webcam'
import {
    FaceLandmarker,
    FilesetResolver,
    DrawingUtils,
    FaceDetector
} from "@mediapipe/tasks-vision"

import CardReader from '../components/cameraPage/readCard';

const videoWidth = 1024;
const videoHeight = 576;
const cameraWait = 1000;
const faceDectctorWait = 1000;
const faceLandmarkerWait = 1000;

const refVideoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  }
  
const styles = {	
    mainBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        minHeight: '100vh',
        minWidth: '100vw',
        alignItems: 'center',
        bgcolor: 'background.paper',
        margin: 0,
        padding: 0,
    },
    mainContainer: {
        padding: 0,
    },
    mainStack: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 8,
        gap: 4,
    },
    cameraBox: {
        position: 'relative',
        overflow: 'hidden',
        width: videoWidth,
        height: videoHeight,
        backgroundColor: '#4CAF50',
        border: '10px solid #4CAF50',
        borderRadius: '8px',
    },
    webcam: {
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 1,
        width: '100%',
        height: '100%',
        transform: 'scaleX(-1)',
    },	
    canvas: {
        position: "absolute",
        transform: 'scaleX(-1)',
        left: 0,
        top: 0,
        zIndex: 2,
        width: '100%',
        height: '100%',
    },
    contentBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#3D3D3D',
        height: videoHeight,
        textAlign: 'center',
        border: '10px solid #4CAF50', 
        borderRadius: '8px',
        padding: '0px',
        width: 500,
        mt: 4,
    },
    contentHeading: {
        color: 'black',
        fontSize: '60px',
        fontWeight: 'bold',
    },
}

// Component to display when FaceLandmarker is ready
const LandmarksReadyDisplay = () => (
    <Typography variant="body1" color="success.main">
        Face Landmarks Raady
    </Typography>
);

// Component to display when FaceLandmarker is NOT ready
const LandmarksNotReadyDisplay = () => (
    <Typography variant="body1" color="warning.main">
        Initializing Face Landmarks...
    </Typography>
);

const CameraPage = () => {
    const navigate = useNavigate()
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const { user, setUser } = useContext(userContext)
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const [faceDetector, setFaceDetector] = useState(null);
    const [isReady, setIsReady] = useState(false); // Landmarker ready
    const [showLandmarks, setShowLandmarks] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [detectingFace, setDetectingFace] = useState(true); // Actively detecting face
    const [detectFaceEnabled, setDetectFaceEnabled] = useState(false); // Use this to control detection

    // --- FaceDetector Initialization ---
    useEffect(() => {
        const initializeFaceDetector = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
            );

            const detector = await FaceDetector.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numFaces: 2
            });
            setFaceDetector(detector);
        };

        initializeFaceDetector();
    }, []);

    // --- FaceLandmarker Initialization (Conditional) ---
    useEffect(() => {
        const initializeFaceLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "/node_modules/@mediapipe/tasks-vision/wasm"
            );

            const landmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 2
            });

            setFaceLandmarker(landmarker);
            setIsReady(true); // FaceLandmarker is ready
        };

        // Only initialize FaceLandmarker AFTER face is detected AND a delay
        if (faceDetected) {
            setTimeout(() => {
                initializeFaceLandmarker();
            }, faceLandmarkerWait); // 1-second delay AFTER face detection
        }
    }, [faceDetected]);  // Triggered when faceDetected changes


    // --- Face Detection Loop ---
    useEffect(() => {
        let animationFrame;

        const detectFace = async () => {
            if (detectFaceEnabled && webcamRef.current?.video) {
                const video = webcamRef.current.video;
                const results = faceDetector.detectForVideo(video, performance.now());
                if (results.detections.length > 0) {
                    setFaceDetected(true);
                    setDetectingFace(false); // Stop showing "Face Not Detected"
                } else {
                    setFaceDetected(false);
                }
            }
            if (detectFaceEnabled) {
                animationFrame = requestAnimationFrame(detectFace);
            }
        };

        // Initial detection start (moved from handleLoadedData)
        if (detectFaceEnabled && webcamRef.current?.video) {
          detectFace();
        }

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [faceDetector, detectFaceEnabled]); // Add detectFaceEnabled as a dependency

    // --- Landmark Drawing Loop (Conditional) ---
    useEffect(() => {
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


    // --- Drawing Function ---
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


    const handleDetectFaceClick = () => {
        setDetectFaceEnabled(prev => !prev); // Toggle detection
    }


    return (

        <Box sx={ styles.mainBox}>
            {/* <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/')}
                sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    zIndex: 10 // Ensure button is above video
                }}
            >
                Back to Home
            </Button> */}
            <Container maxWidth={false} disableGutters sx={ styles.mainContainer }>
                <Stack direction="row" spacing={2} spacing={3} sx={ styles.mainStack }>
                    {/* Left Column: Video and Canvas */}
                    <Box sx={ styles.cameraBox }>
                        <Webcam
                            ref={webcamRef}
                            mirrored={false}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={ refVideoConstraints }
                            style={ styles.webcam }
                        />
                        <canvas
                            ref={canvasRef}
                            style={ styles.canvas }
                        />
                    </Box>

                    {/* Right Column: Status Messages */}
                    {/* <Box sx={{ textAlign: 'center', width: 500, mt: 4 }}> Adjust width as needed */}
                    <Box sx={ styles.contentBox }>
                        {/* Wrap the text content in a div */}
                        <div> 
                        <Typography variant="h1" sx={ styles.contentHeading } >
                                STATUS
                            </Typography>
                            <div style={{ textAlign: 'center'}}>
                                <h1 style={{
                                    color: faceDetected ? (isReady ? '#00ff00' : '#00ff00') : '#ff0000',
                                    backgroundColor: '#595959',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    display: 'inline-block' // Important for centering
                                }}>
                                    {faceDetected ? (isReady ? "Drawing FACE Landmarks" : "FACE DETECTED") : "FACE NOT DETECTED"}
                                </h1>
                            </div>
                            {faceDetected && (
                                <div style={{ textAlign: 'center'}}>
                                    <h1 style={{
                                        color: faceDetected ? (isReady ? '#00ff00' : '#00ff00') : '#ff0000',
                                        backgroundColor: '#595959',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        display: 'inline-block' // Important for centering
                                    }}>
                                        {isReady ? <LandmarksReadyDisplay /> : <LandmarksNotReadyDisplay />}
                                    </h1>
                                </div>

                            )}

                            <Button onClick={handleDetectFaceClick} variant="contained" color="primary">
                                {detectFaceEnabled ? "Stop Detecting" : "Start Detecting"}
                            </Button>


                            {/* Pass setDetectFaceEnabled as a prop */}
                            <CardReader setDetectFaceEnabled={setDetectFaceEnabled} />
                            
                            <Typography variant="body1" color="text.secondary" component="p">
                                Welcome, {user.first_name} {user.last_name}!
                            </Typography>

                        </div> 
                        {/* End of text content wrapper */}
                    </Box>
                </Stack>
            </Container>
        </Box>

    );
};

export default CameraPage;
