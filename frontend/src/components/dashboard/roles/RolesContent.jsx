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
  Grid
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';


import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

// Contexts
import { useData } from '../../../contexts/dataContext';
// API
import { rolesApi, devicesApi, roleToDeviceApi } from '../../../api/supabase/supabaseApi';

const RolesContent = () => {
  const theme = useTheme();
  const { roles, setRoles } = useData();
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'role_id',
        header: 'UID',
        enableClickToCopy: true,
        size: 240,
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
        size: 360,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Create Date',
        enableClickToCopy: true,
        size: 180,
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
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ fontSize: '1.1rem', py: 1, px: 2 }} // Larger button
        >
          Add Role
        </Button>
      </Box>
      
      <MaterialReactTable
        columns={columns}
        data={roles || []}
        state={{ isLoading }}
        enableColumnFilters
        enableColumnOrdering
        enableSorting
        enableRowSelection
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: '2px' }}>
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
        )}     
        muiTableHeadCellProps={{
          sx: {
            fontSize: '1.4rem', // Larger header font
            fontWeight: 'bold',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)'
          }
        }}
      />

      {/* Modal */}
      <Dialog 
        open={modalState.isOpen} 
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
      >
        {renderModalContent()}
      </Dialog>

    </Box>
  );
}

export default RolesContent;
