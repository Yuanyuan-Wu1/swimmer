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
  Button,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { healthApi } from '../../services/api';
import HealthDataForm from './HealthDataForm';

const HealthDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      const [dataResponse, trendsResponse] = await Promise.all([
        healthApi.getRecentHealthData(),
        healthApi.getHealthTrends()
      ]);
      
      setHealthData(dataResponse.data);
      setTrends(trendsResponse.data);
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  };

  const recordHealthData = async (data) => {
    try {
      const response = await healthApi.recordHealthData(data);
      
      setHealthData(prev => ({
        ...prev,
        recent: [...prev.recent, response.data]
      }));
      
      const newTrends = await healthApi.getHealthTrends();
      setTrends(newTrends.data);
    } catch (error) {
      console.error('Error recording health data:', error);
    }
  };

  const handleHealthDataSubmit = async (data) => {
    try {
      await healthApi.recordHealthData(data);
      fetchHealthData();
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting health data:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          {/* Health Overview */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Health Overview</Typography>
              <Button 
                variant="contained" 
                onClick={() => setShowForm(true)}
              >
                Record Health Data
              </Button>
            </Paper>
          </Grid>

          {/* Health Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Health Status
                </Typography>
                {healthData && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Sleep Quality</Typography>
                      <Typography variant="h4">
                        {healthData.sleepHours}h
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Hydration</Typography>
                      <Typography variant="h4">
                        {healthData.hydrationLevel}/10
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Fatigue Level</Typography>
                      <Typography variant="h4">
                        {healthData.fatigue}/10
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Nutrition Score</Typography>
                      <Typography variant="h4">
                        {healthData.nutritionScore}/10
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Health Trends */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Health Trends
                </Typography>
                {trends && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sleep" 
                        stroke="#8884d8" 
                        name="Sleep Hours"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hydration" 
                        stroke="#82ca9d" 
                        name="Hydration"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="fatigue" 
                        stroke="#ffc658" 
                        name="Fatigue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Health Recommendations
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {recommendations.map((rec, index) => (
                  <Chip
                    key={index}
                    label={rec.message}
                    color={rec.priority === 'high' ? 'error' : 'primary'}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <HealthDataForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleHealthDataSubmit}
      />
    </Container>
  );
};

export default HealthDashboard; 