import React, { Suspense } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PoolIcon from '@mui/icons-material/Pool';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CreateIcon from '@mui/icons-material/Create';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupIcon from '@mui/icons-material/Group';

import PerformanceTracker from './components/performance/PerformanceTracker';
import MedalDisplay from './components/medals/MedalDisplay';
import TrainingPlanGenerator from './components/training/TrainingPlanGenerator';
import ActivePlanView from './components/training/ActivePlanView';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import { authApi } from './services/api';
import HealthDashboard from './components/health/HealthDashboard';
import TeamCommunication from './components/team/TeamCommunication';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Router configuration with future flags
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    !!localStorage.getItem('token')
  );
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Medals', icon: <EmojiEventsIcon />, path: '/medals' },
    { text: 'Performance', icon: <PoolIcon />, path: '/performance' },
    { text: 'Training', icon: <FitnessCenterIcon />, path: '/training' },
    { text: 'New Training', icon: <CreateIcon />, path: '/training/new' },
    { text: 'Team', icon: <GroupIcon />, path: '/team' }
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {!isAuthenticated ? (
          <ListItem button component={Link} to="/login">
            <ListItemIcon><LoginIcon /></ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        ) : (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed">
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                  Swimmer Performance Tracker
                </Typography>
              </Toolbar>
            </AppBar>
            <Box
              component="nav"
              sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
            >
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true,
                }}
                sx={{
                  display: { xs: 'block', sm: 'none' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
              >
                {drawer}
              </Drawer>
              <Drawer
                variant="permanent"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
                open
              >
                {drawer}
              </Drawer>
            </Box>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - 240px)` },
                mt: 8
              }}
            >
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/medals" element={<MedalDisplay />} />
                  <Route path="/performance" element={<PerformanceTracker />} />
                  <Route path="/training" element={<ActivePlanView />} />
                  <Route path="/training/new" element={<TrainingPlanGenerator />} />
                  <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
                  <Route path="/register" element={<Register setAuth={setIsAuthenticated} />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/health" element={<HealthDashboard />} />
                  <Route path="/team" element={<TeamCommunication />} />
                </Routes>
              </Suspense>
            </Box>
          </Box>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
