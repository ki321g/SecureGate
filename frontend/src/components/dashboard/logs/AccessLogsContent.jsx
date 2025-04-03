import React, { useEffect, useState, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import { 
  Box, 
  Button, 
  IconButton, 
  Tooltip,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import RefreshIcon from '@mui/icons-material/Refresh';

// API
import { accessLogsApi } from '../../../api/supabase/supabaseApi';

// Import default user image
import { defaultUserImage } from '../users/defaultUserImage';

const AccessLogsContent = () => {
  const theme = useTheme();
  const [accessLogs, setAccessLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedUserForImage, setSelectedUserForImage] = useState(null);

  // Fetch access logs data
  useEffect(() => {
    let isMounted = true;

    const fetchAccessLogsData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await accessLogsApi.getAll();
        
        if (error) throw error;
        
        // Only update state if component is still mounted
        if (isMounted) {
          setAccessLogs(data);
          console.log('ACCESS LOGS:', data);
        }
      } catch (error) {
        console.error('Error fetching ACCESS LOGS data:', error.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchAccessLogsData();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to refresh logs
  const handleRefreshLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await accessLogsApi.getAll();
      
      if (error) throw error;
      
      setAccessLogs(data);
    } catch (error) {
      console.error('Error refreshing ACCESS LOGS data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status color based on access status
  const getStatusColor = (success) => {
    return success ? 'success' : 'error';
  };

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'log_id',
        header: 'Log ID',
        enableColumnActions: false,
        enableClickToCopy: true,
        size: 240,
        Cell: ({ cell }) => {
          const fullId = cell.getValue();
          // Display 10 characters followed by ...
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
        accessorKey: 'user_picture',
        header: 'Picture',
        enableClickToCopy: false,
        size: 80,
        Cell: ({ cell, row }) => {
          const base64Image = cell.getValue();
          const user = row.original.users;
          
          return (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                height: '60px',
                width: '60px',
                margin: '0 auto',
                cursor: 'pointer' 
              }}
              onClick={() => {
                if (base64Image) {
                  setSelectedUserForImage({
                    user_picture: base64Image,
                    first_name: user?.first_name || 'Unknown',
                    last_name: user?.last_name || 'User'
                  });
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
        accessorKey: 'users',
        header: 'Name',
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
        accessorKey: 'notes',
        header: 'Comments',
        enableClickToCopy: true,
        size: 390,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: '1.2rem' }}>
            {cell.getValue() || 'No notes'}
          </Typography>
        ),
      },
      {
        accessorKey: 'success',
        header: 'Access',
        enableColumnActions: false,
        size: 120,
        Cell: ({ cell }) => {
          const success = cell.getValue();
          const status = success ? 'GRANTED' : 'DENIED';
          
          return (
            <Chip 
              size="medium" 
              label={status} 
              color={getStatusColor(success)}
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
    data: accessLogs || [],
    state: { isLoading },
    enableSorting: true,

    enableColumnActions: true, 
    enableColumnFilters: true,
    enableColumnOrdering: true,

    enableColumnFilterModes: true,
    enableColumnDragging: false,
    enableSortingRemoval: true,

    // No row actions or row selection since you specified not to include them
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
          Access Logs
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

      {/* Image Modal */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            width: '600px',
            height: '600px',
            maxHeight: '80vh',
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
            height: '450px'
          }}
        >
          {selectedUserForImage && selectedUserForImage.user_picture && (
            <img
              src={selectedUserForImage.user_picture}
              alt={`${selectedUserForImage.first_name} ${selectedUserForImage.last_name}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultUserImage;
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

export default AccessLogsContent;
