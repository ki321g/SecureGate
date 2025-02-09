// import type { PaletteMode } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const GREY = {
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#212B36",
  900: "#161C24",
  1000: "#373737",
};

const PRIMARY = {
  light: "#B8B8B8",
  main: "#141414",
  dark: "#0E0A0A",
};

const COMMON = {
  common: { black: "#000", white: "#fff" },
  primary: { ...PRIMARY, contrastText: "#fff" },
  grey: GREY,
  action: {
    active: GREY[500],
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
  // typography: {
  //   fontFamily: '"Source Sans Pro", Arial, sans-serif',
  // },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight:900,
    },
    h2: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 500,
    },
  },
};

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#b6e3ff',
      dark: '#648dae',
      contrastText: '#000000'
    },
    secondary: {
      main: '#f48fb1',
      light: '#ffc1e3',
      dark: '#bf5f82',
      contrastText: '#000000'
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
      dark: '#0a0a0a',
      light: '#2d2d2d'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#6b6b6b',
      hint: '#9e9e9e'
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d'
    },
    warning: {
      main: '#ffa726',
      light: '#ffb74d',
      dark: '#f57c00'
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#388e3c'
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1'
    }
  },
})

const palette = {
  ...darkTheme,
  ...COMMON
};

export default palette;