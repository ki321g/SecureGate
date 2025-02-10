import React, { useState } from 'react';
import { Stack, Button, Typography } from '@mui/material';
import ScreenSaverComponent from '../components/ScreenSaverComponent';
import ScanCardComponent from '../components/ScanCardComponent';

// Import: Video Processing Libraries
import Webcam from 'react-webcam'

function TestPage() {
  const [toggleButton, setToggleButton] = useState(false);
  const [showSecondRow, setShowSecondRow] = useState(false);
  const [displayValue, setDisplayValue] = useState('Nothing Clicked Yet'); // Initialize with a default
  const [clickedButton, setClickedButton] = useState(''); // New state: Track which button was clicked

  const handleToggle = () => {
    setToggleButton(!toggleButton);
    setShowSecondRow(true);
  };

  const handleFirstRowClick = () => {
    setDisplayValue('First Row Button Clicked');
    setClickedButton('first'); // Set clickedButton
  };

  const handleSecondRowClick = () => {
    setDisplayValue('Second Row Button Clicked');
    setClickedButton('second'); // Set clickedButton
  };

  return (
    <Stack spacing={2} style={{ width: '100%' }}>
      {/* First Row (Full Width) - Conditionally Rendered */}
      {!toggleButton && (
        <Stack direction="row" style={{ width: '100%' }}>
          <ScreenSaverComponent onClick={handleFirstRowClick} buttonText="First Row Button" />
        </Stack>
      )}

      {/* Second Row (Nested Stack - Row Direction) - Conditionally Rendered */}
      {showSecondRow && toggleButton && (
        <Stack direction="row" spacing={2}>
          {/* Dynamically Styled Typography */}
          <Typography
            style={{
                fontWeight: clickedButton === 'first' ? 'bold' : 'normal',
                color: clickedButton === 'second' ? 'blue' : 'black',
                backgroundColor: clickedButton === 'first' ? 'lightgray' : clickedButton === 'second' ? 'lightblue' : 'white', // Conditional background
                textAlign: 'center', // Horizontal text centering within Typography
                width: '100%',       // Ensure Typography takes the available space
                padding: '10px',      // Add some padding
            }}
          >
            {displayValue}
          </Typography>
          <ScanCardComponent onClick={handleSecondRowClick} buttonText="Second Row Button" />
        </Stack>
      )}

      <Button variant="contained" onClick={handleToggle}>
        Toggle
      </Button>

      {/* Conditional Rendering based on toggleButton */}
      <Stack direction="column" spacing={2}>
        {toggleButton ? (
          <Typography>Component A (Toggle is ON)</Typography>
        ) : (
          <Typography>Component B (Toggle is OFF)</Typography>
        )}
      </Stack>
    </Stack>
  );
}

export default TestPage;
