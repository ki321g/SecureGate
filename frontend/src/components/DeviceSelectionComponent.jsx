import React, { useState } from 'react';
import { Avatar, Box, Button, Typography, Table, TableBody, TableRow, TableCell, Input } from '@mui/material';

const styles = {
    contentWrapper: {
        width: '90%',
        height: '91.5%',
        backgroundColor: '#f5f5f5',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center'
    },    
};

const DeviceSelectionComponent = ({ setActiveComponent }) => {
    return (
        <Box sx={styles.contentWrapper}>
            <Box sx={styles.content}>
                <Typography variant="h1" sx={{ fontSize: '3rem' }}>
                    SELECT DEVICE
                </Typography>
            </Box>
        </Box>
    );
};

export default DeviceSelectionComponent;
