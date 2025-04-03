import React, { useEffect, useState, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import { 
  Box, 
  Button, 
  Tooltip,
  useTheme,
  Chip
} from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import RefreshIcon from '@mui/icons-material/Refresh';

// API
import { deviceLogsApi } from '../../../api/supabase/supabaseApi';

const DeviceLogsContent = () => {
  const theme = useTheme();
  const [deviceLogs, setDeviceLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch device logs data
  useEffect(() => {
    let isMounted = true;

    const fetchDeviceLogsData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await deviceLogsApi.getAll();
        
        if (error) throw error;
        
        // Only update state if component is still mounted
        if (isMounted) {
          setDeviceLogs(data);
          console.log('DEVICE LOGS:', data);
        }
      } catch (error) {
        console.error('Error fetching DEVICE LOGS data:', error.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchDeviceLogsData();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to refresh logs
  const handleRefreshLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await deviceLogsApi.getAll();
      
      if (error) throw error;
      
      setDeviceLogs(data);
    } catch (error) {
      console.error('Error refreshing DEVICE LOGS data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status color based on status
  const getStatusColor = (status) => {
    return status === true ? 'success' : 'error';
  };

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'log_id',
        header: 'Log ID',
        enableColumnActions: false,
        enableClickToCopy: true,
        size: 200,
        Cell: ({ cell }) => {
          const fullId = cell.getValue();
          // Display 12 characters followed by ...
          const truncatedId = fullId ? `${fullId.substring(0, 12)}...` : '';
          
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
        accessorKey: 'devices',
        header: 'Device',
        enableClickToCopy: true,
        size: 200,
        Cell: ({ cell }) => {
          const device = cell.getValue();
          return (
            <Typography sx={{ fontSize: '1.2rem' }}>
              {device ? device.device_name : 'Unknown Device'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'users',
        header: 'User',
        enableClickToCopy: true,
        size: 200,
        Cell: ({ cell }) => {
          const user = cell.getValue();
          return (
            <Typography sx={{ fontSize: '1.2rem' }}>
              {user ? `${user.first_name} ${user.last_name}` : 'Unknown User'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'action',
        header: 'Action',
        enableClickToCopy: true,
        size: 100,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue() || 'No action'}
          </Typography>
        ),
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        enableClickToCopy: true,
        size: 350,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue() || 'No notes'}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableColumnActions: false,
        size: 120,
        Cell: ({ cell }) => {
          console.log('STATUS:', cell.getValue());
          const status = cell.getValue();
          const statusText = status === true ? 'SUCCESS' : 'ERROR';
          console.log('Status Text:', statusText);
          
          return (
            <Chip 
              size="medium" 
              label={statusText} 
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
        header: 'Timestamp',
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

  // Create the table instance using the hook
  const table = useMaterialReactTable({
    columns,
    data: deviceLogs || [],
    state: { isLoading },
    enableSorting: true,

    enableColumnActions: true, 
    enableColumnFilters: true,
    enableColumnOrdering: true,

    enableColumnFilterModes: true,
    enableColumnDragging: false,
    enableSortingRemoval: true,

    // No row actions or row selection
    enableRowActions: false,
    enableRowSelection: false,
    
    enablePagination: true,
    initialState: { 
      pagination: { 
        pageSize: 6,
        pageIndex: 0
      },
      sorting: [
        {
          id: 'created_at',
          desc: true // Sort by newest first
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
          fontSize: '1.8rem', // Larger font size for pagination items
        },
        '& .MuiSvgIcon-root': {
          fontSize: '2.8rem', // Larger icons for first/last/next/prev buttons
        }
      }
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
          overflowX: 'hidden'
        }
      }
    },
    muiTableContainerProps: {
      sx: {
        minWidth: '100%',
        overflowX: 'hidden'
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
          Device Logs
        </Typography>
        
        {/* Refresh button */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshLogs}
            sx={{ fontSize: '1.6rem', py: 1, px: 2 }} // Larger button
          >
            Refresh Logs
          </Button>
        </Box>
      </Box>
      
      {/* Use the table instance with the new API */}
      <MaterialReactTable table={table} />
    </Box>
  );
}

export default DeviceLogsContent;
