import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Paper, 
  Alert, 
  Snackbar 
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import CachedIcon from '@mui/icons-material/Cached';

// API key - in a real app, this should be stored securely
// Consider using environment variables with .env file
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY || 'your-secure-api-key';
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:3002';

const DoorControl = () => {
  const [doorStatus, setDoorStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Fetch door status on component mount
  useEffect(() => {
    fetchDoorStatus();
  }, []);

  // Function to fetch door status
  const fetchDoorStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/door/status`, {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Status error: ${response.status}`);
      }
      
      const data = await response.json();
      setDoorStatus(data.message);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch door status: ${err.message}`);
      console.error('Error fetching door status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to control the door (open, close, toggle)
  const controlDoor = async (action) => {
    setLoading(true);
    try {
      // Using the new consolidated endpoint
      const response = await fetch(`${API_BASE_URL}/door`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      setNotification({
        open: true,
        message: result.message,
        severity: result.status === 'success' ? 'success' : 'error'
      });
      
      // Update the door status after action
      fetchDoorStatus();
    } catch (err) {
      setError(`Failed to ${action} door: ${err.message}`);
      setNotification({
        open: true,
        message: `Failed to ${action} door: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Alternative example using legacy endpoint
  const openDoorLegacy = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/door/open`, {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      setNotification({
        open: true,
        message: result.message,
        severity: 'success'
      });
      
      fetchDoorStatus();
    } catch (err) {
      setError(`Failed to open door: ${err.message}`);
      setNotification({
        open: true,
        message: `Failed to open door: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Door Control
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1">
          Current Status: 
          <Box component="span" sx={{ fontWeight: 'bold', ml: 1 }}>
            {loading ? <CircularProgress size={20} /> : doorStatus}
          </Box>
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<LockOpenIcon />}
          onClick={() => controlDoor('open')}
          disabled={loading}
        >
          Open Door
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LockIcon />}
          onClick={() => controlDoor('close')}
          disabled={loading}
        >
          Close Door
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<CachedIcon />}
          onClick={() => controlDoor('toggle')}
          disabled={loading}
        >
          Toggle Door
        </Button>
        
        <Button
          variant="outlined"
          color="info"
          onClick={fetchDoorStatus}
          disabled={loading}
        >
          Refresh Status
        </Button>
      </Box>
      
      {/* Example of legacy endpoint usage */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="textSecondary">
          Legacy API example:
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={openDoorLegacy}
          disabled={loading}
        >
          Open Door (Legacy)
        </Button>
      </Box>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default DoorControl;
