import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import PoolIcon from '@mui/icons-material/Pool';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EventIcon from '@mui/icons-material/Event';
import axios from 'axios';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    recentPerformances: [],
    upcomingEvents: [],
    medalsSummary: {},
    trainingProgress: {},
    finaPoints: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch all required data in parallel
        const [
          performancesRes,
          eventsRes,
          medalsRes,
          trainingRes,
          finaRes
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/performance/recent`, { headers }),
          axios.get(`${process.env.REACT_APP_API_URL}/events/upcoming`, { headers }),
          axios.get(`${process.env.REACT_APP_API_URL}/medal/summary`, { headers }),
          axios.get(`${process.env.REACT_APP_API_URL}/training/progress`, { headers }),
          axios.get(`${process.env.REACT_APP_API_URL}/performance/fina-points`, { headers })
        ]);

        setDashboardData({
          recentPerformances: performancesRes.data,
          upcomingEvents: eventsRes.data,
          medalsSummary: medalsRes.data,
          trainingProgress: trainingRes.data,
          finaPoints: finaRes.data
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTime = (timeInMs) => {
    if (!timeInMs) return '--:--';
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = timeInMs % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* FINA Points Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              FINA Points
            </Typography>
            <Typography component="p" variant="h3">
              {dashboardData.finaPoints?.bestPoints || 0}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Best Event: {dashboardData.finaPoints?.bestEvent || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        {/* Medals Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Medals
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip
                icon={<EmojiEventsIcon />}
                label={`${dashboardData.medalsSummary?.total || 0} Total`}
                color="primary"
                variant="outlined"
              />
            </Box>
            <Typography color="text.secondary">
              Recent: {dashboardData.medalsSummary?.recentAchievement || 'None'}
            </Typography>
          </Paper>
        </Grid>

        {/* Training Progress */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Training Progress
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography component="p" variant="body2">
                Weekly Goal: {dashboardData.trainingProgress?.weeklyProgress || 0}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.trainingProgress?.weeklyProgress || 0}
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
            <Typography color="text.secondary">
              {dashboardData.trainingProgress?.nextSession || 'No upcoming session'}
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Performances */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Best
            </Typography>
            <Typography component="p" variant="h4">
              {formatTime(dashboardData.recentPerformances[0]?.time)}
            </Typography>
            <Typography color="text.secondary">
              {dashboardData.recentPerformances[0]?.event || 'No recent performance'}
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Performances List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {dashboardData.recentPerformances.slice(0, 5).map((performance, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <PoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={performance.event}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {formatTime(performance.time)}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            {new Date(performance.date).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.recentPerformances.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Upcoming Events
            </Typography>
            <List>
              {dashboardData.upcomingEvents.map((event, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {new Date(event.date).toLocaleDateString()}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption">
                            Location: {event.location}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {event.events.map((e, i) => (
                              <Chip
                                key={i}
                                label={e}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.upcomingEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Training Plan */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Current Training Focus
            </Typography>
            {dashboardData.trainingProgress?.currentPlan ? (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  {dashboardData.trainingProgress.currentPlan.name}
                </Typography>
                <List>
                  {dashboardData.trainingProgress.currentPlan.goals.map((goal, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <FitnessCenterIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={goal.description}
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={goal.progress}
                              sx={{ height: 8, borderRadius: 5 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Progress: {goal.progress}%
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Typography color="text.secondary">
                No active training plan
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
