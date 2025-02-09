import { Button, Stack } from '@mui/material'
import { SecurityOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const styles = {
  stackContainer: {
    mt: 4,
    justifyContent: 'center'
  }
}
const TempButtonsComponent = () => {
  const navigate = useNavigate()

return (
    <>
      <Stack direction="row" spacing={3} sx={ styles.stackContainer }>
        <Button variant="contained" size="large" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
        <Button variant="outlined" size="large" onClick={() => navigate('/about')}>
          Learn More
        </Button>
        <Button variant="contained" size="large" onClick={() => navigate('/camera')}>
          Camera
        </Button>
      </Stack>
    </>
  )
}

export default TempButtonsComponent
