// https://youtu.be/E_AHkWHhUz4?si=x3PZ6eLpe8iuRGJz
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import Webcam from 'react-webcam';
import { Select, Slider, Button, Stack, Typography } from '@mui/material';

const videoWidth = 854;
const videoHeight = 480;

const CapturePhotoComponent = ({ onPhotoCaptured }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const webcamRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  const handleDevices = useCallback(
    mediaDevices => {
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
      if(mediaDevices.filter(({ kind }) => kind === "videoinput").length > 0) {
        setSelectedDeviceId(mediaDevices.filter(({ kind }) => kind === "videoinput")[0].deviceId)
      }
    },
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const resetImage = useCallback(() => {
    setImgSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async () => {
    try {
      if (!imgSrc || !croppedAreaPixels) {
        console.error("Image source or cropped area is missing.");
        return;
      }

      const image = new Image();
      image.src = imgSrc;
      await new Promise((resolve) => { image.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const croppedImageBase64 = canvas.toDataURL('image/jpeg');
      console.log(croppedImageBase64);
      
       if (onPhotoCaptured) {
        console.log("Calling onPhotoCaptured callback");
        onPhotoCaptured(croppedImageBase64);
      } else {
        console.error("Error on onPhotoCaptured callback");
      }
      
      return croppedImageBase64;
    } catch (e) {
      console.error("Crop failed", e);
    }
  }, [imgSrc, croppedAreaPixels, onPhotoCaptured]);

  const containerStyle = {
    position: 'relative', 
    width: videoWidth, 
    height: videoHeight,
    overflow: 'hidden',
    backgroundColor: '#000',
    margin: '0 auto', // Center the container
    marginTop: '16px' // space between select and video
  };

  return (
    <Stack spacing={3}> {/* Increased spacing from 2 to 3 */}
      {/* Selct Device - Only show device selection when no image is captured */}
      {!imgSrc && (
        <Stack direction="row" spacing={2}>
          <select
            value={selectedDeviceId}
            onChange={e => setSelectedDeviceId(e.target.value)}
            style={{ width: '100%', padding: '8px' }}>
            {devices.map((device, key) => (
              <option value={device.deviceId} key={key}>
                {device.label || `Device ${key + 1}`}
              </option>
            ))}
          </select>
        </Stack>
      )}

      <div style={containerStyle}>
        {imgSrc ? (
          <Cropper
            image={imgSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            objectFit="cover"
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                position: 'relative'
              },
              cropAreaStyle: {
                border: 'none'
              },
              mediaStyle: {
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }
            }}
          />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            videoConstraints={{ 
              deviceId: selectedDeviceId,
              width: videoWidth,
              height: videoHeight
            }}
          />
        )}
      </div>
      
      {/* Only show slider and buttons when an image is captured */}
      {imgSrc ? (
        <>
          <div style={{ margin: '10px 40px' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            
            <h1 style={{ margin: 0, marginRight: '20px' }}>ZOOM</h1>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e, zoom) => setZoom(zoom)}
                sx={{ 
                  flex: 1,
                  height: 48,
                  '& .MuiSlider-track': {
                    border: 'none',
                    backgroundColor: '#1976d2'
                  },
                  '& .MuiSlider-thumb': {
                    height: 48,
                    width: 48,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                    },
                    '&:before': {
                      display: 'none',
                    },
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.5,
                    backgroundColor: '#bfbfbf',
                  }
                }}
              />
            </Stack>
          </div>
          
          <Stack direction="row" spacing={2} sx={{marginTop:'0px !important'}}>
            <Button 
              variant="contained" 
              onClick={getCroppedImg} 
              style={{ flex: 1 }}
            >
              Crop & Get Image
            </Button>
            <Button 
              variant="outlined" 
              onClick={resetImage}
              style={{ flex: 1 }}
            >
              Retake Photo
            </Button>
          </Stack>
        </>
      ) : (
        <Button 
          variant="contained" 
          onClick={capture}
          fullWidth
        >
          Take Photo
        </Button>
      )}
    </Stack>
  );
};

export default CapturePhotoComponent;
