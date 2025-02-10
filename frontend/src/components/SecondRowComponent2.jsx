import React from 'react';
import { Button, Typography } from '@mui/material';

function SecondRowComponent2({ onClick, buttonText }) {
    return (
        <Button variant="contained" onClick={onClick}>
            {buttonText}
        </Button>
    );
}

export default SecondRowComponent2;
