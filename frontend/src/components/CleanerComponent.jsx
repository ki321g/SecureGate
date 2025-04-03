import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

// API key and base URL from environment variables
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

const COUNT_DOWN = 10; // or use: import.meta.env.VITE_SUCCESS_COUNT_DOWN

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
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	successIcon: {
		fontSize: '80px',
		color: '#4caf50',
		alignSelf: 'center',
	},
	successBox: {
		padding: '16px 24px',
		backgroundColor: '#e8f5e9',
		border: '2px solid #4caf50',
		borderRadius: '4px',
		textAlign: 'center',
		transition: 'transform 1s ease-in-out, box-shadow 1s ease-in-out',
		boxShadow: 'none',
		width: '90%',
		maxWidth: '500px',
	},
	expandedSuccessBox: {
		transform: 'scale(3)',
		boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)',
	},
	countdownContainer: {
		padding: '10px 24px',
		// backgroundColor: '#e8f5e9',
		// border: '2px solid #4caf50',		
        backgroundColor: '#fff0e6',
        border: '2px solid #ff4500',
		borderRadius: '4px',
	},
	countdownText: {
		fontSize: '1.8rem',
		fontWeight: 'bold',
		// color: '#4caf50',		
        color: '#ff4500'
	},
};

const CleanerComponent = ({ setActiveComponent, setShowFaceDector }) => {
	const [expanded, setExpanded] = useState(false);
	const [countdown, setCountdown] = useState(COUNT_DOWN);
	const [message, setMessage] = useState('Door Opened!');

	// Animation effect when component mounts
	useEffect(() => {
		
		// Open the door
		controlDoor('toggle');

		// Trigger expansion after a small delay
		const expandTimer = setTimeout(() => {
			setExpanded(true);

			// Shrink back after 2 seconds
			const shrinkTimer = setTimeout(() => {
				setExpanded(false);
			}, 2000);

			return () => clearTimeout(shrinkTimer);
		}, 300);;

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
            // Turn off face detector
            setShowFaceDector(false);
            // Navigate back to scan card
            setActiveComponent('scanCard');
		}

		return () => {
			clearTimeout(timer);
		};
	}, [countdown, setActiveComponent, setShowFaceDector]);

	// Function to control the door (open, close, toggle)
	const controlDoor = async (action) => {
		try {      
		  const response = await axios.post(`${API_BASE_URL}/door`, 
			{ action }, // request body
			{
			  headers: {
				'X-API-Key': API_KEY,
				'Content-Type': 'application/json'
			  }
			}
		  );
		  return response.data;
		} catch (err) {
		  setError(`Failed to ${action} door: ${err.message}`);
		  throw err;
		}
	  };

	return (
		<Box sx={styles.contentWrapper}>
			<Box sx={styles.content}>
				<CheckCircleIcon sx={styles.successIcon} />

				<Typography
					variant='h1'
					sx={{ fontSize: '3.5rem', color: '#4caf50', textAlign: 'center' }}
				>
					Authentication Successful
				</Typography>

				<Box sx={styles.countdownContainer}>
					<Typography sx={styles.countdownText}>
						Reset in {countdown}
					</Typography>
				</Box>

				<Box
					sx={{
						...styles.successBox,
						...(expanded ? styles.expandedSuccessBox : {}),
					}}
				>
					<Typography
						variant='h4'
						sx={{
							fontWeight: 'bold',
							color: '#4caf50',
							fontSize: '2.6rem',
						}}
					>
						ACCESS GRANTED
					</Typography>
					<Typography sx={{ fontSize: '1.8rem',color: '#4caf50', mt: 1 }}>
						{message}
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};

export default CleanerComponent;
