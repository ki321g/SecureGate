import { Typography, Button, Stack } from '@mui/material'
import { SecurityOutlined } from '@mui/icons-material'

const styles = {
  stackRowContainer: {    
    mt: 0,
    alignItems: 'center'
  },
  stackColumnContainer: {
    mt: 0,
    alignItems: 'center'
  },
  securityIcon: {
    fontSize: 400,
    color: 'primary.main'
  },
  headerText: {
    mt: 0,
    fontSize: 200,
    alignItems: 'center',
    fontWeight: '900',
    color: 'primary.main'
  },
  subHeaderText: {
    mt: -3,
    fontSize: 70,
    color: 'text.secondary',
    alignItems: 'center',
    fontWeight: '700'
  }
}
const LogoComponent = () => {

return (
        <Stack direction="row" spacing={1} sx={ styles.stackRowContainer }>
            <SecurityOutlined sx={ styles.securityIcon } />
            <Stack direction="column" spacing={0} sx={ styles.stackColumnContainer }>
                <Typography variant="h1" component="h1" sx={ styles.headerText }>
                SecureGate
                </Typography>
                <Typography variant="h4" component="div" sx={ styles.subHeaderText }>
                IoT Security Access Management
                </Typography>
            </Stack>
        </Stack>
    )
}

export default LogoComponent
