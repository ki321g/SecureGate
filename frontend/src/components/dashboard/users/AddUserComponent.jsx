import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

// Contexts
import { useData } from '../../../contexts/dataContext';

// API
import { usersApi } from '../../../api/supabase/supabaseApi';

// Import default user image
import { defaultUserImage } from './defaultUserImage';

import CapturePhotoComponent from './CapturePhotoComponent';

// API key and base URL from environment variables
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

const AddUserComponent = ({ onUserAdded, onCancel }) => {
  const { roles, users, setUsers } = useData(); // Get users and setUsers from context
  const [activeStep, setActiveStep] = useState(0);
  const [isCardReading, setIsCardReading] = useState(false);
  const [cardReadingInterval, setCardReadingInterval] = useState(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    role_id: '',
    card_id: '',
    user_picture: null,
    status: 'Active',
  });

  // Clean up the interval when the component unmounts
  useEffect(() => {
    return () => {
      if (cardReadingInterval) {
        clearInterval(cardReadingInterval);
      }
    };
  }, [cardReadingInterval]);

  const handleInputChange = (e) => {
    if(isCardReading){
      stopCardReading();
    }
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreate = async () => {
    try {
      // Check if user_picture is null and set default image if needed
      const formDataToSubmit = { ...formData };
      
      if (!formDataToSubmit.user_picture) {
        console.log("No user picture set, using default image");
        formDataToSubmit.user_picture = defaultUserImage;
      } else {
        console.log("Using captured user picture");
      }
      
      const { data, error } = await usersApi.create(formDataToSubmit);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Update users directly through context
        setUsers([...users, data[0]]);
        // Notify parent component that we're done
        onUserAdded(data[0]);
      } else {
        throw new Error('No data returned from create operation');
      }
    } catch (error) {
      console.error('Error creating user:', error.message);
    }
  };
  
  // Sets the user picture captured from the webcam
  const handlePotoCaptured = (imageBase64) => {
    console.log("Image captured:", imageBase64.substring(0, 50) + "..."); 
    setFormData(prev => ({
      ...prev,
      user_picture: imageBase64
    }));
  };

  // Read Card
  const readCard = async () => {
    try {            
      const response = await axios.get(`${API_BASE_URL}/card/uid`, {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        // Update the form data with the card UID
        setFormData(prev => ({
          ...prev,
          card_id: response.data.card_uid
        }));
        
        // Check if the scan was successful
        if (response.data.status === 'success') {
          // Stop reading if we got a successful scan
          stopCardReading();
        }
      }
    } catch (error) {
      console.error('Error reading card:', error);
    }
  };

  const startCardReading = () => {
    setIsCardReading(true);
    const interval = setInterval(() => {
      readCard();
    }, 100);
    setCardReadingInterval(interval);
  };
  
  const stopCardReading = () => {
    clearInterval(cardReadingInterval);
    setCardReadingInterval(null);
    setIsCardReading(false);
  };

  const steps = ['User Details', 'User Photo'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
            <Grid container spacing={3} sx={{ mt: 1, px: 2 }}>
            {/* First row - First Name and Last Name */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
              />
            </Grid>
            
            {/* Second row - Email */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
              />
            </Grid>
            
            {/* Third row - Password and Phone Number */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
              />
            </Grid>
            
            {/* Fourth row - Role and Card Scan */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="role-select-label" sx={{ fontSize: '1.4rem' }}>Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  label="Role"
                  sx={{ '& .MuiSelect-select': { fontSize: '1.4rem' } }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Card UID"
                  name="card_id"
                  value={formData.card_id}
                  onChange={handleInputChange}
                  sx={{ 
                    '& .MuiInputBase-input': { fontSize: '1.4rem' },
                    flexGrow: 1
                  }}
                />
                <Button
                  variant="contained"
                  onClick={isCardReading ? stopCardReading : startCardReading}
                  sx={{ 
                    minWidth: '120px',
                    fontSize: '1.1rem',
                    backgroundColor: isCardReading ? 'error.main' : 'primary.main'
                  }}
                >
                  {isCardReading ? 'Stop Scan' : 'Scan Card'}
                </Button>
              </Box>
              {isCardReading && (
                <Typography sx={{ mt: 1, color: 'info.main', fontSize: '1.2rem' }}>
                  Please scan a card now...
                </Typography>
              )}
            </Grid>
          </Grid>
        );
      case 1:
        return (
            <Box sx={{ mt: 2, height: '100%' }}>
                {/* webcam component */}
                <Box 
                sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.03)'
                }}
                >
                    <CapturePhotoComponent onPhotoCaptured={handlePotoCaptured}/>
                </Box>
                           
                {/* Add this to verify if an image has been captured */}
                {formData.user_picture ? (
                  <Typography sx={{ mt: 2, color: 'success.main', fontSize: '1.2rem', textAlign: 'center' }}>
                    ✓ Image captured successfully
                  </Typography>
                ) : (
                  <Typography sx={{ mt: 2, color: 'warning.main', fontSize: '1.2rem', textAlign: 'center' }}>
                    No image captured yet
                  </Typography>
                )}
             </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
       <Box sx={{ p: 3 }}>  {/* Add padding around the entire component */}
            <Typography variant="h5" sx={{ mb: 3, fontSize: '1.8rem' }}>
            Add New User
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
                <Step key={label}>
                <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '1.4rem' } }}>
                    {label}
                </StepLabel>
                </Step>
            ))}
            </Stepper>
            
            {renderStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button 
                onClick={onCancel} 
                sx={{ fontSize: '1.2rem' }}
            >
                Cancel
            </Button>
            <Box>
                <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ fontSize: '1.2rem', mr: 1 }}
                >
                Back
                </Button>
                {activeStep === steps.length - 1 ? (
                <Button 
                    onClick={handleCreate} 
                    variant="contained" 
                    sx={{ fontSize: '1.2rem' }}
                >
                    Create User
                </Button>
                ) : (
                <Button 
                    onClick={handleNext} 
                    variant="contained" 
                    sx={{ fontSize: '1.2rem' }}
                >
                    Next
                </Button>
                )}
            </Box>
            </Box>
        </Box>
    </>
  );
};

export default AddUserComponent;
