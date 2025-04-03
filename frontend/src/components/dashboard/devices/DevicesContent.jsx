import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { 
  Box, 
  Button, 
  IconButton, 
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Grid,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PersonIcon from '@mui/icons-material/Person';

import { format } from 'date-fns';

// Contexts
import { useData } from '../../../contexts/dataContext';
// API
import { rolesApi, devicesApi, roleToDeviceApi } from '../../../api/supabase/supabaseApi';
// API key and base URL from environment variables
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

const DevicesContent = () => {
  const theme = useTheme();
  const { devices, setDevices } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState({});
  
  // Role assignment state
  const [roles, setRoles] = useState([]);
  const [deviceRoles, setDeviceRoles] = useState({});
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedDeviceForRoles, setSelectedDeviceForRoles] = useState(null);
  
  // Modal State  
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: null, // 'add', 'edit' or 'delete'
    selectedDevice: null,
    formData: {
      device_name: '',
      description: '',
      deviceid: '',
      ip_address: '',
      local_key: '',
      version: ''
    }
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // First fetch the devices data
        const { data, error } = await devicesApi.getAll();
        
        if (error) throw error;
        
        // Only update state if component is still mounted
        if (isMounted) {
          setDevices(data);
          console.log('DEVICES:', data);
          
          // If we have devices, immediately fetch their status
          if (data && data.length > 0) {
            const newStatus = { ...deviceStatus };
            
            await Promise.all(
              data.map(async (device) => {
                try {
                  const response = await axios.get(`${API_BASE_URL}/tinytuya/status/${device.deviceid}`, {
                    headers: {
                      'X-API-Key': API_KEY,
                      'Content-Type': 'application/json'
                    }
                  });

                  const statusData = response.data;
                  
                  if (statusData && statusData.dps && statusData.dps["1"] !== undefined) {
                    // Status is a boolean in dps.1
                    newStatus[device.deviceid] = statusData.dps["1"] ? 'ON' : 'OFF';
                  } else {
                    newStatus[device.deviceid] = 'Unknown';
                  }
                } catch (err) {
                  console.error(err);
                  newStatus[device.deviceid] = 'ERROR';
                }
              })
            );
            
            if (isMounted) {
              setDeviceStatus(newStatus);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchAllData();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [setDevices]); // Only depend on setDevices


  // useEffect to fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error } = await rolesApi.getAll();
        if (error) throw error;
        setRoles(data || []);
      } catch (error) {
        console.error('Error fetching roles:', error.message);
      }
    };
    
    fetchRoles();
  }, [setRoles]);

  // Function to fetch and update device status
  const fetchDeviceStatus = async () => {
    if (devices.length === 0) return;
    
    setIsLoading(true);
    const newStatus = { ...deviceStatus };
    
    try {
      await Promise.all(
        devices.map(async (device) => {
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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

  // Function to fetch device role assignments
  const fetchDeviceRoles = async (deviceId) => {
    try {
      const { data, error } = await roleToDeviceApi.getDevicesByDevice(deviceId);
      if (error) throw error;
      
      // Transform the data into a more usable format
      const roleIds = data.map(item => item.roles.role_id);
      return roleIds;
    } catch (error) {
      console.error('Error fetching device roles:', error.message);
      return [];
    }
  };

  // Function to handle role assignment
  const handleRoleAssignment = async (deviceId, roleId, isAssigned) => {
    try {
      if (isAssigned) {
        // Assign role to device
        const { error } = await roleToDeviceApi.assign(roleId, deviceId);
        if (error) throw error;
      } else {
        // Unassign role from device
        const { error } = await roleToDeviceApi.unassign(roleId, deviceId);
        if (error) throw error;
      }
      
      // Update the device roles state
      const updatedRoles = await fetchDeviceRoles(deviceId);
      setDeviceRoles({
        ...deviceRoles,
        [deviceId]: updatedRoles
      });
    } catch (error) {
      console.error('Error updating role assignment:', error.message);
    }
  };

  // Function to open the role assignment modal
  const handleOpenRoleModal = async (device) => {
    setSelectedDeviceForRoles(device);
    
    // Fetch current role assignments for this device
    const roleIds = await fetchDeviceRoles(device.device_id);
    setDeviceRoles({
      ...deviceRoles,
      [device.device_id]: roleIds
    });
    
    setRoleModalOpen(true);
  };

  // Handle add
  const handleAdd = () => {
    setModalState({
      isOpen: true,
      mode: 'add',
      selectedDevice: null,
      formData: {
        device_name: '',
        description: '',
        deviceid: '',
        ip_address: '',
        local_key: '',
        version: ''
      }
    });
  };

  // Handle edit
  const handleEdit = (row) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      selectedDevice: row.original,
      formData: {
        device_name: row.original.device_name,
        description: row.original.description,
        deviceid: row.original.deviceid,
        ip_address: row.original.ip_address,
        local_key: row.original.local_key,
        version: row.original.version
      }
    });
  };

  // Handle delete
  const handleDelete = (row) => {
    setModalState({
      isOpen: true,
      mode: 'delete',
      selectedDevice: row.original,
      formData: {} // Not needed for delete
    });
  };

  // Close modal
  const handleCloseModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // Handle input change for edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      }
    }));
  };

  // Save changes for edit
  const handleSaveChanges = async () => {
    try {
      const { error } = await devicesApi.update(
        modalState.selectedDevice.device_id, 
        modalState.formData
      );
      
      if (error) throw error;
      
      const updatedDevices = devices.map(device => 
        device.device_id === modalState.selectedDevice.device_id 
          ? { ...device, ...modalState.formData } 
          : device
      );
      
      setDevices(updatedDevices);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating device:', error.message);
    }
  };

  // Create new device
  const handleCreate = async () => {
    try {
      const { data, error } = await devicesApi.create(modalState.formData);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the new device to the devices array
        setDevices([...devices, data[0]]);
        handleCloseModal();
      } else {
        throw new Error('No data returned from create operation');
      }
    } catch (error) {
      console.error('Error creating device:', error.message);
    }
  };

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    try {
      const { error } = await devicesApi.delete(modalState.selectedDevice.device_id);
      
      if (error) throw error;
      
      const updatedDevices = devices.filter(
        device => device.device_id !== modalState.selectedDevice.device_id
      );
      setDevices(updatedDevices);
      
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting device:', error.message);
    }
  };

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'device_id',
        header: 'UID',
        enableColumnActions: false,
        enableClickToCopy: true,
        size: 50,
        Cell: ({ cell }) => {
          const fullId = cell.getValue();
          // Display 18 characters followed by ...
          const truncatedId = fullId ? `${fullId.substring(0, 10)}...` : '';
          
          return (
            <Tooltip title={fullId}>
              <Typography sx={{ fontSize: '1.2rem' }}>
                {truncatedId}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: 'device_name',
        header: 'Name',
        enableClickToCopy: true,
        size: 100,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        enableClickToCopy: true,
        size: 200,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'deviceid',
        header: 'Device ID',
        enableColumnActions: false,
        enableClickToCopy: true,
        size: 100,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'ip_address',
        header: 'IP Address',
        enableColumnActions: false,
        enableClickToCopy: true,
        size: 60,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'local_key',
        header: 'Local Key',
        enableColumnActions: false,
        enableClickToCopy: true,
        size: 100,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'version',
        header: 'Version',
        enableColumnActions: false,
        enableClickToCopy: true,
        size: 20,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'deviceid', // Use deviceid as the key to look up status
        header: 'Status',
        id: 'status', // Custom ID to avoid conflict with deviceid column
        enableColumnActions: false,
        size: 80,
        Cell: ({ cell }) => {
          const deviceId = cell.getValue();
          const status = deviceStatus[deviceId] || 'Unknown';
          
          return (
            <Chip 
              size="medium" 
              label={status} 
              color={getStatusColor(status)}
              sx={{ 
                borderRadius: '8px',
                fontWeight: 'bold', 
                fontSize: '1.2rem', 
                padding: '10px', 
                height: '40px' 
              }}
            />
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Create Date',
        enableClickToCopy: true,
        size: 160,
        Cell: ({ cell }) => {
          const date = new Date(cell.getValue());
          return (
            <Typography sx={{ fontSize: '1.2rem' }}>
              {date.toLocaleString()}
            </Typography>
          );
        },
      },
    ],
    [deviceStatus]
  );
  
  // Render modal content based on mode
  const renderModalContent = () => {
    const { mode, selectedDevice, formData } = modalState;

    if (mode === 'add') {
      return (
        <>
          <DialogTitle sx={{ fontSize: '1.8rem' }}>
            Add New Device
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Device Name"
                  name="device_name"
                  value={formData.device_name}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Device ID"
                  name="deviceid"
                  value={formData.deviceid}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Local Key"
                  name="local_key"
                  value={formData.local_key}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="IP Address"
                  name="ip_address"
                  value={formData.ip_address}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Version"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseModal} 
              sx={{ fontSize: '1.2rem' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              variant="contained" 
              sx={{ fontSize: '1.2rem' }}
            >
              Create Device
            </Button>
          </DialogActions>
        </>
      );
    }
    if (mode === 'edit' && selectedDevice) {
      return (
        <>
          <DialogTitle sx={{ fontSize: '1.8rem' }}>
            Edit Device
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Device ID (System)"
                  value={selectedDevice.device_id}
                  disabled
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Device Name"
                  name="device_name"
                  value={formData.device_name}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Device ID (Tuya)"
                  name="deviceid"
                  value={formData.deviceid}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Local Key"
                  name="local_key"
                  value={formData.local_key}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="IP Address"
                  name="ip_address"
                  value={formData.ip_address}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Version"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Created At"
                  value={new Date(selectedDevice.created_at).toLocaleString()}
                  disabled
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseModal} 
              sx={{ fontSize: '1.2rem' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              variant="contained" 
              sx={{ fontSize: '1.2rem' }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </>
      );
    }
    
    if (mode === 'delete' && selectedDevice) {
      return (
        <>
          <DialogTitle sx={{ fontSize: '1.8rem' }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: '1.4rem' }}>
              Are you sure you want to delete the Device "{selectedDevice.device_name}"? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseModal} 
              sx={{ fontSize: '1.2rem' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              color="error" 
              variant="contained" 
              sx={{ fontSize: '1.2rem' }}
            >
              Delete
            </Button>
          </DialogActions>
        </>
      );
    }
    
    return null;
  };

  // Create the table instance using the hook
  const table = useMaterialReactTable({
    columns,
    data: devices || [],
    state: { isLoading },
    enableSorting: true,
    
    enableColumnActions: true, 
    enableColumnFilters: true,
    enableColumnOrdering: true,

    enableColumnFilterModes: true,
    enableColumnDragging: false,
    enableSortingRemoval: true,

    enableRowSelection: true,
    enableRowActions: true,
    positionActionsColumn: "last",
    enablePagination: true,
    initialState: { 
      pagination: { 
        pageSize: 8,
        pageIndex: 0
      },
      columnVisibility: {
        // Set to false for columns you want to hide
        device_id: false,
        description: false,
        created_at: false
      },
      sorting: [
        {
          id: 'device_name',
          asc: true // Sort by newest first
        }
      ] 
    },
    paginationDisplayMode: "pages",
    muiPaginationProps: {
      color: 'primary',
      shape: 'rounded',
      size: 'large',
      showRowsPerPage: false,
      variant: 'outlined',
      showFirstButton: true, 
      showLastButton: true, 
      sx: {
        '& .MuiPaginationItem-root': {
          fontSize: '2.4rem', // Larger font size for pagination items
        },
        '& .MuiSvgIcon-root': {
          fontSize: '4rem', // Larger icons for first/last/next/prev buttons
        }
      },
    },
    renderRowActions: ({ row }) => {
      const deviceId = row.original.deviceid;
      const status = deviceStatus[deviceId] || 'Unknown';
      
      // If the device is ON, either return null or disabled buttons
      if (status === 'ON') {
        // Return disabled buttons
        return (
          <Box sx={{ display: 'flex', gap: '2px' }}>
            <Tooltip title="Assign Roles">
              <IconButton 
                onClick={() => handleOpenRoleModal(row.original)}
                sx={{ fontSize: '2rem', color: 'primary.main' }}>
                <PersonIcon fontSize="inherit"/>
              </IconButton>
            </Tooltip>
            <Tooltip title="Device is ON - Cannot Edit">
              <span>
                <IconButton 
                  disabled
                  sx={{ fontSize: '2rem' }}>
                  <EditIcon fontSize="inherit"/>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Device is ON - Cannot Delete">
              <span>
                <IconButton 
                  disabled
                  color="error" 
                  sx={{ fontSize: '2rem' }}>
                  <DeleteIcon fontSize="inherit"/>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      }
      // Otherwise, return action buttons
      return (
        <Box sx={{ display: 'flex', gap: '2px' }}>
          <Tooltip title="Assign Roles">
            <IconButton 
              onClick={() => handleOpenRoleModal(row.original)}
              sx={{ fontSize: '2rem', color: 'primary.main' }}>
              <PersonIcon fontSize="inherit"/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton 
              onClick={() => handleEdit(row)}
              sx={{ fontSize: '2rem' }}>
              <EditIcon fontSize="inherit"/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              color="error" 
              onClick={() => handleDelete(row)}
              sx={{ fontSize: '2rem' }}>
              <DeleteIcon fontSize="inherit"/>
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    muiTableHeadCellProps: {
      sx: {
        fontSize: '1.4rem',
        fontWeight: 'bold',
        padding: '8px',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)'
      }
    },
    muiBottomToolbarProps: {
      sx: {
        '& .MuiBox-root': {
          padding: '4px 8px 0 0!important',
        }
      }
    }
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ fontSize: '2rem' }} // Larger heading
        >
          Devices Management
        </Typography>
        
        {/* Group buttons together on the right */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="warning"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={fetchDeviceStatus}
            sx={{ fontSize: '1.6rem', py: 1, px: 2 }} // Larger button
          >
            Refresh Status
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            size="large"
            onClick={handleAdd}
            sx={{ fontSize: '1.6rem', py: 1, px: 2 }} // Larger button
          >
            Add Device
          </Button>
        </Box>
      </Box>
      
      {/* Use the table instance with the new API */}
      <MaterialReactTable table={table} />

      {/* Modal */}
      <Dialog 
        open={modalState.isOpen} 
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
      >
        {renderModalContent()}
      </Dialog>

      {/* Role Modal */}
      <Dialog
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: '1.8rem' }}>
          {selectedDeviceForRoles && `Assign Roles to ${selectedDeviceForRoles.device_name}`}
        </DialogTitle>
        <DialogContent>
          {selectedDeviceForRoles && (
            <Box sx={{ 
              height: '380px', // Fixed height to accommodate about 4 roles
              overflow: 'auto'  // Enable scrolling
            }}>
              <List>
                {roles
                  .filter(role => {
                    const roleName = role.role_name.toLowerCase();
                    return roleName !== 'admin' && roleName !== 'cleaner';
                  })
                  .map((role) => {
                    const isAssigned = deviceRoles[selectedDeviceForRoles.device_id]?.includes(role.role_id);
                    
                    return (
                      <ListItem 
                        key={role.role_id} 
                      >
                        <ListItemText 
                          primary={role.role_name} 
                          secondary={role.description}
                          primaryTypographyProps={{ fontSize: '1.4rem' }}
                          secondaryTypographyProps={{ fontSize: '1.2rem' }}
                        />
                        <ListItemSecondaryAction sx={{ width: '100px' }}>
                          <Switch 
                            edge="end"
                            // size="medium"
                            checked={isAssigned}
                            onChange={(e) => handleRoleAssignment(
                              selectedDeviceForRoles.device_id, 
                              role.role_id, 
                              e.target.checked
                            )}
                            color="primary"
                            // GOT the Style for the thumbnail here
                            // https://codesandbox.io/p/sandbox/customizedswitches-material-demo-forked-4m2t71?file=%2Fdemo.tsx%3A35%2C19-35%2C35
                            sx={{ 
                              width: 80,
                              height: 48,
                              padding: 1,
                              "& .MuiSwitch-switchBase": {
                                margin: 1,
                                padding: 0,
                                transform: "translateY(-2px)",
                                "&.Mui-checked": {
                                  transform: "translateX(30px) translateY(-2px)",
                                },
                              },
                              "& .MuiSwitch-thumb": {
                                width: 36,
                                height: 36,
                              },
                              "& .MuiSwitch-track": {
                                borderRadius: 20 / 2,
                              }, 
                            }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })
                }
                {roles.length === 0 && (
                  <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary', fontSize: '1.4rem' }}>
                    No roles available. Please create roles first.
                  </Typography>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRoleModalOpen(false)} 
            variant="contained"
            sx={{ fontSize: '1.2rem' }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
}

export default DevicesContent;


