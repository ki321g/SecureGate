import React, { useContext } from 'react'
import { Box, Typography, Container, Button, Stack } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { userContext } from '../contexts/userContext'
import { deviceContext } from '../contexts/deviceContext'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, setUser } = useContext(userContext)
  const { devices, setDevices } = useContext(deviceContext)

  const handleUserClick = () => {
    const newUser = {
      uid: '123456',
      first_name: 'Daniel',
      last_name: 'George',
      email: 'd@g.com',
      phone_number: '987654321',
      role_id: '6589545',
      card_uid: '99966633',
      user_picture: null,
      last_seen_at: '2021-11-31T16:02:00.000Z',
      created_at: '2021-11-01T00:00:00.000Z',
    }
    setUser(newUser)
  }

  const handleDeviceClick = () => {
    const newDevice = {
      deviceid: '33226655',
      device_name: 'Keyboard',
      description: 'Black full size keyboard',
      created_at: '2021-02-02T22:12:12.000Z',
    }    
    setDevices([...devices, newDevice])
  }

  const handleRemoveDevice = (deviceId) => {
    setDevices(devices.filter(device => device.deviceid !== deviceId))
  }


  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        minWidth: '100vw',
        alignItems: 'center',
        justifyContent: 'center',        
        bgcolor: 'background.paper',
        margin: 0,
        padding: 0,
        position: 'relative'
      }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: 20,
          left: 20
        }}
      >
        Back to Home
      </Button>
      <Container maxWidth={false} disableGutters>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 4,
            py: 8,
            width: '100%'
          }}
        >
          <Typography variant="h2" color="text.primary" component="h1" fontWeight="bold">
            Dashboard
          </Typography>
          <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
            <Button variant="contained" onClick={handleUserClick}>
              Update User
            </Button>
            <Button variant="contained" onClick={handleDeviceClick}>
              Update Device
            </Button>
          </Stack>
          <Typography variant="body1" color="text.secondary" component="p">
            firstName: {user.first_name}
            <br></br>
            lastName: {user.last_name}
            <br></br>
            email: {user.email}.
            <br></br>
            phoneNumber: {user.phone_number}.
          <br></br>
            roleID: {user.role_id}.
            <br></br>
            cardUID: {user.card_uid}.
            </Typography>

          {/* // Update the date display sections in the return statement: */}
          <Typography variant="body1" color="text.secondary" component="p">
            lastSeenAt: {dayjs(user.last_seen_at).format('MMM D, YYYY h:mm A [GMT]')}
            <br></br>
            lastSeenAt:  {dayjs(user.last_seen_at).format('MMMM D, YYYY h:mm:ss A [GMT]')}
            <br></br>
            createdAt  {dayjs(user.created_at).format('MMM D, YYYY h:mm:ss A [GMT]')}
            <br></br>
            createdAt {dayjs(user.created_at).format('MMMM D, YYYY')}
            <br></br>
            createdAt {dayjs(user.created_at).format('h:mm A [GMT]')}
          </Typography>

          {/* Update the devices display sections in the return statement: */}
          <Typography variant="h4" color="text.secondary" component="h2">
            Devices
          </Typography>
          {devices.map((device) => (
            <Box key={device.deviceid} sx={{ mb: 0 }}>
              <Typography variant="body1" color="text.secondary" component="p">
                Device Name: {device.device_name}
                <br />
                Description: {device.description}
                <br />
                Created At: {dayjs(device.created_at).format('MMM D, YYYY h:mm:ss A [GMT]')}
              </Typography>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => handleRemoveDevice(device.deviceid)}
                sx={{ mt: 1 }}
              >
                Remove Device
              </Button>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default DashboardPage
