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
  Chip
} from '@mui/material';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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
  Cell
} from 'recharts';

// Contexts
import { useData } from '../../contexts/dataContext';

// API
import { usersApi, rolesApi, devicesApi, accessLogsApi } from '../../api/supabase/supabaseApi';

// Import default user image
import { defaultUserImage } from './users/defaultUserImage';

const DashboardContent = () => {
  const theme = useTheme();
  const { users, setUsers } = useData();
  const { roles, setRoles } = useData();
  const { devices, setDevices } = useData();
  
  const [accessLogs, setAccessLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalDevices: 0,
    accessGranted: 0,
    accessDenied: 0,
    recentLogs: []
  });

  
    useEffect(() => {
        const fetchUsersData = async () => {
          try {
            const { data, error } = await usersApi.getAll();

            if (error) throw error;
            setUsers(data);
            console.log('USERS:', data);
          } catch (error) {
            console.error('Error fetching USERS data:', error.message);
          }
        };

        const fetchRolesData = async () => {
            try {
                    const { data, error } = await rolesApi.getAll();
                
                    if (error) throw error;
                    setRoles(data);
                    console.log('ROLES:', data);
            } catch (error) {
                console.error('Error fetching ROLES data:', error.message);
            }
        };

        const fetchDevicesData = async () => {
            try {
                const { data, error } = await devicesApi.getAll();
                
                if (error) throw error;
                setDevices(data);
                console.log('DEVICES:', data);

            } catch (error) {
                console.error('Error fetching DEVICES data:', error.message);
            }
        };

        fetchRolesData();
        fetchDevicesData();
        fetchUsersData();
    }, [setRoles, setDevices, setUsers]);

  // Fetch access logs data
  useEffect(() => {
    let isMounted = true;

    const fetchAccessLogsData = async () => {
      try {
        const { data, error } = await accessLogsApi.getAll();
        
        if (error) throw error;
        
        // Only update state if component is still mounted
        if (isMounted) {
          setAccessLogs(data);
        }
      } catch (error) {
        console.error('Error fetching ACCESS LOGS data:', error.message);
      }
    };
    
    fetchAccessLogsData();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [setAccessLogs]);

  // Calculate statistics
  useEffect(() => {
    if (users && roles && devices && accessLogs) {
      // Count access granted and denied
      const granted = accessLogs.filter(log => log.success).length;
      const denied = accessLogs.filter(log => !log.success).length;
      
      // Get recent logs (last 5)
      const recent = [...accessLogs]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
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
  }, [users, roles, devices, accessLogs, setStats]);

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ fontSize: '2rem' }}
      >
        Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        {/* Users Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(25, 118, 210, 0.08)'
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
            elevation={3}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(76, 175, 80, 0.08)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <VpnKeyIcon />
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
            elevation={3}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 152, 0, 0.08)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <DevicesIcon />
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
            elevation={3}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(244, 67, 54, 0.08)'
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
                size="medium" // Changed from "small" to "medium"
                color="success"
                sx={{ 
                  fontSize: '1.2rem', // Increased font size
                  flexGrow: 1, // This makes the chip take up available space
                  justifyContent: 'flex-start', // Aligns content to the left
                  height: '36px', // Increased height
                  '& .MuiChip-icon': {
                    fontSize: '1.4rem' // Larger icon
                  }
                }}
              />
              <Chip 
                icon={<CancelIcon />} 
                label={`${stats.accessDenied} Denied`} 
                size="medium" // Changed from "small" to "medium"
                color="error"
                sx={{ 
                  fontSize: '1.2rem', // Increased font size
                  flexGrow: 1, // This makes the chip take up available space
                  justifyContent: 'flex-start', // Aligns content to the left
                  height: '36px', // Increased height
                  '& .MuiChip-icon': {
                    fontSize: '1.4rem' // Larger icon
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
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
              System Status Summary
            </Typography>
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
                        <VpnKeyIcon />
                      </Avatar>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • {roles.filter(role => role.role_name.toLowerCase() === 'admin').length > 0 ? 'Admin role configured' : 'No admin role'}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • {roles.filter(role => role.role_name.toLowerCase() === 'cleaner').length > 0 ? 'Cleaner role configured' : 'No Cleaner role'}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                      • {roles.length - 2} custom roles
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
                        <DevicesIcon />
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
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1.6rem' }}>
              Access Statistics
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accessChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {accessChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              Recent Access Activity
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
                          size="small" 
                          color={log.success ? 'success' : 'error'}
                          sx={{ fontSize: '0.9rem' }}
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
        {/* User Role Distribution */}
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
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1.6rem' }}>
              User Role Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={roles.map(role => {
                    const usersWithRole = users.filter(user => user.role_id === role.role_id).length;
                    return {
                      name: role.role_name,
                      users: usersWithRole
                    };
                  })}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 14 }} />
                  <YAxis tick={{ fontSize: 14 }} />
                  <Tooltip 
                    formatter={(value) => [`${value} users`, 'Count']}
                    contentStyle={{ fontSize: '1.2rem' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '1.2rem' }} />
                  <Bar dataKey="users" fill="#8884d8" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      
    </Box>
  );
};

export default DashboardContent;
