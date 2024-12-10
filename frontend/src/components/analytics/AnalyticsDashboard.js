import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { analyticsApi } from '../../services/api';
import PerformanceCharts from '../visualization/PerformanceCharts';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedEvent]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await analyticsApi.getAnalytics({
        period: selectedPeriod,
        event: selectedEvent
      });
      setAnalyticsData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
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
          {/* Controls */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  label="Time Period"
                >
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Event</InputLabel>
                <Select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  label="Event"
                >
                  <MenuItem value="all">All Events</MenuItem>
                  {/* Add event options */}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={fetchAnalyticsData}>
                Update Analysis
              </Button>
            </Paper>
          </Grid>

          {/* Performance Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Performance Summary
              </Typography>
              {analyticsData?.summary && (
                <Box>
                  <Typography variant="body1">
                    Total Sessions: {analyticsData.summary.totalSessions}
                  </Typography>
                  <Typography variant="body1">
                    Personal Bests: {analyticsData.summary.personalBests}
                  </Typography>
                  <Typography variant="body1">
                    Average Improvement: {analyticsData.summary.averageImprovement}%
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Training Load */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Training Load
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData?.trainingLoad}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="load"
                    stroke="#8884d8"
                    name="Training Load"
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="#82ca9d"
                    name="Intensity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Technical Skills Analysis */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Technical Skills Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={analyticsData?.technicalSkills}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="aspect" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Current"
                    dataKey="score"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Previous"
                    dataKey="previousScore"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Performance Charts */}
          <Grid item xs={12}>
            <PerformanceCharts data={analyticsData?.performanceData} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AnalyticsDashboard; 