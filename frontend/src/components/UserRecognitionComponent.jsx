import React, { useState, useContext } from 'react';
import { Avatar, Box, Button, Typography, Table, TableBody, TableRow, TableCell, Input } from '@mui/material';


// Context
import { userContext } from '../contexts/userContext'

const styles = {
    contentWrapper: {
        width: '90%',
        height: '91.5%',
        backgroundColor: '#f5f5f5',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center'
    },    
    table: {
        maxWidth: '800px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        '& .MuiTableCell-root': {
            fontSize: '1.2rem',
            padding: '16px',
            borderBottom: 'none',
            color: '#000000',
            verticalAlign: 'middle'
        }
    },
    userAvatar: {
        width: 180,
        height: 180,
        border: '3px solid #fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    // infoCell: {
    //     gap: '32px',
    //     '& > *': {
    //         textAlign: 'center'
    //     },
    //     '& .MuiTypography-root': {
    //         '&:first-of-type': {
    //             fontSize: '1.6rem',
    //         },
    //         '&:last-of-type': {
    //             fontSize: '1.4rem'
    //         }
    //     }
    // },
    infoCell: {
        gap: '32px',
        textAlign: 'center',
        fontWeight: 900,
        fontFamily: "'Montserrat', sans-serif",
        '& > *': {
            textAlign: 'center',
            fontWeight: 900,
            fontFamily: "'Montserrat', sans-serif",
        }
    },
    idRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        width: '100%',
        '& > span': {
            textAlign: 'center'
        }
    },
    input: {
        width: '100%',
        maxWidth: '800px',
        paddingY: '64px',
        fontSize: '2.4rem',
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: '#f8f8f8',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        textTransform: 'uppercase',
        textColor: '#ffffff !important',
        fontFamily: "'Montserrat', sans-serif",
        '&.Mui-disabled': {
            WebkitTextFillColor: '#ffffff',
            backgroundColor: props => props.color,
            cursor: 'not-allowed'
        },
        '& input': {
            textAlign: 'center',
            textColor: '#ffffff !important',
            fontWeight: 900,
            textTransform: 'uppercase',
            fontFamily: "'Montserrat', sans-serif"
        }
    },    
    names: {
        fontFamily: "'Montserrat', sans-serif",
        fontSize: '2.4rem', 
        fontWeight: '600', 
        border: 'none' 
    },
	toggleButton: {
		position: 'absolute',
		padding: 2,
		margin: 2,
		borderRadius: '6px',
		top: 10,
		right: 10,
		zIndex: 10, // Higher z-index than the webcam
	},
};

const UserRecognitionComponent = ({ setActiveComponent, status }) => {
    const { user, setUser } = useContext(userContext)
    // const [status, setStatus] = useState({
    //     text: 'READY',
    //     color: '#4CAF50'
    // });

    const toggleStatus = () => {
        if (status.text === 'READY') {
            setStatus({ text: 'PROCESSING', color: '#FFC107' });
        } else if (status.text === 'PROCESSING') {
            setStatus({ text: 'COMPLETE', color: '#2196F3' });
        } else {
            setStatus({ text: 'READY', color: '#4CAF50' });
        }
    };

    return (
        <Box sx={styles.contentWrapper}>
            <Box sx={styles.content}>
                <Typography variant="h1" sx={{ fontSize: '3rem' }}>
                    USER DETAILS
                </Typography>

                <Table sx={styles.table}>
                    <TableBody>
                        <TableRow>
                            <TableCell rowSpan={4} sx={{ width: '140px', border: 'none' }}>
                                <Avatar
                                    src={user.user_picture}
                                    sx={styles.userAvatar}
                                />
                            </TableCell>
                            <TableCell rowSpan={4} sx={styles.infoCell}>
                                <Typography sx={ styles.names }>
                                    {user.first_name} <br /> {user.last_name}
                                </Typography>
                            </TableCell>
                            {/* <TableCell sx={styles.infoCell}>
                                <Typography >
                                    firstName@lastName.com
                                </Typography>
                            </TableCell> */}
                            {/* <TableCell sx={styles.infoCell}>
                                <Typography>
                                    Card UID: 123456789
                                </Typography>
                            </TableCell> */}
                        </TableRow>
                        {/* <TableRow>
                            <TableCell rowSpan={4} sx={styles.infoCell}>
                                <Typography>
                                    Card UID: 123456789
                                </Typography>
                            </TableCell>
                        </TableRow> */}
                    </TableBody>
                </Table>

                <Input
                    disableUnderline
                    disabled
                    value={status.text}
                    sx={{ ...styles.input, backgroundColor: status.color }}
                    onClick={toggleStatus}
                />
            </Box>
            {/* <Button 
                variant="contained" 
                onClick={toggleStatus}
                sx={{ ...styles.toggleButton, marginTop: '2px' }}
            >
                Toggle Status
            </Button> */}
        </Box>
    );
};

export default UserRecognitionComponent;
