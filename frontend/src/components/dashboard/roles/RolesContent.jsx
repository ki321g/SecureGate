import React, { useEffect, useState, useMemo } from 'react';
import Typography from '@mui/material/Typography';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch
} from '@mui/material';
// import { MaterialReactTable } from 'material-react-table';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';


import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import DevicesIcon from '@mui/icons-material/Devices'; 
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

// Contexts
import { useData } from '../../../contexts/dataContext';
// API
import { rolesApi, devicesApi, roleToDeviceApi } from '../../../api/supabase/supabaseApi';

const RolesContent = () => {
  const theme = useTheme();
  const {roles, setRoles} = useData();
  const [isLoading, setIsLoading] = useState(true);
  
  const [devices, setDevices] = useState([]);
  const [roleDevices, setRoleDevices] = useState({});
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [selectedRoleForDevices, setSelectedRoleForDevices] = useState(null);
  
  
  // Modal State  
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: null, // 'add', 'edit' or 'delete'
    selectedRole: null,
    formData: {
      role_name: '',
      description: ''
    }
  });

  useEffect(() => {
    let isMounted = true;

    const fetchRolesData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await rolesApi.getAll();
        
        if (error) throw error;
        
        // Only update state if component is still mounted
        if (isMounted) {
          setRoles(data);
          console.log('ROLES:', data);
        }
      } catch (error) {
        console.error('Error fetching ROLES data:', error.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchRolesData();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [setRoles]);

  //useEffect to fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const { data, error } = await devicesApi.getAll();
        if (error) throw error;
        setDevices(data || []);
      } catch (error) {
        console.error('Error fetching devices:', error.message);
      }
    };
    
    fetchDevices();
  }, [setDevices]);

  // Function to fetch role devices
  const fetchRoleDevices = async (roleId) => {
    try {
      const { data, error } = await roleToDeviceApi.getDevicesByRole(roleId);
      if (error) throw error;
      
      // Transform the data into a more usable format
      const deviceIds = data.map(item => item.devices.device_id);
      return deviceIds;
    } catch (error) {
      console.error('Error fetching role devices:', error.message);
      return [];
    }
  };

  // Function to handle device assignment
  const handleDeviceAssignment = async (roleId, deviceId, isAssigned) => {
    try {
      if (isAssigned) {
        // Assign device to role
        const { error } = await roleToDeviceApi.assign(roleId, deviceId);
        if (error) throw error;
      } else {
        // Unassign device from role
        const { error } = await roleToDeviceApi.unassign(roleId, deviceId);
        if (error) throw error;
      }
      
      // Update the role devices state
      const updatedDevices = await fetchRoleDevices(roleId);
      setRoleDevices({
        ...roleDevices,
        [roleId]: updatedDevices
      });
    } catch (error) {
      console.error('Error updating device assignment:', error.message);
    }
  };

  
  
  // Function to open the device assignment modal
  const handleOpenDeviceModal = async (role) => {
    setSelectedRoleForDevices(role);
    
    // Fetch current device assignments for this role
    const deviceIds = await fetchRoleDevices(role.role_id);
    setRoleDevices({
      ...roleDevices,
      [role.role_id]: deviceIds
    });
    
    setDeviceModalOpen(true);
  };
  
  

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'role_id',
        header: 'UID',
        enableColumnActions: false,
        enableClickToCopy: true,
        size: 200,
        Cell: ({ cell }) => {
          const fullId = cell.getValue();
          // Display 18 characters followed by ...
          const truncatedId = fullId ? `${fullId.substring(0, 18)}...` : '';
          
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
        accessorKey: 'role_name',
        header: 'Name',
        enableClickToCopy: true,
        size: 200,
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
        size: 450,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Create Date',
        enableColumnActions: false,
        enableClickToCopy: true,
        size: 230,
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
    []
  );
  
  // Handle add
  const handleAdd = () => {
    setModalState({
      isOpen: true,
      mode: 'add',
      selectedRole: null,
      formData: {
        role_name: '',
        description: ''
      }
    });
  };

  // Handle edit
  const handleEdit = (row) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      selectedRole: row.original,
      formData: {
        role_name: row.original.role_name,
        description: row.original.description
      }
    });
  };

  // Handle delete
  const handleDelete = (row) => {
    setModalState({
      isOpen: true,
      mode: 'delete',
      selectedRole: row.original,
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
      const { error } = await rolesApi.update(
        modalState.selectedRole.role_id, 
        modalState.formData
      );
      
      if (error) throw error;
      
      const updatedRoles = roles.map(role => 
        role.role_id === modalState.selectedRole.role_id 
          ? { ...role, ...modalState.formData } 
          : role
      );
      
      setRoles(updatedRoles);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating role:', error.message);
    }
  };

  // Create new role
  const handleCreate = async () => {
    try {
      const { data, error } = await rolesApi.create(modalState.formData);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the new role to the roles array
        setRoles([...roles, data[0]]);
        handleCloseModal();
      } else {
        throw new Error('No data returned from create operation');
      }
    } catch (error) {
      console.error('Error creating role:', error.message);
    }
  };


  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    try {
      const { error } = await rolesApi.delete(modalState.selectedRole.role_id);
      
      if (error) throw error;
      
      const updatedRoles = roles.filter(
        role => role.role_id !== modalState.selectedRole.role_id
      );
      setRoles(updatedRoles);
      
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting role:', error.message);
    }
  };

  // Render modal content based on mode
  const renderModalContent = () => {
    const { mode, selectedRole, formData } = modalState;

    if (mode === 'add') {
      return (
        <>
          <DialogTitle sx={{ fontSize: '1.8rem' }}>
            Add New Role
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role Name"
                  name="role_name"
                  value={formData.role_name}
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
              Create Role
            </Button>
          </DialogActions>
        </>
      );
    }

    if (mode === 'edit' && selectedRole) {
      return (
        <>
          <DialogTitle sx={{ fontSize: '1.8rem' }}>
            Edit Role
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role ID"
                  value={selectedRole.role_id}
                  disabled
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role Name"
                  name="role_name"
                  value={formData.role_name}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Created At"
                  value={new Date(selectedRole.created_at).toLocaleString()}
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
    
    if (mode === 'delete' && selectedRole) {
      return (
        <>
          <DialogTitle sx={{ fontSize: '1.8rem' }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: '1.4rem' }}>
              Are you sure you want to delete the role "{selectedRole.role_name}"? 
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
    data: roles || [],
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
      sorting: [
        {
          id: 'role_name',
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
          // margin: '16px',
        },
        '& .MuiSvgIcon-root': {
          fontSize: '4rem', // Larger icons for first/last/next/prev buttons
        }
      }
    },
    renderRowActions: ({ row }) => {      
      // Convert to lowercase for comparison
      const roleName = row.original.role_name.toLowerCase(); 
      // Check if the role is admin or cleaner
      const isAdminOrCleaner = roleName === 'admin' || roleName === 'cleaner';
      
      return (
        <Box sx={{ display: 'flex', gap: '2px' }}>
          <Tooltip title={isAdminOrCleaner ? "Cannot assign devices to Admin or Cleaner roles" : "Assign Devices"}>
            <span>
              <IconButton 
                onClick={() => !isAdminOrCleaner && handleOpenDeviceModal(row.original)}
                disabled={isAdminOrCleaner}
                sx={{ 
                  fontSize: '2rem', 
                  color: 'primary.main'
                }}>
                <DevicesIcon fontSize="inherit"/>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={isAdminOrCleaner ? "Cannot Edit Admin or Cleaner roles" : "Edit"}>
            <span>
              <IconButton 
                onClick={() => !isAdminOrCleaner && handleEdit(row)}
                disabled={isAdminOrCleaner}
                sx={{ fontSize: '2rem' }}>
                <EditIcon fontSize="inherit"/>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={isAdminOrCleaner ? "Cannot Delete Admin or Cleaner roles" : "Delete"}><span>  
            <IconButton 
              color="error" 
              onClick={() => !isAdminOrCleaner && handleDelete(row)}
              disabled={isAdminOrCleaner}
              sx={{ fontSize: '2rem' }}>
              <DeleteIcon fontSize="inherit"/>
            </IconButton>
            </span>
          </Tooltip>
        </Box>
      );
    },
    muiTableHeadCellProps: {
      sx: {
        fontSize: '1.4rem',
        fontWeight: 'bold',
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
          Roles Management
        </Typography>
        
        {/* Group buttons together on the right */}
        <Box sx={{ display: 'flex', gap: 2 }}>
		  {/* Add more Buttons here */}
          <Button 
            variant="contained" 
            size="large"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ fontSize: '1.6rem', py: 1, px: 2 }} // Larger button
          >
            Add Role
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

      {/* Device Assignment Modal */}
      <Dialog
        open={deviceModalOpen}
        onClose={() => setDeviceModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: '1.8rem' }}>
          {selectedRoleForDevices && `Assign Devices to ${selectedRoleForDevices.role_name}`}
        </DialogTitle>
        <DialogContent>
          {selectedRoleForDevices && (
            <Box sx={{ 
              height: '380px', // Fixed height to accommodate about 4 devices
              overflow: 'auto'  // Enable scrolling
            }}>
              <List>
                {devices.map((device) => {
                  const isAssigned = roleDevices[selectedRoleForDevices.role_id]?.includes(device.device_id);
                  
                  return (
                    <ListItem key={device.device_id}>
                      <ListItemText 
                        primary={device.device_name} 
                        secondary={device.description}
                        primaryTypographyProps={{ fontSize: '1.4rem' }}
                        secondaryTypographyProps={{ fontSize: '1.2rem' }}
                      />
                      <ListItemSecondaryAction sx={{ width: '100px' }}>
                        <Switch
                          edge="end"
                          checked={isAssigned}
                          onChange={(e) => handleDeviceAssignment(
                            selectedRoleForDevices.role_id, 
                            device.device_id, 
                            e.target.checked
                          )}
                          color="primary"
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
                })}
                {devices.length === 0 && (
                  <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary', fontSize: '1.4rem' }}>
                    No devices available. Please create devices first.
                  </Typography>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeviceModalOpen(false)} 
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

export default RolesContent;
