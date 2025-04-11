import React, { useState, useEffect,useContext } from 'react';
import axios from 'axios';
import { 
    Box, 
    Button, 
    Typography, 
    Divider,
    CircularProgress
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

// API key and base URL from environment variables
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const COUNT_DOWN = import.meta.env.VITE_FAILED_COUNT_DOWN
// const MAX_ATTEMPTS = import.meta.env.VITE_MAX_ATTEMPTS;

// Context
import { cardUidContext } from '../contexts/cardUidContext'
import { userContext } from '../contexts/userContext'

// API
import { failedAttemptsApi } from '../api/supabase/supabaseApi'

const MAX_ATTEMPTS = 3;
const styles = {
    contentWrapper: {
        width: '90%',
        height: '91.5%',
        backgroundColor: '#f5f5f5',
        padding: '25px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100%'
    },
    warningIcon: {
        fontSize: '80px',
        color: '#ff9800',
        alignSelf: 'center', 
    },
    attemptsWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '16px',
        marginBottom: 0
    },
    attemptCircle: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 10px',
        // border: '2px solid #ff9800',
        border: '2px solid #d32f2f',
        position: 'relative'
    },
    
    // backgroundColor: '#ffebee',
    // border: '2px solid #d32f2f',
    buttonContainer: {
        // Button container styles
    },
    button: {
        fontWeight: 'bold', 
        fontSize: '1.8rem', 
        padding: '10px 24px',
        width: '100%'
    },
    countdownContainer: {
        padding: '10px 24px', 
        backgroundColor: '#fff0e6',
        border: '2px solid #ff4500',
        borderRadius: '4px',
    },
    countdownText: {
        fontSize: '1.8rem', // Match button font size
        fontWeight: 'bold',
        color: '#ff4500'
    }
};

// const FailedUserRecognitionComponent = ({ setActiveComponent }) => {
const FailedUserRecognitionComponent = ({ setActiveComponent, setShowFaceDector }) => {
  
    const { cardUID, setCardUID } = useContext(cardUidContext)
    const { user, setUser } = useContext(userContext)
    const [attempts, setAttempts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(COUNT_DOWN);
    const [expanded, setExpanded] = useState(false);
  
    // Animation effect when component mounts
    useEffect(() => {
      // Trigger expansion after a small delay
      const expandTimer = setTimeout(() => {
        setExpanded(true);
        
        // Shrink back after 2 seconds
        const shrinkTimer = setTimeout(() => {
          setExpanded(false);
        }, 2000);
        
        return () => clearTimeout(shrinkTimer);
      }, 300);
      
      return () => clearTimeout(expandTimer);
    }, []);

    // Countdown timer effect
    useEffect(() => {
        let timer;
        
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            // Show the scan card component after countdown
            
            // Turn off face detector
            setShowFaceDector(false);
            // Navigate back to scan card
            setActiveComponent('scanCard');

            // if (attempts === MAX_ATTEMPTS) {
            //     handleTryAgain();
            // } else {
            //     setActiveComponent('scanCard');
            // }
        }
        
        return () => {
            clearTimeout(timer);
        };
    }, [countdown]);

    // Fetch initial attempts count
    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                // Assuming user is available from context
                if (user && user.uid) {
                    // Use failedAttemptsApi.getByUserId to fetch the user's attempts
                    const { data, error } = await failedAttemptsApi.getByUserId(user.uid);
                    
                    if (error) {
                        // If no record found, it's not really an error for our purposes
                        if (error.code === 'PGRST116') {
                            setAttempts(0); // No attempts recorded yet
                        } else {
                            throw error;
                        }
                    } else if (data) {
                        // Set attempts from the fetched data
                        setAttempts(data.failed);
                    }
                } else {
                    setError('No user found to fetch attempts');
                }
            } catch (err) {
                setError('Failed to fetch recognition attempts');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttempts();
    }, [user]);

    // Increment attempts when component mounts
    useEffect(() => {
        const incrementAttempts = async () => {
            if (attempts < MAX_ATTEMPTS) {
                try {
                    // Assuming user is available from context
                    if (user && user.uid) {
                        // Use failedAttemptsApi.incrementFailedAttempts to increment attempts
                        const { data, error } = await failedAttemptsApi.incrementFailedAttempts(user.uid);
                        
                        if (error) {
                            throw error;
                        }
                        
                        // Update local state with the new attempts count from the response
                        if (data && data.length > 0) {
                            setAttempts(data[0].failed);
                        }
                    } else {
                        console.error('No user found to increment attempts');
                    }
                } catch (err) {
                    console.error('Error updating attempts:', err);
                }
            }
        };
        
        if (!loading && !error) {
            incrementAttempts();
        }
    }, [loading, error, user]);

    const handleTryAgain = async () => {
        try {
            // Navigate back to scan card
            setActiveComponent('scanCard');
        } catch (err) {
            setError('Failed to reset attempts');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <Box sx={styles.contentWrapper}>
                <Box sx={styles.content}>
                    <CircularProgress />
                    <Typography>Loading...</Typography>
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={styles.contentWrapper}>
                <Box sx={styles.content}>
                    <Typography color="error">{error}</Typography>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => setActiveComponent('scanCard')}
                    >
                        Back to Scan
                    </Button>
                </Box>
            </Box>
        );
    }

    function refreshPage() {
        window.location.reload(false);
    }

    return (
        <Box sx={styles.contentWrapper}>
            <Box sx={styles.content}>
                <WarningIcon sx={styles.warningIcon} />
                <Typography variant="h1" sx={{ fontSize: '2.5rem', color: '#d32f2f', textAlign: 'center' }}>
                    Recognition Failed
                </Typography>
                
                <Typography variant="body1" sx={{ fontSize: '1.2rem', textAlign: 'center', marginTop: '2px' }}>
                    {attempts >= MAX_ATTEMPTS 
                        ? "Maximum attempts reached."
                        : "We couldn't verify your identity. Please try again or wait for automatic redirect."}
                </Typography>
                
                {/* <Divider sx={{ width: '80%', margin: '16px 0' }} /> */}
                <Box sx={styles.countdownContainer}>
                    <Typography sx={styles.countdownText}>
                        Resets in {countdown}
                    </Typography>
                </Box>
                
                <Box sx={styles.attemptsWrapper}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        Attempts:
                    </Typography>
                    
                    {[...Array(MAX_ATTEMPTS)].map((_, index) => (
                        <Box 
                            key={index} 
                            sx={{
                                ...styles.attemptCircle,
                                backgroundColor: index < attempts ? '#ffebee' : 'transparent',
                                borderColor: index < attempts ? '2px solid #d32f2f' : '#ccc'
                            }}
                        >
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    fontWeight: 'bold',
                                    color: index < attempts ? '#ff4500' : '#ccc'
                                }}
                            >
                                {index + 1}
                            </Typography>
                        </Box>
                    ))}
                </Box>
                {/* Show Try Again button if attempts are less than MAX_ATTEMPTS */}
                {attempts === MAX_ATTEMPTS ? (                    
                    <Box sx={{
                        padding: '16px 24px',
                        backgroundColor: '#ffebee',
                        border: '2px solid #d32f2f',
                        borderRadius: '4px',
                        textAlign: 'center',
                        transform: expanded ? 'scale(3.4)' : 'scale(1)',
                        transition: 'transform 1s ease-in-out',
                        boxShadow: expanded ? '0 0 15px rgba(211, 47, 47, 0.5)' : 'none',
                      }}>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: '#d32f2f',
                            fontSize: '2rem'
                          }}
                        >
                          ACCOUNT LOCKED
                        </Typography>
                        <Typography sx={{ color: '#d32f2f', mt: 1 }}>
                          Please contact an administrator
                        </Typography>
                      </Box>
                ) : (
                    <Box sx={styles.buttonContainer}>
                        <Button 
                            variant="contained" 
                            color="warning"
                            size="large"
                            sx={styles.button}
                            onClick={handleTryAgain}
                        >
                            Try Again
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default FailedUserRecognitionComponent;
