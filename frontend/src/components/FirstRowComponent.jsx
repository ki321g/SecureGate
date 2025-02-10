import React from 'react';
import { Button } from '@mui/material';

function FirstRowComponent({ onClick, buttonText }) {
  return (
    <Button variant="contained" onClick={onClick}>
      {buttonText}
    </Button>
  );
}

export default FirstRowComponent;
