import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

// Import DataContext
import { useUser } from '../contexts/userContext';
import { useData } from '../contexts/dataContext';

// API
import { functionApi, failedAttemptsApi } from '../api/supabase/supabaseApi'

// API key and base URL from environment variables
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const TINYTUYA_API_BASE_URL = import.meta.env.VITE_TINYTUYA_API_BASE_URL;


const styles = {
  contentWrapper: {
    width: '90%',
    height: '91.5%',
    backgroundColor: '#f5f5f5',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    overflow: 'none',
  },
  header: {
    marginBottom: '10px',
    textAlign: 'center',
  },
  devicesContainer: {
    height: '240px', // Height for approximately 4 devices
    overflowY: 'scroll', // Changed from 'auto' to 'scroll' to always show scrollbar
    overflowX: 'hidden',
    padding: '12px',
    border: '2px solid #e0e0e0',
    backgroundColor: '#1e1e1e',
    marginBottom: '20px', 
  },    
  deviceItem: {
    padding: '2px 12px',
    margin: '2px 0',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      color: '#333',
    },
  },
  selectedDeviceItem: {
    backgroundColor: '#f5f5f5',
    color: '#333',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '6px',
    marginBottom: '0',
  },
  statusCard: {
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    marginTop: '24px',
  },
  statusHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  deviceStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusChip: {
    minWidth: '80px',
    justifyContent: 'center',
  },
  selectionControls: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
};

const DeviceSelectionComponent = ({ setActiveComponent }) => {
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState({});
  const [selectedDevices, setSelectedDevices] = useState([]);
  
  const [dataReady, setDataReady] = useState(false);
  // Get devices from DataContext
  const { devices, setDevices } = useData();
  const { user } = useUser();

  // Initialize component on mount
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Reset facial recognition attempts
        await deleteFailedAttemptsInDatabase(user.uid);
        // await resetFacialRecognitionAttemptsCount();
        
        // Fetch user devices
        const deviceData = await fetchUserDevices();
        
        if (deviceData && deviceData.length > 0) {
          // Fetch device statuses
          await fetchDeviceStatus(deviceData);
        }
        
        // All data is ready
        setDataReady(true);
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [user.uid]); // Only run when user ID changes

  // function to delete failed attempts in the database
  const deleteFailedAttemptsInDatabase = async () => {
    try {
      const { error } = await failedAttemptsApi.delete(user.uid);
      
      if (error) {
        console.error('Error deleting failed attempts:', error);
      } else {
        console.log('Failed attempts record deleted successfully');
      }
    } catch (err) {
      console.error('Failed to delete failed attempts record:', err);
      // Don't throw here as this isn't critical for the component to function
    }
  };
  
  //   const resetFacialRecognitionAttemptsCount = async () => {
  //   try {
  //     const response = await axios.post(
  //       `${API_BASE_URL}/facial-recognition/attempts`,
  //       { attempts: 0 },
  //       {
  //         headers: {
  //           'X-API-Key': API_KEY,
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );
      
  //     console.log('Count reset successfully:', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Failed to reset count:', error);
  //     // Don't throw here as this isn't critical for the component to function
  //   }
  // };

  const fetchUserDevices = async () => {
    try {
      const { data, error: apiError } = await functionApi.invoke('get_devices_by_user_uid', { user_uid: user.uid });
      
      if (apiError) throw apiError;
      
      // Set devices in context
      setDevices(data);
      console.log('DEVICES:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching devices data:', error.message);
      setError("Failed to fetch your devices. Please try again.");
      throw error; // Propagate error to caller
    }
  };

  // Function to fetch and update device status
  const fetchDeviceStatus = async (deviceList = devices) => {
    if (!deviceList || deviceList.length === 0) return;
    
    const newStatus = { ...deviceStatus };
    
    try {
      await Promise.all(
        deviceList.map(async (device) => {
          try {
            const response = await axios.get(`${API_BASE_URL}/tinytuya/status/${device.deviceid}`, {
              headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
              }
            });

            const data = response.data;
            
            if (data && data.dps && data.dps["1"] !== undefined) {
              // Status is a boolean in dps.1
              newStatus[device.deviceid] = data.dps["1"] ? 'ON' : 'OFF';
            } else {
              newStatus[device.deviceid] = 'Unknown';
            }
          } catch (err) {
            console.error(err);
            newStatus[device.deviceid] = 'ERROR';
          }
        })
      );
      
      setDeviceStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error(error);
      setError("Failed to fetch device status");
      throw error;
    }
  }; 

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
  
  // Handle device selection
  const toggleDeviceSelection = (deviceId) => {
    setSelectedDevices(prevSelected => {
      if (prevSelected.includes(deviceId)) {
        return prevSelected.filter(id => id !== deviceId);
      } else {
        return [...prevSelected, deviceId];
      }
    });
  };
  
  // Select all devices
  const selectAllDevices = () => {
    setSelectedDevices(devices.map(device => device.deviceid));
  };
  
  // Clear all selections
  const clearSelections = () => {
    setSelectedDevices([]);
  };

  // Function to turn on selected devices
  const turnOnDevices = async () => {
    if (selectedDevices.length === 0) {
      setError("Please select at least one device");
      return;
    }
    
    setLoading(true);
    const newStatus = { ...deviceStatus };
    
    try {
      await Promise.all(
        selectedDevices.map(async (deviceId) => {
          try {
            const device = devices.find(d => d.deviceid === deviceId);
            if (!device) throw new Error(`Device not found: ${deviceId}`);
            
            const response = await axios.get(`${API_BASE_URL}/tinytuya/turnon/${device.deviceid}`, {
              headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
              }
            });
            
            newStatus[deviceId] = 'ON';
          } catch (err) {
            console.error(err);
            newStatus[deviceId] = 'ERROR';
          }
        })
      );
      
      setDeviceStatus(newStatus);
      setError(null);
    } catch (err) {
      setError(`Failed to turn on devices: ${err.message}`);
    } finally {
      // Refresh device status after turning on
      await fetchDeviceStatus();
      setLoading(false);
    }
  };

  // Function to turn off selected devices
  const turnOffDevices = async () => {
    if (selectedDevices.length === 0) {
      setError("Please select at least one device");
      return;
    }
    
    setLoading(true);
    const newStatus = { ...deviceStatus };
    
    try {
      await Promise.all(
        selectedDevices.map(async (deviceId) => {
          try {
            const device = devices.find(d => d.deviceid === deviceId);
            if (!device) throw new Error(`Device not found: ${deviceId}`);
            
            const response = await axios.get(`${API_BASE_URL}/tinytuya/turnoff/${device.deviceid}`, {
              headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
              }
            });
            
            newStatus[deviceId] = 'OFF';
          } catch (err) {
            console.error(err);
            newStatus[deviceId] = 'ERROR';
          }
        })
      );
      
      setDeviceStatus(newStatus);
      setError(null);
    } catch (err) {
      setError(`Failed to turn off devices: ${err.message}`);
    } finally {
      // Refresh device status after turning off
      await fetchDeviceStatus();
      setLoading(false);
    }
  };

  // Function to Open the Door and Turn on Devices
  const openDoor = async () => {
    setLoading(true);
    try {
      // await controlDoor('toggle');
      // await turnOnDevices();
      controlDoor('toggle');
      turnOnDevices();
      setActiveComponent('successUserRecognition');
    } catch (err) {
      console.error("Error in openDoor:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Get status color based on device status
  const getStatusColor = (status) => {
    switch (status) {
      case 'ON': return 'success';
      case 'OFF': return 'error';
      case 'ERROR': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={styles.contentWrapper}>
      <Box sx={styles.header}>
        <Typography variant="h1" sx={{ fontSize: '3rem' }} gutterBottom>
          Select Device(s)
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {error && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                backgroundColor: '#ffebee', 
                color: '#d32f2f',
                borderRadius: '8px'
              }}
            >
              <Typography>{error}</Typography>
            </Paper>
          )}
          
          <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
            <Box sx={styles.selectionControls}>
              <Typography variant="h1" sx={{ fontSize: '1.5rem', color: '#fff' }}>Device List</Typography>
              <Box>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={selectAllDevices}
                  startIcon={<CheckBoxIcon />}
                  disabled={devices.length === 0}
                >
                  Select All
                </Button>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={clearSelections}
                  startIcon={<CheckBoxOutlineBlankIcon />}
                  sx={{ ml: 1 }}
                  disabled={selectedDevices.length === 0}
                >
                  Clear
                </Button>
              </Box>
            </Box>
            
            <Box id='DevicesBoxContainer' sx={styles.devicesContainer}>
              {!dataReady ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <FormGroup>
                  {devices.length > 0 ? (
                    [...devices]
                      .sort((a, b) => a.device_name.localeCompare(b.device_name))
                      .map((device, index) => (
                        <Box id='InnerDeviceBoxContainer'
                          key={`${device.deviceid}-${index}`}  // Add index to ensure uniqueness
                          sx={{
                            ...styles.deviceItem,
                            ...(selectedDevices.includes(device.deviceid) ? styles.selectedDeviceItem : {})
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox 
                                // size="large"
                                sx={{ '& .MuiSvgIcon-root': { fontSize: 36 } }}
                                checked={selectedDevices.includes(device.deviceid)}
                                onChange={() => toggleDeviceSelection(device.deviceid)}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <Typography variant="h1" sx={{ fontSize: '1.8rem' }}>{device.device_name}</Typography>
                                {deviceStatus[device.deviceid] && (
                                  <Chip 
                                    size="medium" 
                                    label={deviceStatus[device.deviceid]} 
                                    color={getStatusColor(deviceStatus[device.deviceid])}
                                    sx={{ ml: 3, borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', padding: '10px', height: '40px' }}
                                  />
                                )}
                              </Box>
                            }
                            sx={{ width: '100%' }}
                          />
                        </Box>
                      ))
                  ) : (
                    <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                      No devices available
                    </Typography>
                  )}

                  {/* {devices.length > 0 ? (
                    [...devices]
                      .sort((a, b) => a.device_name.localeCompare(b.device_name))
                      .map((device) => (
                        <Box id='InnerDeviceBoxContainer'
                          key={device.deviceid}
                          sx={{
                            ...styles.deviceItem,
                            ...(selectedDevices.includes(device.deviceid) ? styles.selectedDeviceItem : {})
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={selectedDevices.includes(device.deviceid)}
                                onChange={() => toggleDeviceSelection(device.deviceid)}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <Typography variant="h1" sx={{ fontSize: '1.8rem' }}>{device.device_name}</Typography>
                                {deviceStatus[device.deviceid] && (
                                  <Chip 
                                    size="medium" 
                                    label={deviceStatus[device.deviceid]} 
                                    color={getStatusColor(deviceStatus[device.deviceid])}
                                    sx={{ ml: 3, borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', padding: '10px', height: '40px' }}
                                  />
                                )}
                              </Box>
                            }
                            sx={{ width: '100%' }}
                          />
                        </Box>
                      ))
                  ) : (
                    <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                      No devices available
                    </Typography>
                  )} */}
                </FormGroup>
              )}
            </Box>
            
            <Box sx={styles.actionButtons}>
              <Button
                variant="contained"
                color="success"
                disabled={selectedDevices.length === 0 || loading}
                onClick={openDoor}
                startIcon={<PowerSettingsNewIcon />}
                size="large"
                sx={{ fontWeight: '900', fontSize: '1.2rem', padding: '20px', height: '80px' }}
              >
                Open Door & Turn ON Devices
              </Button>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DeviceSelectionComponent;

