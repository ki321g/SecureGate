import React, { useState, useEffect } from 'react';
import { failedAttemptsApi, accessLogsApi, usersApi } from '../../../api/supabase/supabaseApi';
import { toast } from 'react-toastify';
import { 
  Grid, 
  Paper, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button, 
  Card, 
  CardContent, 
  Box, 
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const FailedLoginComponent = () => {
  const [failedAttempts, setFailedAttempts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allAccessLogs, setAllAccessLogs] = useState({});
  const [currentAccessLogs, setCurrentAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      // Use the cached access logs for the selected user
      setCurrentAccessLogs(allAccessLogs[selectedUser.user_id] || []);
    } else {
      setCurrentAccessLogs([]);
    }
  }, [selectedUser, allAccessLogs]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch failed attempts
      const { data: failedData, error: failedError } = await failedAttemptsApi.getAll();
      if (failedError) throw failedError;
      
      const filteredData = failedData.filter(item => item.failed > 0);
      setFailedAttempts(filteredData);
      
      // Fetch access logs for all users with failed attempts
      const logsMap = {};
      
      if (filteredData.length > 0) {
        await Promise.all(filteredData.map(async (user) => {
          const { data: logData, error: logError } = await accessLogsApi.getByUserId(user.user_id);
          if (!logError) {
            logsMap[user.user_id] = logData.slice(0, 3);
          }
        }));
        
        setAllAccessLogs(logsMap);
        
        // Set the first user as selected by default
        setSelectedUser(filteredData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId === "") {
      setSelectedUser(null);
    } else {
      const user = failedAttempts.find(item => 
        (item.id && item.id.toString() === selectedId) || 
        (item.user_id && item.user_id.toString() === selectedId)
      );
      
      setSelectedUser(user);
    }
  };

  const handleResetUser = async (userId) => {
    setResetLoading(true);
    try {
      const { error: deleteError } = await failedAttemptsApi.delete(userId);
      if (deleteError) throw deleteError;
      
      const { error: updateError } = await usersApi.update(userId, { status: 'Active' });
      if (updateError) throw updateError;
      
      toast.success('User has been reset successfully');
      
      // Refresh all data
      await fetchAllData();
    } catch (error) {
      console.error('Error resetting user:', error);
      toast.error('Failed to reset user');
    } finally {
      setResetLoading(false);
    }
  };

  // Render a placeholder when no user is selected to maintain consistent height
  const renderPlaceholder = () => (
    <Grid container spacing={2} sx={{ width: '100%' }}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Select a user to view details
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Access logs will appear here
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: '100%', p: 2, minHeight: '600px' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Failed Login Attempts
      </Typography>
      
      {/* User Selection Dropdown - Full Width with consistent size */}
      {failedAttempts.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, width: '100%' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <FormControl fullWidth size="medium">
                <InputLabel id="user-select-label" sx={{ fontSize: '1.6rem', paddingBottom: '10px' }}>Select a user with failed login attempts</InputLabel>
                <Select
                  labelId="user-select-label"
                  id="user-select"
                  value={selectedUser ? (selectedUser.id || selectedUser.user_id || "").toString() : ""}
                  onChange={handleUserChange}
                  label="Select a user with failed login attempts"
                  sx={{ height: '56px', fontSize: '1.6rem', padding: '40px 0' }}
                >
                  <MenuItem value="">-- Select a user --</MenuItem>
                  {failedAttempts.map((item) => (
                    <MenuItem key={item.id || item.user_id} value={item.id || item.user_id}>
                      {item.users?.first_name} {item.users?.last_name} ({item.failed} failed {item.failed === 1 ? 'attempt' : 'attempts'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => selectedUser && handleResetUser(selectedUser.user_id)}
                disabled={!selectedUser || resetLoading}
                startIcon={resetLoading ? <CircularProgress size={20} color="inherit" /> : null}
                fullWidth
                sx={{ height: '56px', padding: '40px 0', fontSize: 30, fontWeight: 900 }}
              >
                {resetLoading ? 'Resetting...' : 'Reset User Access'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', width: '100%' }}>
          <CircularProgress size={60} />
        </Box>
      ) : failedAttempts.length === 0 ? (
        <Paper sx={{ p: 4, mt: 25 ,textAlign: 'center', minHeight: '400px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 128, mb: 2, alignSelf: 'center' }} />
          <Typography variant="h2" gutterBottom>
            No Failed Login Attempts Found
          </Typography>
        </Paper>
      ) : selectedUser ? (
        <Grid container spacing={3} sx={{ width: '100%' }}>
          {/* Left Column: User Details */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', minHeight: '400px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                {/* Rectangular image instead of round Avatar */}
                {selectedUser.users?.user_picture ? (
                  <Box 
                    component="img"
                    src={selectedUser.users.user_picture}
                    alt={`${selectedUser.users?.first_name} ${selectedUser.users?.last_name}`}
                    sx={{ 
                      width: 140, 
                      height: 140, 
                      objectFit: 'cover', 
                      mb: 2,
                      border: '1px solid #e0e0e0',
                    }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      width: 140, 
                      height: 140, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      mb: 2,
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Typography variant="h4" color="textSecondary">
                      {selectedUser.users?.first_name?.[0]}{selectedUser.users?.last_name?.[0]}
                    </Typography>
                  </Box>
                )}
                <Typography variant="h6">
                  {selectedUser.users?.first_name} {selectedUser.users?.last_name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {selectedUser.users?.email}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1" color="textSecondary">Status:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Chip 
                    label={selectedUser.users?.status} 
                    color={selectedUser.users?.status === 'Active' ? 'success' : 'error'}
                    sx={{ fontSize: '1rem', height: '36px', padding: '0 12px' }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body1" color="textSecondary">Card ID:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1">
                    {selectedUser.users?.card_id || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body1" color="textSecondary">Failed Attempts:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" color="error" fontWeight="medium">
                    {selectedUser.failed} {selectedUser.failed === 1 ? 'attempt' : 'attempts'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Right Column: Access Logs */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, minHeight: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Recent Access Attempts
              </Typography>
              
              {currentAccessLogs.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                  <Typography variant="body1" color="textSecondary">
                    No recent access logs found
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {currentAccessLogs.map((log) => (
                    <Grid item xs={12} key={log.id}>
                      <Card variant="outlined" >
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                              {/* Rectangular image for access logs */}
                              {log.user_picture ? (
                                <Box 
                                  component="img"
                                  src={log.user_picture}
                                  alt="Access attempt"
                                  sx={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    border: '1px solid #e0e0e0',
                                  }}
                                />
                              ) : (
                                <Box 
                                  sx={{ 
                                    width: '100%', 
                                    height: 100, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #e0e0e0',
                                  }}
                                >
                                  <Typography variant="h6" color="textSecondary">
                                    No Image
                                  </Typography>
                                </Box>
                              )}
                            </Grid>
                            <Grid item xs={12} sm={9}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Chip 
                                  label={log.status === 'success' ? 'Success' : 'Failed'} 
                                  color={log.status === 'success' ? 'success' : 'error'}
                                  sx={{ fontSize: '1rem', height: '36px', padding: '0 12px' }}
                                />
                                <Typography variant="body2" color="textSecondary">
                                  {new Date(log.created_at).toLocaleString()}
                                </Typography>
                              </Box>
                              <Box sx={{ mt: 2, height: '60px', overflow: 'auto' }}>
                                <Typography variant="body1">
                                  {log.notes || 'No details available'}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        // Render placeholder when no user is selected
        renderPlaceholder()
      )}
    </Box>
  );
};

export default FailedLoginComponent;
