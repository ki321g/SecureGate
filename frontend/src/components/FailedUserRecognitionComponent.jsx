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

// Context
import { cardUidContext } from '../contexts/cardUidContext'
import { userContext } from '../contexts/userContext'

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
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
    },
    warningIcon: {
        fontSize: '80px',
        color: '#ff9800',
        marginBottom: '16px'
    },
    attemptsWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '16px',
        marginBottom: '24px'
    },
    attemptCircle: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 12px',
        border: '2px solid #ff9800',
        position: 'relative'
    },
    buttonContainer: {
        marginTop: '24px'
    }
};

const MAX_ATTEMPTS = 3;

const FailedUserRecognitionComponent = ({ setActiveComponent }) => {
    const { cardUID, setCardUID } = useContext(cardUidContext)
    const { user, setUser } = useContext(userContext)
    const [attempts, setAttempts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch initial attempts count
    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/facial-recognition/attempts`, {
                    headers: {
                        'X-API-Key': API_KEY
                    }
                });
                
                if (response.data.status === 'success') {
                    setAttempts(response.data.attempts);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError('Failed to fetch recognition attempts');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAttempts();
    }, []);

    // Increment attempts when component mounts
    useEffect(() => {
        const incrementAttempts = async () => {
            if (attempts < MAX_ATTEMPTS) {
                try {
                    const newAttempts = attempts + 1;
                    setAttempts(newAttempts); // Update local state immediately for UI

                    // Update the server
                    const response = await axios.post(
                        `${API_BASE_URL}/facial-recognition/attempts`,
                        { attempts: newAttempts },
                        {
                            headers: {
                                'X-API-Key': API_KEY,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    if (response.data.status !== 'success') {
                        console.error('Failed to update attempts on server');
                    }
                } catch (err) {
                    console.error('Error updating attempts:', err);
                }
            }
        };
        
        if (!loading && !error) {
            incrementAttempts();
        }
    }, [loading, error]);

    const handleTryAgain = async () => {
        try {
            if (attempts >= MAX_ATTEMPTS) {
                // Reset attempts if max reached
                await axios.post(
                    `${API_BASE_URL}/facial-recognition/attempts`,
                    { attempts: 0 },
                    {
                        headers: {
                            'X-API-Key': API_KEY,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
            // setCardUID('noCardUID');
            // setUser(null);

            // refreshPage();
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
                
                <Typography variant="body1" sx={{ fontSize: '1.2rem', textAlign: 'center', marginTop: '8px' }}>
                    {attempts >= MAX_ATTEMPTS 
                        ? "Maximum attempts reached. Please try again later."
                        : "We couldn't verify your identity. Please try again."}
                </Typography>
                
                <Divider sx={{ width: '80%', margin: '16px 0' }} />
                
                <Box sx={styles.attemptsWrapper}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        Attempts:
                    </Typography>
                    
                    {[...Array(MAX_ATTEMPTS)].map((_, index) => (
                        <Box 
                            key={index} 
                            sx={{
                                ...styles.attemptCircle,
                                backgroundColor: index < attempts ? '#fff0e6' : 'transparent',
                                borderColor: index < attempts ? '#ff4500' : '#ccc'
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
                
                <Box sx={styles.buttonContainer}>
                    <Button 
                        variant="contained" 
                        color={attempts >= MAX_ATTEMPTS ? "primary" : "warning"}
                        size="large"
                        sx={{ fontWeight: 'bold', fontSize: '1.8rem', padding: '10px 24px' }}
                        onClick={handleTryAgain}
                        // onClick={refreshPage}
                    >
                        {attempts >= MAX_ATTEMPTS ? "Reset & Try Again" : "Try Again"}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default FailedUserRecognitionComponent;
