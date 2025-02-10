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
import { userContext } from '../contexts/userContext';

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
const WebCameraComponent = ({ enableDetectFace, isVisable }) => {
    const { webcamRef, canvasRef } = useCamera();
    const [faceDetector, setFaceDetector] = useState(null);
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const [showLandmarks, setShowLandmarks] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [detectingFace, setDetectingFace] = useState(true); 
    const [isReady, setIsReady] = useState(false);


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
            setFaceDetector(detector);
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
            setIsReady(true); // FaceLandmarker is ready
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

        const detectFace = async () => {
            if (enableDetectFace && webcamRef.current?.video) {
                const video = webcamRef.current.video;
                const results = faceDetector.detectForVideo(video, performance.now());
                if (results.detections.length > 0) {
                    setFaceDetected(true);
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
    }, [faceDetector, enableDetectFace]); // Triggered when faceDetector or enableDetectFace changes

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
    </>
  );
}

export default WebCameraComponent;
