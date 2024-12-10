import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import { Box, Paper, Typography, Grid } from '@mui/material';

const PerformanceCharts = ({ data, healthData }) => {
  // 时间进展图
  const TimeProgressChart = () => (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="h6" gutterBottom>
        Time Progress
      </Typography>
      <ResponsiveContainer>
        <LineChart data={data.timeProgress}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} reversed />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="time"
            stroke="#8884d8"
            name="Race Time"
          />
          <Line
            type="monotone"
            dataKey="standardTime"
            stroke="#82ca9d"
            name="Standard Time"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );

  // FINA积分趋势图
  const FinaPointsChart = () => (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="h6" gutterBottom>
        FINA Points Trend
      </Typography>
      <ResponsiveContainer>
        <AreaChart data={data.finaPoints}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 'dataMax + 100']} />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="points"
            stroke="#8884d8"
            fill="#8884d8"
            name="FINA Points"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );

  // 比赛配速分析图
  const PaceAnalysisChart = () => (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="h6" gutterBottom>
        Pace Analysis
      </Typography>
      <ResponsiveContainer>
        <ComposedChart data={data.paceAnalysis}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="split" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="actualPace"
            fill="#8884d8"
            name="Actual Pace"
          />
          <Line
            type="monotone"
            dataKey="targetPace"
            stroke="#82ca9d"
            name="Target Pace"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );

  // 技术评分雷达图
  const TechnicalSkillsChart = () => (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="h6" gutterBottom>
        Technical Skills
      </Typography>
      <ResponsiveContainer>
        <RadarChart data={data.technicalSkills}>
          <PolarGrid />
          <PolarAngleAxis dataKey="aspect" />
          <PolarRadiusAxis domain={[0, 10]} />
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
  );

  // 健康指标相关性图
  const HealthCorrelationChart = () => (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="h6" gutterBottom>
        Health-Performance Correlation
      </Typography>
      <ResponsiveContainer>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="healthMetric"
            name="Health Metric"
            unit={healthData.unit}
          />
          <YAxis
            dataKey="performance"
            name="Performance"
            unit="points"
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter
            name="Health-Performance Correlation"
            data={healthData.correlation}
            fill="#8884d8"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Paper>
  );

  // 训练量分析图
  const TrainingVolumeChart = () => (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="h6" gutterBottom>
        Training Volume Analysis
      </Typography>
      <ResponsiveContainer>
        <BarChart data={data.trainingVolume}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="distance"
            fill="#8884d8"
            name="Distance (km)"
          />
          <Bar
            dataKey="intensity"
            fill="#82ca9d"
            name="Intensity Score"
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TimeProgressChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <FinaPointsChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <PaceAnalysisChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <TechnicalSkillsChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <HealthCorrelationChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <TrainingVolumeChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceCharts;
