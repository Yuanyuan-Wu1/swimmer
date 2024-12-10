import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const EnhancedCharts = ({ data }) => {
  const {
    performanceTrends,
    trainingDistribution,
    technicalSkills,
    medalProgress,
    competitionResults
  } = data;

  return (
    <Grid container spacing={3}>
      {/* Performance Trends */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Performance Trends
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="time"
                stroke="#8884d8"
                name="Time"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#82ca9d"
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Training Distribution */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Training Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trainingDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {trainingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Technical Skills */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Technical Skills Analysis
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={technicalSkills}>
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

      {/* Medal Progress */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Medal Progress
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={medalProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="earned" stackId="a" fill="#8884d8" name="Earned" />
              <Bar dataKey="remaining" stackId="a" fill="#82ca9d" name="Remaining" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Competition Results */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Competition Performance
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={competitionResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="performance"
                stroke="#8884d8"
                fill="#8884d8"
                name="Performance"
              />
              <Area
                type="monotone"
                dataKey="average"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Average"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default EnhancedCharts; 