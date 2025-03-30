import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup, 
  ToggleButton
} from '@mui/material';
// import { MaterialReactTable } from 'material-react-table';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import AddUserComponent from './AddUserComponent';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

// Contexts
import { useData } from '../../../contexts/dataContext';

// API
import { usersApi, rolesApi, devicesApi, roleToDeviceApi } from '../../../api/supabase/supabaseApi';

// API key and base URL from environment variables
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

// Import default user image
import { defaultUserImage } from './defaultUserImage';

const UsersContent = () => {
  const theme = useTheme();
	const { users, setUsers } = useData();
  const { roles, setRoles } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedUserForImage, setSelectedUserForImage] = useState(null);
  const [isCardReading, setIsCardReading] = useState(false);
  const [cardReadingInterval, setCardReadingInterval] = useState(null);

  const [showAddUserForm, setShowAddUserForm] = useState(false);


  
  // Modal State  
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: null, // 'add', 'edit' or 'delete'
    selectedUser: null,
    formData: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone_number: '',
      role_id: '',
      card_id: '',
      user_picture: null,
      status: '',
    }
  });

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await usersApi.getAll();
        
        if (error) throw error;
        
        // Only update state if component is still mounted
        if (isMounted) {
          setUsers(data);
          console.log('USERS:', data);
        }
      } catch (error) {
        console.error('Error fetching USERS data:', error.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchUserData();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [setUsers]);

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

  // clean up the interval when the component unmounts
  useEffect(() => {
    return () => {
      if (cardReadingInterval) {
        clearInterval(cardReadingInterval);
      }
    };
  }, [cardReadingInterval]);
  

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'uid',
        header: 'UID',
        enableClickToCopy: true,
        size: 50,
        Cell: ({ cell }) => {
          const fullId = cell.getValue();
          // Display 15 characters followed by ...
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
        accessorKey: 'first_name',
        header: 'First Name',
        enableClickToCopy: true,
        size: 30,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'last_name',
        header: 'Last Name',
        enableClickToCopy: true,
        size: 30,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableClickToCopy: true,
        size: 30,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'password',
        header: 'Password',
        enableClickToCopy: true,
        size: 30,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'phone_number',
        header: 'Phone#',
        enableClickToCopy: true,
        size: 30,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      // {
      //   accessorKey: 'role_id',
      //   header: 'Role ID',
      //   enableClickToCopy: true,
      //   size: 50,
      //   Cell: ({ cell }) => {
      //     const fullId = cell.getValue();
      //     // Display 15 characters followed by ...
      //     const truncatedId = fullId ? `${fullId.substring(0, 10)}...` : '';
          
      //     return (
      //       <Tooltip title={fullId}>
      //         <Typography sx={{ fontSize: '1.2rem' }}>
      //           {truncatedId}
      //         </Typography>
      //       </Tooltip>
      //     );
      //   },
      // },
      {
        accessorKey: 'role_id',
        header: 'Role',  // Changed from 'Role ID' to 'Role'
        enableClickToCopy: true,
        size: 50,
        Cell: ({ cell, row }) => {
          const roleId = cell.getValue();
          // Find the role object that matches the role_id
          const role = roles.find(r => r.role_id === roleId);
          // Get the role name, or display the ID if role not found
          const roleName = role ? role.role_name : roleId;
          
          return (
            <Tooltip title={roleId}>
              <Typography sx={{ fontSize: '1.2rem' }}>
                {roleName}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: 'card_id',
        header: 'Card ID',
        enableClickToCopy: true,
        size: 30,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
     

      {
        accessorKey: 'user_picture',
        header: 'Picture',
        enableClickToCopy: false,
        size: 80,
        Cell: ({ cell, row }) => {
          const base64Image = cell.getValue();
          
          return (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                height: '60px',
                width: '60px',
                margin: '0 auto',
                cursor: 'pointer' // Add cursor pointer to indicate it's clickable
              }}
              onClick={() => {
                if (base64Image) {
                  setSelectedUserForImage(row.original);
                  setImageModalOpen(true);
                }
              }}
            >
              <img 
                src={base64Image} 
                alt="User"
                style={{ 
                  maxHeight: '100%', 
                  maxWidth: '100%', 
                  borderRadius: '10%',
                  objectFit: 'cover',
                  border: '1px solid #ddd'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultUserImage;
                }}
              />
            </Box>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableColumnActions: false,
        size: 80,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={{
              backgroundColor: cell.getValue() === 'Active' 
                ? 'success.light' 
                : cell.getValue() === 'Disabled'
                  ? 'warning.light'  // Yellow color for Disabled
                  : 'error.light',   // Red color for other values (like 'InActive')
              borderRadius: '4px',
              color: '#fff',
              maxWidth: '9ch',
              p: '0.35rem 0.6rem', // Slightly larger padding
              fontSize: '1.4rem', // Larger font size
            }}
          >
            {cell.getValue()}
          </Box>
        ),
      },
    ],
    []
  );
  
  // Handle add
  const handleAdd = () => {
    // setModalState({
    //   isOpen: true,
    //   mode: 'add',
    //   selectedUser: null,
    //   formData: {
    //     first_name: '',
    //     last_name: '',
    //     email: '',
    //     password: '',
    //     phone_number: '',
    //     role_id: '',
    //     card_id: '',
    //     user_picture: null,
    //     status: 'Active',
    //   }
    // });
    
    setModalState({
      isOpen: true,
      mode: 'add',
      selectedUser: null,
      formData: {} // We don't need this anymore as the form data is managed in the AddUserComponent
    });
    
    
  };

  const handleUserAdded = (newUser) => {
    // Close the modal
    handleCloseModal();
  };

  

  // Handle edit
  const handleEdit = (row) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      selectedUser: row.original,
      formData: {
        first_name: row.original.first_name,
        last_name: row.original.last_name,
        email: row.original.email,
        password: row.original.password,
        phone_number: row.original.phone_number,
        role_id: row.original.role_id,
        card_id: row.original.card_id,
        user_picture: row.original.user_picture,
        status: row.original.status,
      }
    });
  };

  // Handle delete
  const handleDelete = (row) => {
    setModalState({
      isOpen: true,
      mode: 'delete',
      selectedUser: row.original,
      formData: {} // Not needed for delete
    });
  };

  // Close modal
  const handleCloseModal = () => {
    stopCardReading();
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // Handle input change for edit form
  const handleInputChange = (e) => {
    if(isCardReading){
      stopCardReading();
    }
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
      const { error } = await usersApi.update(
        modalState.selectedUser.uid, 
        modalState.formData
      );
      
      if (error) throw error;
    
      const updatedUsers = users.map(user => 
        user.uid === modalState.selectedUser.uid 
          ? { ...user, ...modalState.formData } 
          : user
      );
      
      setUsers(updatedUsers);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating user:', error.message);
    }
  };

  // Create new role
  const handleCreate = async () => {
    try {
      // Check if user_picture is null and set default image if needed
      const formDataToSubmit = { ...modalState.formData };
      
      if (!formDataToSubmit.user_picture) {
        formDataToSubmit.user_picture = defaultUserImage;
      }
      
      const { data, error } = await usersApi.create(formDataToSubmit);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the new role to the roles array
        setUsers([...users, data[0]]);
        handleCloseModal();
      } else {
        throw new Error('No data returned from create operation');
      }
    } catch (error) {
      console.error('Error creating user:', error.message);
    }
  };
  


  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    try {
      const { error } = await usersApi.delete(modalState.selectedUser.uid);
      
      if (error) throw error;
      
      const updatedUsers = users.filter(
        user => user.uid !== modalState.selectedUser.uid
      );
      setUsers(updatedUsers);
      
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
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
      
      console.log(response);
      if (response.data) {
        // Update the form data with the card UID
        setModalState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            card_id: response.data.card_uid
          }
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
  

   
  // Render modal content based on mode
  const renderModalContent = () => {
    const { mode, selectedUser, formData } = modalState;

    if (mode === 'add') {
      return (
        <>
        <AddUserComponent 
          onUserAdded={handleUserAdded} 
          onCancel={handleCloseModal} 
        />
        </>
      );
    }

    if (mode === 'edit' && selectedUser) {
      return (
        <>
          <DialogTitle sx={{ fontSize: '1.8rem' }}>
            Edit User
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="User ID"
                  value={selectedUser.uid}
                  disabled
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid>
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
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="role-select-edit-label" sx={{ fontSize: '1.4rem' }}>Role</InputLabel>
                  <Select
                    labelId="role-select-edit-label"
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
              {/* <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Card UID"
                  name="card_id"
                  value={formData.card_id}
                  onChange={handleInputChange}
                  sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
                />
              </Grid> */}
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    // fullWidth
                    label="Card UID"
                    name="card_id"
                    value={formData.card_id}
                    onChange={handleInputChange}
                    sx={{ '& .MuiInputBase-input': { fontSize: '1.4rem' } }}
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

              <Grid item xs={12}>
                <ToggleButtonGroup
                  value={formData.status || 'Active'}
                  exclusive
                  onChange={(e, newStatus) => {
                    // Only update if a button is selected
                    if (newStatus !== null) {
                      setModalState(prev => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          status: newStatus
                        }
                      }));
                    }
                  }}
                  aria-label="user status"
                  fullWidth
                >
                  <ToggleButton 
                    value="Active" 
                    aria-label="active"
                    sx={{ 
                      fontSize: '1.2rem',
                      '&.Mui-selected': { 
                        backgroundColor: 'success.light', 
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'success.main',
                        }
                      }
                    }}
                  >
                    Active
                  </ToggleButton>
                  <ToggleButton 
                    value="InActive" 
                    aria-label="inactive"
                    sx={{ 
                      fontSize: '1.2rem',
                      '&.Mui-selected': { 
                        backgroundColor: 'error.light', 
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'error.main',
                        }
                      }
                    }}
                  >
                    InActive
                  </ToggleButton>
                  <ToggleButton 
                    value="Disabled" 
                    aria-label="disabled"
                    sx={{ 
                      fontSize: '1.2rem',
                      '&.Mui-selected': { 
                        backgroundColor: 'warning.light', 
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'warning.main',
                        }
                      }
                    }}
                  >
                    Disabled
                  </ToggleButton>
                </ToggleButtonGroup>
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
    
    
    // Delete mode remains the same
    if (mode === 'delete' && selectedUser) {
      return (
        <>
          <DialogTitle sx={{ fontSize: '1.8rem' }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: '1.4rem' }}>
              Are you sure you want to delete the user "{selectedUser.first_name} {selectedUser.last_name}"? 
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
    data: users || [],
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
        pageSize: 6,
        pageIndex: 0
      },
      columnVisibility: {
        // Set to false for columns you want to hide
        uid: false,
        password: false,
        email: false,
        phone_number: false,
      },
      sorting: [
        {
          id: 'last_name',
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
    renderRowActions: ({ row }) => (
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
    ),
    muiTableHeadCellProps: {
      sx: {
        fontSize: '1.4rem',
        fontWeight: 'bold',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)'
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
          Users Management
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
            Add User
          </Button>
        </Box>
      </Box>

      {/* {showAddUserForm && (
        <AddUserForm 
          onComplete={() => setShowAddUserForm(false)} 
          onCancel={handleCancelAddUser} 
        />
      )} */}

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

      {/* Image Modal */}
{/* <Dialog
  open={imageModalOpen}
  onClose={() => setImageModalOpen(false)}
  maxWidth="md"
>
  <DialogTitle sx={{ fontSize: '1.8rem' }}>
    {selectedUserForImage && `${selectedUserForImage.first_name} ${selectedUserForImage.last_name}`}
  </DialogTitle>
  <DialogContent sx={{ p: 1 }}>
    {selectedUserForImage && selectedUserForImage.user_picture && (
      <img
        src={selectedUserForImage.user_picture}
        alt={`${selectedUserForImage.first_name} ${selectedUserForImage.last_name}`}
        style={{
          maxWidth: '100%',
          maxHeight: '70vh', // Limit height to 70% of viewport height
          display: 'block',
          margin: '0 auto',
        }}
      />
    )}
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setImageModalOpen(false)} 
      variant="contained"
      sx={{ fontSize: '1.2rem' }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog> */}

{/* Image Modal */}
<Dialog
  open={imageModalOpen}
  onClose={() => setImageModalOpen(false)}
  maxWidth="md" // Keep this to set the maximum width category
  // Add this to force a specific width
  PaperProps={{
    sx: {
      width: '600px', // Set a fixed width
      height: '600px', // Set a fixed height
      maxHeight: '80vh', // Limit maximum height to 80% of viewport height
    }
  }}
>
  <DialogTitle sx={{ fontSize: '1.8rem' }}>
    {selectedUserForImage && `${selectedUserForImage.first_name} ${selectedUserForImage.last_name}`}
  </DialogTitle>
  <DialogContent 
    sx={{ 
      p: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '450px' // Fixed height for the content area
    }}
  >
    {selectedUserForImage && selectedUserForImage.user_picture && (
      <img
        src={selectedUserForImage.user_picture}
        alt={`${selectedUserForImage.first_name} ${selectedUserForImage.last_name}`}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain', // This ensures the image maintains its aspect ratio
          display: 'block',
        }}
      />
    )}
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setImageModalOpen(false)} 
      variant="contained"
      sx={{ fontSize: '1.2rem' }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>


    </Box>
  );
}

export default UsersContent;
