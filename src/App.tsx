import { ThemeProvider, createTheme } from '@mui/material';
import ScenarioEditor from './components/Editor/ScenarioEditor';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <ScenarioEditor />
      </div>
    </ThemeProvider>
  );
}

export default App;
