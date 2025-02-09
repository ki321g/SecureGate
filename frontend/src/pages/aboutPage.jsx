import React, { useContext, useEffect, useState } from 'react'
import { Box, Typography, Container, Button } from '@mui/material'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Card,
  CardContent,
  Grid,
  ListItem,
  IconButton,
  CircularProgress
} from '@mui/material'

import { ArrowBack } from '@mui/icons-material'
import { DeleteOutline } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { userContext } from '../contexts/userContext'
import supabase from '../api/supabase/supabase'
import { usersApi } from '../api/supabase/supabaseApi'

const AboutPage = () => {
  const navigate = useNavigate()
  const { user, setUser } = useContext(userContext)
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // useEffect(() => {
  //   // const fetchData = async () => {
  //   //   // const { data, error } = await supabase
  //   //   //   .from('roles')
  //   //   //   .select('*')
  //   //   const { data: users, error } = await usersApi.getAll()
      
  //   //   if (error) {
  //   //     console.log('Error fetching data:', error)
  //   //   } else {
  //   //     console.log('MyTestTable data:', data)
  //   //   }
  //   // }
  //   const fetchData = async () => {
  //     try {
  //       const { data, error } = await usersApi.getAll()
  //       console.log(data)
  //       if (error) throw error
  //       setUser(data[0])
  //       setData(data)
  //       return data
  //     } catch (error) {
  //       console.error('Error fetching data:', error.message)
  //       throw error
  //     }
  //   }

  //   fetchData()
  // }, [])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await usersApi.getAll()
        if (error) throw error
        setData(data)
      } catch (error) {
        console.error('Error fetching data:', error.message)
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchData()
  }, [])

  const handleDelete = async (uid) => {
    try {
      const { error } = await usersApi.delete(uid)
      if (error) throw error
      
      // Update local state by filtering out the deleted user
      setData(data.filter(item => item.uid !== uid))
      
    } catch (error) {
      console.error('Error deleting user:', error.message)
    }
  }

  return (
    <Box>
    {isLoading ? (
      <CircularProgress />
    ) : (
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
            About
          </Typography>
          <Typography variant="body1" color="text.secondary" component="p">
            Welcome, {user.first_name} {user.last_name}!
          </Typography>
          <Typography variant="body1" color="text.secondary" component="p">
            Your email is {user.email}.
          </Typography>
        </Box>
        {/* Table Display Example */}
        <Box sx={{ 
          p: 4, // padding
          m: 2, // margin
          border: '0px solid',
          borderColor: 'grey.300',
          bgcolor: 'background.paper',
        }}>

        

          <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>UID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
             

              {data.length > 0 ? (
        data.map((item) => (
          <TableRow key={item.uid}>
            <TableCell>{item.uid}</TableCell>
            <TableCell>{item.first_name} {item.last_name}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell>
              <IconButton 
                color="error"
                onClick={() => handleDelete(item.uid)}
                size="small"
              >
                <DeleteOutline />
              </IconButton>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={4} align="center">
            <Typography variant="body1">No users found</Typography>
          </TableCell>
        </TableRow>
      )}
            </TableBody>
          </Table>
          </TableContainer>          
     
        </Box>
    
        {/* Card Grid Display Example */}
        
        <Box sx={{ 
          p: 4, // padding
          m: 2, // margin
          border: '0px solid',
          borderColor: 'grey.300',
          bgcolor: 'background.paper',
        }}>
          <Grid container spacing={3}>
            {data.map((item) => (
              // <ListItem key={item.uid}>
              <Grid key={item.uid} item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">{item.first_name} {item.last_name}</Typography>
                    <Typography color="textSecondary">{item.email}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              // </ListItem>
            ))}
          </Grid>
        </Box>

      </Container>
    </Box>
     )}
     </Box>
  )
}

export default AboutPage
