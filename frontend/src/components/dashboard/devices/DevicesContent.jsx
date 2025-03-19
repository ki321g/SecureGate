import React, { useState, useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const DevicesContent = () => {
  const theme = useTheme();
  
  // Sample data - replace with your actual data fetching logic
  const [devices, setDevices] = useState([
    {
      id: '1',
      name: 'Front Door Lock',
      type: 'Smart Lock',
      lastSeen: '2023-09-15T14:30:00',
      location: 'Main Entrance',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Back Door Sensor',
      type: 'Motion Sensor',
      lastSeen: '2023-09-14T09:45:00',
      location: 'Rear Exit',
      status: 'Inactive'
    },
    {
      id: '3',
      name: 'Garage Gate',
      type: 'Smart Gate',
      lastSeen: '2023-09-15T16:20:00',
      location: 'Garage',
      status: 'Active'
    },
    {
      id: '4',
      name: 'Window Sensor',
      type: 'Contact Sensor',
      lastSeen: '2023-09-15T12:10:00',
      location: 'Living Room',
      status: 'Active',
    },
    {
      id: '5',
      name: 'Office Door',
      type: 'Smart Lock',
      lastSeen: '2023-09-15T15:45:00',
      location: 'Office',
      status: 'Active',
    },
  ]);

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Device Name',
        size: 200,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 150,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'lastSeen',
        header: 'Last Seen',
        size: 200,
        Cell: ({ cell }) => {
          const date = new Date(cell.getValue());
          return (
            <Typography sx={{ fontSize: '1.2rem' }}>
              {date.toLocaleString()}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        size: 150,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={{
              backgroundColor: cell.getValue() === 'Active' ? 'success.light' : 'error.light',
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

  // Handle actions
  const handleAddDevice = () => {
    // Implement your add device logic here
    console.log('Add device clicked');
  };

  const handleEditDevice = (row) => {
    // Implement your edit device logic here
    console.log('Edit device:', row.original);
  };

  const handleDeleteDevice = (row) => {
    // Implement your delete device logic here
    console.log('Delete device:', row.original);
    
    // Example of removing from state
    setDevices(devices.filter(device => device.id !== row.original.id));
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
          Device Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddDevice}
          sx={{ fontSize: '1.1rem', py: 1, px: 2 }} // Larger button
        >
          Add Device
        </Button>
      </Box>
      
      <MaterialReactTable
        columns={columns}
        data={devices}
        enableColumnFilters
        enableColumnOrdering
        enableSorting
        enableRowSelection
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: '12px' }}> {/* Increased gap */}
            <Tooltip title="Edit">
              <IconButton 
                onClick={() => handleEditDevice(row)}
                sx={{ fontSize: '2rem' }} // Larger icon button
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                color="error" 
                onClick={() => handleDeleteDevice(row)}
                sx={{ fontSize: '2rem' }} // Larger icon button
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        initialState={{
          density: 'spacious', // Change from 'compact' to 'spacious' for larger rows
          pagination: { pageSize: 10, pageIndex: 0 },
        }}
        muiTablePaginationProps={{
          rowsPerPageOptions: [5, 10, 20],
          showFirstButton: false,
          showLastButton: false,
          sx: { 
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-select': {
              fontSize: '1.8rem' // Larger pagination text
            }
          }
        }}
        muiTableHeadCellProps={{
          sx: {
            fontSize: '1.4rem', // Larger header font
            fontWeight: 'bold',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)'
          }
        }}
        muiTableProps={{
          sx: {
            '& .MuiTableCell-root': {
              padding: '16px', // More padding in cells
            },
          }
        }}
        muiTableBodyCellProps={{
          sx: {
            fontSize: '1.2rem', // Larger body cell font
          }
        }}
      />
    </Box>
  );
};

export default DevicesContent;
