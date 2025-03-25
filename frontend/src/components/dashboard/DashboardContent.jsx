import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  useTheme,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  FormControl, 
  Select, 
  MenuItem
} from '@mui/material';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ImportantDevicesIcon from '@mui/icons-material/ImportantDevices';

// Charts
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Contexts
import { useData } from '../../contexts/dataContext';

// API
import { 
  usersApi, 
  rolesApi,
  devicesApi,
  accessLogsApi,
  deviceLogsApi 
} from '../../api/supabase/supabaseApi';

// Import default user image
import { defaultUserImage } from './users/defaultUserImage';

const DashboardContent = () => {
  const theme = useTheme();
  const { users, setUsers } = useData();
  const { roles, setRoles } = useData();
  const { devices, setDevices } = useData();
  const [deviceLogs, setDeviceLogs] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDeviceTrend, setSelectedDeviceTrend] = useState('');
  const [selectedUserTrend, setSelectedUserTrend] = useState('');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalDevices: 0,
    accessGranted: 0,
    accessDenied: 0,
    recentLogs: []
  });

  // Fetch all initial data in one useEffect
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [usersResponse, rolesResponse, devicesResponse] = await Promise.all([
          usersApi.getAll(),
          rolesApi.getAll(),
          devicesApi.getAll()
        ]);
        
        // Handle errors
        if (usersResponse.error) throw usersResponse.error;
        if (rolesResponse.error) throw rolesResponse.error;
        if (devicesResponse.error) throw devicesResponse.error;
        
        // Update state
        setUsers(usersResponse.data);
        setRoles(rolesResponse.data);
        setDevices(devicesResponse.data);
        
        console.log('USERS:', usersResponse.data);
        console.log('ROLES:', rolesResponse.data);
        console.log('DEVICES:', devicesResponse.data);
      } catch (error) {
        console.error('Error fetching initial data:', error.message);
      }
    };
    
    fetchAllData();
  }, [setUsers, setRoles, setDevices]);

  // Fetch access logs in a separate useEffect
  useEffect(() => {
    let isMounted = true;
    
    const fetchAccessLogsData = async () => {
      try {
        const { data, error } = await accessLogsApi.getAll();
        
        if (error) throw error;
        
        if (isMounted) {
          setAccessLogs(data);
        }
      } catch (error) {
        console.error('Error fetching ACCESS LOGS data:', error.message);
      }
    };
    
    fetchAccessLogsData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch device logs in a separate useEffect
  useEffect(() => {
    let isMounted = true;
    
    const fetchDeviceLogsData = async () => {
      try {
        const { data, error } = await deviceLogsApi.getAll();
        
        if (error) throw error;
        
        if (isMounted) {
          setDeviceLogs(data);
        }
      } catch (error) {
        console.error('Error fetching DEVICE LOGS data:', error.message);
      }
    };
    
    fetchDeviceLogsData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate statistics in a separate useEffect
  useEffect(() => {
    if (users && roles && devices && accessLogs) {
      // Count access granted and denied
      const granted = accessLogs.filter(log => log.success).length;
      const denied = accessLogs.filter(log => !log.success).length;
      
      // Get recent logs (last 10)
      const recent = [...accessLogs]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      
      setStats({
        totalUsers: users.length,
        totalRoles: roles.length,
        totalDevices: devices.length,
        accessGranted: granted,
        accessDenied: denied,
        recentLogs: recent
      });
      
      setIsLoading(false);
    }
  }, [users, roles, devices, accessLogs]);

  // Prepare data for access chart
  const accessChartData = useMemo(() => {
    return [
      { name: 'Granted', value: stats.accessGranted },
      { name: 'Denied', value: stats.accessDenied }
    ];
  }, [stats.accessGranted, stats.accessDenied]);

  // Colors for pie chart
  const COLORS = ['#4caf50', '#f44336'];

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };


  // Function to prepare access trends data
  const accessTrendsData = useMemo(() => {
    // Filter logs by selected user if one is selected
    const filteredLogs = selectedUserTrend 
      ? accessLogs.filter(log => log.user_id === selectedUserTrend)
      : accessLogs;
    
    // Group logs by date
    const groupedByDate = filteredLogs.reduce((acc, log) => {
      // Format date to YYYY-MM-DD to group by day
      const date = new Date(log.created_at);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = { 
          date: dateStr, 
          granted: 0, 
          denied: 0 
        };
      }
      
      if (log.success) {
        acc[dateStr].granted += 1;
      } else {
        acc[dateStr].denied += 1;
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(groupedByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      // Limit to last 14 days for better visualization
      .slice(-14);
  }, [accessLogs, selectedUserTrend]);
  
// Function to prepare device trends data
  const deviceTrendsData = useMemo(() => {
    // Filter by selected device if one is selected
    const filteredLogs = selectedDeviceTrend 
      ? deviceLogs.filter(log => log.devices?.device_name === selectedDeviceTrend)
      : deviceLogs;
    
    // Group logs by date
    const groupedByDate = filteredLogs.reduce((acc, log) => {
      // Format date to YYYY-MM-DD to group by day
      const date = new Date(log.created_at);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = { 
          date: dateStr, 
          success: 0, 
          error: 0 
        };
      }
      
      if (log.status === true) {
        acc[dateStr].success += 1;
      } else {
        acc[dateStr].error += 1;
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(groupedByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      // Limit to last 14 days for better visualization
      .slice(-14);
  }, [deviceLogs, selectedDeviceTrend]);


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

       {/* Dashboard Overview */}
       <Grid item xs={12}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 2, 
            borderRadius: 2,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography 
            variant="h1" 
            component="h1"
            sx={{ 
              fontSize: '2.4rem', 
              fontWeight: 'bold',
              color: '#1e1e1e' 
            }}>
               Dashboard Overview
          </Typography>
        </Paper>
      </Grid>

      {/* System Status Summary */}
      <Grid container spacing={3} sx={{ my: -4 }}>
        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2, 
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1.6rem' }}>
              System Summary
            </Typography>


            {/* Stats Cards */}
            <Grid container spacing={3} mb={2}>
              {/* Users Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  variant="outlined"
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: '#1e1e1e'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      Users
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', fontSize: '3rem' }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '1.2rem' }}>
                    Total registered users
                  </Typography>
                </Paper>
              </Grid>

              {/* Roles Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  variant="outlined"
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: '#1e1e1e'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <BadgeIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      Roles
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', fontSize: '3rem' }}>
                    {stats.totalRoles}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '1.2rem' }}>
                    Access control roles
                  </Typography>
                </Paper>
              </Grid>

              {/* Devices Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  variant="outlined"
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: '#1e1e1e'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <ImportantDevicesIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      Devices
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', fontSize: '3rem' }}>
                    {stats.totalDevices}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '1.2rem' }}>
                    Connected smart devices
                  </Typography>
                </Paper>
              </Grid>

              {/* Access Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  variant="outlined"
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: '#1e1e1e'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                      <AccessTimeIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                      Access Attempts
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', fontSize: '3rem' }}>
                    {stats.accessGranted + stats.accessDenied}
                  </Typography>
                  <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label={`${stats.accessGranted} Granted`} 
                      size="medium" 
                      color="success"
                      sx={{ 
                        fontSize: '1.2rem', 
                        flexGrow: 1,
                        justifyContent: 'flex-start', 
                        height: '36px', 
                        '& .MuiChip-icon': {
                          fontSize: '1.4rem'
                        }
                      }}
                    />
                    <Chip 
                      icon={<CancelIcon />} 
                      label={`${stats.accessDenied} Denied`} 
                      size="medium" 
                      color="error"
                      sx={{ 
                        fontSize: '1.2rem', 
                        flexGrow: 1, 
                        justifyContent: 'flex-start', 
                        height: '36px', 
                        '& .MuiChip-icon': {
                          fontSize: '1.4rem' 
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

             {/* Stats Cards */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Users" 
                    titleTypographyProps={{ fontSize: '1.4rem' }}
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PeopleIcon />
                      </Avatar>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • {users.filter(user => user.status === 'Active').length} active users
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • {users.filter(user => user.status === 'InActive').length} inActive users
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • {users.filter(user => user.status === 'Disabled').length} Disabled users
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Roles" 
                    titleTypographyProps={{ fontSize: '1.4rem' }}
                    avatar={
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <BadgeIcon />
                      </Avatar>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • {roles.filter(role => role.role_name.toLowerCase() === 'admin').length} Admin role(s) configured
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • {roles.filter(role => role.role_name.toLowerCase() === 'cleaner').length} Cleaner role(s) configured
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • {roles.length - (roles.filter(role => role.role_name.toLowerCase() === 'admin').length + roles.filter(role => role.role_name.toLowerCase() === 'cleaner').length)} custom roles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Devices" 
                    titleTypographyProps={{ fontSize: '1.4rem' }}
                    avatar={
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <ImportantDevicesIcon />
                      </Avatar>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • Success rate: {stats.accessGranted + stats.accessDenied > 0 
                          ? `${Math.round((stats.accessGranted / (stats.accessGranted + stats.accessDenied)) * 100)}%` 
                          : 'N/A'}
                    </Typography>                    
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • Failure rate: {stats.accessGranted + stats.accessDenied > 0 
                          ? `${Math.round((stats.accessDenied / (stats.accessGranted + stats.accessDenied)) * 100)}%` 
                          : 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • Last access: {stats.recentLogs.length > 0 ? formatDate(stats.recentLogs[0].created_at) : 'No recent activity'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Lab Access Banner */}
      <Grid item xs={12} sx={{ my: 3 }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 2, 
            borderRadius: 2,
            backgroundColor: theme.palette.primary.main,
                  color: 'white',
            textAlign: 'center',
            mb: -8
          }}
        >
          <Typography  
            variant="h1" 
            component="h1"
            sx={{ 
              fontSize: '2.4rem', 
              fontWeight: 'bold',
              color: '#1e1e1e' 
            }}>
              Lab Access
          </Typography>
        </Paper>
      </Grid> 

      {/* Charts and Recent Activity */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Access Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2, 
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
              Statistics{/* Lab Access Statistics */}
              </Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <Select
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  displayEmpty
                  sx={{ fontSize: '1.2rem' }}
                >
                  <MenuItem value="" sx={{ fontSize: '1.2rem' }}>All Users</MenuItem>
                  {accessLogs
                    .reduce((users, log) => {
                      const userName = log.users ? `${log.users.first_name} ${log.users.last_name}` : null;
                      const userId = log.user_id;
                      if (userName && userId && !users.some(user => user.id === userId)) {
                        users.push({ id: userId, name: userName });
                      }
                      return users;
                    }, [])
                    .map((user) => (
                      <MenuItem key={user.id} value={user.id} sx={{ fontSize: '1.2rem' }}>
                        {user.name}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accessLogs
                      .filter(log => !selectedUser || log.user_id === selectedUser)
                      .reduce((acc, log) => {
                        const granted = acc.find(item => item.name === 'Granted');
                        const denied = acc.find(item => item.name === 'Denied');
                        
                        if (log.success) {
                          if (granted) granted.value += 1;
                          else acc.push({ name: 'Granted', value: 1 });
                            } else {
                          if (denied) denied.value += 1;
                          else acc.push({ name: 'Denied', value: 1 });
                        }
                        return acc;
                      }, [])
                    }
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Granted', color: '#4caf50' },
                      { name: 'Denied', color: '#f44336' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} attempts`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid> 

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2, 
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1.6rem' }}>
              Recent Activity{/* Recent Lab Access Activity */}
            </Typography>
            <List sx={{ width: '100%', maxHeight: 300, overflow: 'auto' }}>
              {stats.recentLogs.map((log) => (
                <ListItem key={log.log_id} alignItems="flex-start" sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={log.user_picture || defaultUserImage}
                      alt={log.users?.first_name || 'User'}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '1.3rem' }}>
                          {log.users ? `${log.users.first_name} ${log.users.last_name}` : 'Unknown User'}
                        </Typography>
                        <Chip 
                          label={log.success ? 'GRANTED' : 'DENIED'} 
                          size="medium" 
                          color={log.success ? 'success' : 'error'}
                          sx={{ 
                            fontSize: '1.4rem', 
                            fontWeight: 'bold',
                            height: '32px', 
                            padding: '0 10px', 
                            '& .MuiChip-label': {
                              padding: '0 8px' 
                            }
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'block', fontSize: '1.1rem' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {log.notes || 'No additional information'}
                        </Typography>
                        <Typography
                          sx={{ display: 'block', fontSize: '1rem' }}
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {formatDate(log.created_at)}
                        </Typography>
                      </React.Fragment>
                    }
                    primaryTypographyProps={{ fontSize: '1.3rem' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem' }}
                  />
                </ListItem>
              ))}
              {stats.recentLogs.length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="No recent activity" 
                    primaryTypographyProps={{ 
                      fontSize: '1.3rem',
                      textAlign: 'center',
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        

        {/* Access Trends Over Time */}
        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2, 
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                Trends Over Time{/* Lab Access Trends Over Time */}
              </Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <Select
                  value={selectedUserTrend}
                  onChange={(e) => setSelectedUserTrend(e.target.value)}
                  displayEmpty
                  sx={{ fontSize: '1.2rem' }}
                >
                  <MenuItem value="" sx={{ fontSize: '1.2rem' }}>All Users</MenuItem>
                  {accessLogs
                    .reduce((users, log) => {
                      const userName = log.users ? `${log.users.first_name} ${log.users.last_name}` : null;
                      const userId = log.user_id;
                      if (userName && userId && !users.some(user => user.id === userId)) {
                        users.push({ id: userId, name: userName });
                      }
                      return users;
                    }, [])
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((user) => (
                      <MenuItem key={user.id} value={user.id} sx={{ fontSize: '1.2rem' }}>
                        {user.name}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={accessTrendsData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 14 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis tick={{ fontSize: 14 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      value, 
                      name === 'granted' ? 'Granted Access' : 'Denied Access'
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    }}
                    contentStyle={{ fontSize: '1.2rem' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '1.2rem' }}
                    formatter={(value) => value === 'granted' ? 'Granted Access' : 'Denied Access'}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="granted" 
                    stroke="#4caf50" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="granted"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="denied" 
                    stroke="#f44336" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="denied"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

       {/* Device Logs Banner */}
       <Grid item xs={12} >
        <Paper 
          elevation={3}
          sx={{ 
            p: 2, 
            borderRadius: 2,
            backgroundColor: theme.palette.primary.main,
                  color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography  
            variant="h1" 
            component="h1"
            sx={{ 
              fontSize: '2.4rem', 
              fontWeight: 'bold',
              color: '#1e1e1e' 
            }}>
              Device(s)
          </Typography>
        </Paper>
      </Grid> 

        
        {/* Device Logs Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2, 
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                Statistics{/* Device Logs Statistics */}
              </Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <Select
                  value={selectedDevice || ''}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  displayEmpty
                  sx={{ fontSize: '1.2rem' }}
                >
                  <MenuItem value="" sx={{ fontSize: '1.2rem' }}>All Devices</MenuItem>
                  {deviceLogs
                    .reduce((devices, log) => {
                      const deviceName = log.devices?.device_name;
                      if (deviceName && !devices.includes(deviceName)) {
                        devices.push(deviceName);
                      }
                      return devices;
                    }, [])
                    .map((device) => (
                      <MenuItem key={device} value={device} sx={{ fontSize: '1.2rem' }}>
                        {device}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceLogs
                      .filter(log => !selectedDevice || log.devices?.device_name === selectedDevice)
                      .reduce((acc, log) => {
                        const success = acc.find(item => item.name === 'Success');
                        const error = acc.find(item => item.name === 'Error');
                        
                        if (log.status === true) {
                          if (success) success.value += 1;
                          else acc.push({ name: 'Success', value: 1 });
                        } else {
                          if (error) error.value += 1;
                          else acc.push({ name: 'Error', value: 1 });
                        }
                        return acc;
                      }, [])
                    }
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Success', color: '#4caf50' },
                      { name: 'Error', color: '#f44336' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} logs`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid> 

        {/* Recent Device Activity */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2, 
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1.6rem' }}>
              Recent Activity{/* Recent Device Activity */}
            </Typography>
            <List sx={{ width: '100%', maxHeight: 300, overflow: 'auto' }}>
              {deviceLogs.slice(0, 10).map((log) => (
                <ListItem key={log.log_id} alignItems="flex-start" sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <ImportantDevicesIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '1.3rem' }}>
                          {log.devices ? log.devices.device_name : 'Unknown Device'}
                        </Typography>
                        <Chip 
                          label={log.status === true ? 'SUCCESS' : 'ERROR'} 
                          size="medium" 
                          color={log.status === true ? 'success' : 'error'}
                          sx={{ 
                            fontSize: '1.4rem',
                            fontWeight: 'bold',
                            height: '32px',
                            padding: '0 10px',
                            '& .MuiChip-label': {
                              padding: '0 8px'
                            }
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'block', fontSize: '1.1rem' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {log.action || 'No action'} - {log.notes || 'No additional information'}
                        </Typography>
                        <Typography
                          sx={{ display: 'block', fontSize: '1rem' }}
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          User: {log.users ? `${log.users.first_name} ${log.users.last_name}` : 'Unknown User'} • {new Date(log.created_at).toLocaleString()}
                        </Typography>
                      </React.Fragment>
                    }
                    primaryTypographyProps={{ fontSize: '1.3rem' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem' }}
                  />
                </ListItem>
              ))}
              {deviceLogs.length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="No recent device activity" 
                    primaryTypographyProps={{ 
                      fontSize: '1.3rem',
                      textAlign: 'center',
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>



        {/* Device Trends Over Time */}
        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2, 
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1.6rem' }}>
                 Trends Over Time{/* Device Trends Over Time */}
              </Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <Select
                  value={selectedDeviceTrend}
                  onChange={(e) => setSelectedDeviceTrend(e.target.value)}
                  displayEmpty
                  sx={{ fontSize: '1.2rem' }}
                >
                  <MenuItem value="" sx={{ fontSize: '1.2rem' }}>All Devices</MenuItem>
                  {deviceLogs
                    .reduce((devices, log) => {
                      const deviceName = log.devices?.device_name;
                      if (deviceName && !devices.includes(deviceName)) {
                        devices.push(deviceName);
                      }
                      return devices;
                    }, [])
                    .sort((a, b) => a.localeCompare(b)) 
                    .map((device) => (
                      <MenuItem key={device} value={device} sx={{ fontSize: '1.2rem' }}>
                        {device}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={deviceTrendsData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 14 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis tick={{ fontSize: 14 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      value, 
                      name === 'success' ? 'Successful Operations' : 'Error Operations'
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    }}
                    contentStyle={{ fontSize: '1.2rem' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '1.2rem' }}
                    formatter={(value) => value === 'success' ? 'Successful Operations' : 'Error Operations'}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="success" 
                    stroke="#4caf50" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="success"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="error" 
                    stroke="#f44336" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="error"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardContent;
