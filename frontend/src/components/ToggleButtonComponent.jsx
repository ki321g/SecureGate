import { Typography, Button, Stack } from '@mui/material';
import { SecurityOutlined, Dashboard  } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const styles = {
	toggleButtonStack: {
		position: 'absolute',
		padding: 2,
		margin: 2,
		backgroundColor: 'rgba(255, 255, 255, 0.7)',
		borderRadius: '6px',
		top: 0,
		left: 0,
		zIndex: 10, // Higher z-index than the webcam
	},
};
const ToggleButtonComponent = ({ showFaceDector, setShowFaceDector }) => {
	const navigate = useNavigate()
	
	const handleToggle = () => {
		setShowFaceDector((previousState) => !previousState); // Toggle faceDetector state
	};
	
	const navigateToDashboard = () => {
		navigate('/dashboard');
	};

	return (
		<>
			{/* Conditional Rendering based on toggleButton */}
			<Stack id='toggleButtonStack' direction="column" spacing={2} sx={styles.toggleButtonStack}>
				<Button id='bottomButton' variant="contained" onClick={handleToggle}>					
					{!showFaceDector ? (
						"Toggle to FaceDector"
					) : (
						"Toggle to Logo"
					)}
				</Button>

				{/* Dashboard Navigation Button */}
				<Button
					id='dashboardButton'
					variant="contained"
					color="primary"
					onClick={navigateToDashboard}
					startIcon={<Dashboard />}
				>
					Go to Dashboard
				</Button>

				{!showFaceDector ? (
					<Typography>Logo (showFaceDector is OFF)</Typography>
				) : (
					<Typography>FaceDector (showFaceDector is ON)</Typography>
				)}
			</Stack>
		</>
	);
};

export default ToggleButtonComponent;
