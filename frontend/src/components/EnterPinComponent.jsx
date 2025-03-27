import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    TextField,
    IconButton,
    Paper,
    CircularProgress
} from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useUser } from '../contexts/userContext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '90%',
        justifyContent: 'space-between',
        paddingTop: 1,
        paddingBottom: 1,
        paddingLeft: 3,
        paddingRight: 3,
    },
    header: {
        textAlign: 'center',
        marginBottom: 1,
    },
    title: {
        color: 'white',
        fontSize: '2rem',
        fontWeight: 'bold',
        marginTop: 0,
    },
    subtitle: {
        color: 'white',
        fontSize: '1.2rem',
        marginTop: 0,
    },
    pinDisplay: {
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 2,
        padding: 2,
        margin: 0,
        textAlign: 'center',
        letterSpacing: '8px',
        fontSize: '2rem',
        fontWeight: 'bold',
    },
    numpad: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 1,
    },
    numButton: {
        fontSize: '2rem',
        fontWeight: 'bold',
        width: '140px',
        height: '70px',
        margin: '5px',
    },
    actionButton: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        width: '140px',
        height: '70px',
        margin: '5px',
    },
    statusMessage: {
        textAlign: 'center',
        marginTop: 1,
        padding: 1,
        borderRadius: 1,
    },
    successMessage: {
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        color: 'white',
    },
    errorMessage: {
        backgroundColor: 'rgba(244, 67, 54, 0.8)',
        color: 'white',
    }
};

const EnterPinComponent = ({ setEnableDetectFace, setActiveComponent }) => {
    const { user } = useUser();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    // For demo purposes, we'll use a hardcoded PIN
    // In a real app, you would verify this against a backend
    // const CORRECT_PIN = '1234'; 
    const CORRECT_PIN = user.password; 
    
    const handleNumPress = (num) => {
        if (pin.length < 4) {
            setPin(prevPin => prevPin + num);
            setError('');
        }
    };
    
    const handleClear = () => {
        setPin('');
        setError('');
    };
    
    const handleSubmit = () => {
        if (pin.length < 4) {
            setError('Please enter a 4-digit PIN');
            return;
        }
        
         setLoading(true);
        
        // // Simulate API call to verify PIN
         setTimeout(() => {
            if (pin === CORRECT_PIN) {
                setSuccess('PIN verified successfully!');
                setError('');
                
                // Wait a moment to show success message before proceeding
                setTimeout(() => {
                    setEnableDetectFace(true); // Enable face detection
                    setActiveComponent('userRecognition');
                }, 1000);
            } else {
                setError('Incorrect PIN. Please try again.');
                setPin('');
            }
             setLoading(false);
         }, 500);
    };
    
    return (
        <Box sx={styles.container}>
            <Box>
                <Box sx={styles.header}>
                    <Typography 
                        variant="h4"
                        sx={styles.title}
                    >
                        Enter PIN
                    </Typography>
                    <Typography variant="subtitle1" sx={styles.subtitle}>
                        Please enter your 4-digit PIN
                    </Typography>
                </Box>
                
                <Box sx={styles.pinDisplay}>
                    {pin ? pin.replace(/./g, '•') : '____'}
                </Box>

                {error && (
                    <Box sx={{...styles.statusMessage, ...styles.errorMessage}}>
                        <Typography variant="body1" display="flex" alignItems="center" justifyContent="center">
                            <ErrorOutlineIcon sx={{ mr: 1 }} />
                            {error}
                        </Typography>
                    </Box>
                )}
                
                {success && (
                    <Box sx={{...styles.statusMessage, ...styles.successMessage}}>
                        <Typography variant="body1" display="flex" alignItems="center" justifyContent="center">
                            <CheckCircleOutlineIcon sx={{ mr: 1 }} />
                            {success}
                        </Typography>
                    </Box>
                )}
            </Box>
            
            <Box sx={styles.numpad}>
                <Grid container spacing={1} justifyContent="center">
                    {/* Keypad First row: 7, 8, 9 */}
                    <Grid item xs={12} container justifyContent="center">
                        {[7, 8, 9].map(num => (
                            <Grid item key={num}>
                                <Button 
                                    variant="contained" 
                                    sx={styles.numButton}
                                    onClick={() => handleNumPress(num.toString())}
                                    disabled={loading}
                                >
                                    {num}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                    
                    {/* Keypad row: 4, 5, 6 */}
                    <Grid item xs={12} container justifyContent="center">
                        {[4, 5, 6].map(num => (
                            <Grid item key={num}>
                                <Button 
                                    variant="contained" 
                                    sx={styles.numButton}
                                    onClick={() => handleNumPress(num.toString())}
                                    disabled={loading}
                                >
                                    {num}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                    
                    {/* Keypad Third row: 1, 2, 3 */}
                    <Grid item xs={12} container justifyContent="center">
                        {[1, 2, 3].map(num => (
                            <Grid item key={num}>
                                <Button 
                                    variant="contained" 
                                    sx={styles.numButton}
                                    onClick={() => handleNumPress(num.toString())}
                                    disabled={loading}
                                >
                                    {num}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                    
                    {/* Fourth row: Clear, 0, Backspace (Submit) */}
                    <Grid item xs={12} container justifyContent="center">
                        <Grid item>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                sx={styles.actionButton}
                                onClick={handleClear}
                                disabled={loading}
                            >
                                Clear
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button 
                                variant="contained" 
                                sx={styles.numButton}
                                onClick={() => handleNumPress('0')}
                                disabled={loading}
                            >
                                0
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button 
                                variant="contained" 
                                color="success" 
                                sx={styles.actionButton}
                                onClick={handleSubmit}
                                disabled={loading || pin.length !== 4}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : <KeyboardReturnIcon />}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default EnterPinComponent;
