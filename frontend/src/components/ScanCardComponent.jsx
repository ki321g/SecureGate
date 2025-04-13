import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Button, Typography, TextField, Input } from '@mui/material';

// Context
import { cardUidContext } from '../contexts/cardUidContext'
import { userContext } from '../contexts/userContext'
// API
import { usersApi } from '../api/supabase/supabaseApi'

// API key and base URL from environment variables
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;


const styles = {
    contentWrapper: {
        width: '90%',
        height: '100%',
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
        paddingTop: '60px',
        alignItems: 'center'
    },   
    input: {
        width: '100%',
        maxWidth: '800px',
        padding: '16px',
        fontSize: '3.8rem',
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: '#f8f8f8',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        '&.Mui-disabled': {
            WebkitTextFillColor: '#000000',
            backgroundColor: '#f0f0f0',
            cursor: 'not-allowed'
        },
        '& input': {
            textAlign: 'center',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }
    },
};
const ScanCardComponent = ({ setActiveComponent }) => {
    const { cardUID, setCardUID } = useContext(cardUidContext)
    const { user, setUser } = useContext(userContext)
    const [cardData, setCardData] = useState(null);
    const [isReading, setIsReading] = useState(true);
    const [error, setError] = useState(null);

    const readCard = async () => {
        try {            
            const response = await axios.get(`${API_BASE_URL}/card/uid`, {
                headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
                }
            });
            console.log(response)
            if (response.data) {
                setCardData(response.data);
                setCardUID(response.data.card_uid);

                if (response.data.status === 'success') {
                    setIsReading(false);
                }
            }
        } catch (error) {
            console.error('Error reading card:', error);
        }
    }; 

    // Reset cardUID and user when component mounts
    useEffect(() => {
        setCardUID('noCardUID');
        setUser(null);
    }, []);

    useEffect(() => {
        if (isReading) {
            const interval = setInterval(() => {
                readCard();
            }, 100); 

            return () => clearInterval(interval); // Cleanup on component unmount
        }
        const fetchUserData = async () => {
            if (cardUID != 'noCardUID') {
                    try {
                        const { data, error } = await usersApi.getByCardId(cardData.card_uid);
                        
                        if (error) throw error;
                        setUser(data);

                    } catch (error) {
                        console.error('Error fetching data:', error.message);
                    } finally {
                        const timeout = setTimeout(() => {
                            setActiveComponent('enterPin');
                        }, 1500); 
                        return () => clearTimeout(timeout);
                    }
                // }
            }
        };

        fetchUserData();
    }, [isReading, cardData]);

return (
    <>
        <Box sx={styles.contentWrapper}>
            <Box sx={styles.content}>
                <Typography id='DetectorContentHeading' variant="h1" sx={{ fontSize: '4rem' }}>
                    PLEASE, SCAN YOUR CARD
                </Typography>
                
                <Input
                    disableUnderline
                    disabled
                    value={cardUID === 'noCardUID' ? 'No Card ID' : (cardUID || 'No Card ID')}
                    sx={styles.input}
                />
            </Box>
        </Box>
    </>
  );
}

export default ScanCardComponent;