import React from 'react';
import { Button, Typography } from '@mui/material';

function ScanCardComponent({ onClick, buttonText }) {
    return (
        <Button variant="contained" onClick={onClick}>
            {buttonText}
        </Button>
    );
}

export default ScanCardComponent;
