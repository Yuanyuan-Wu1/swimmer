import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import axios from 'axios';

const SwimmingStandards = () => {
  const [standards, setStandards] = useState({});
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCourse, setCourse] = useState('SCY');
  const [personalBests, setPersonalBests] = useState({});
  const [view, setView] = useState(0); // 0: Graph, 1: Table

  const SWIMMING_EVENTS = {
    SCY: [
      '50_FR_SCY', '100_FR_SCY', '200_FR_SCY', '500_FR_SCY',
      '50_BK_SCY', '100_BK_SCY',
      '50_BR_SCY', '100_BR_SCY',
      '50_FL_SCY', '100_FL_SCY',
      '100_IM_SCY', '200_IM_SCY'
    ],
    LCM: [
      '50_FR_LCM', '100_FR_LCM', '200_FR_LCM', '400_FR_LCM',
      '50_BK_LCM', '100_BK_LCM',
      '50_BR_LCM', '100_BR_LCM',
      '50_FL_LCM', '100_FL_LCM',
      '200_IM_LCM'
    ]
  };

  useEffect(() => {
    fetchStandards();
    fetchPersonalBests();
  }, [selectedCourse]);

  const fetchStandards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/standards/${selectedCourse}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStandards(response.data);
    } catch (error) {
      console.error('Error fetching standards:', error);
    }
  };

  const fetchPersonalBests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/performance/personal-bests/${selectedCourse}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setPersonalBests(response.data);
    } catch (error) {
      console.error('Error fetching personal bests:', error);
    }
  };

  const formatTime = (time) => {
    if (!time) return '-';
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(2);
    return minutes > 0 ? 
      `${minutes}:${seconds.padStart(5, '0')}` : 
      seconds;
  };

  const prepareChartData = () => {
    if (!selectedEvent || !standards[selectedEvent]) return [];

    const standardLevels = Object.entries(standards[selectedEvent])
      .map(([level, time]) => ({
        level,
        time,
        personalBest: personalBests[selectedEvent]
      }))
      .sort((a, b) => b.time - a.time);

    return standardLevels;
  };

  const getStandardColor = (level) => {
    const colors = {
      'AAAA': '#FFD700', // Gold
      'AAA': '#C0C0C0',  // Silver
      'AA': '#CD7F32',   // Bronze
      'A': '#4CAF50',    // Green
      'BB': '#2196F3',   // Blue
      'B': '#9C27B0',    // Purple
      'C': '#FF9800'     // Orange
    };
    return colors[level] || '#000000';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          USA Swimming Standards
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select
                value={selectedCourse}
                onChange={(e) => setCourse(e.target.value)}
              >
                <MenuItem value="SCY">Short Course Yards (SCY)</MenuItem>
                <MenuItem value="LCM">Long Course Meters (LCM)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Event</InputLabel>
              <Select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                {SWIMMING_EVENTS[selectedCourse].map(event => (
                  <MenuItem key={event} value={event}>
                    {event.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={view} onChange={(e, newValue) => setView(newValue)}>
            <Tab label="Graph View" />
            <Tab label="Table View" />
          </Tabs>
        </Box>

        {view === 0 ? (
          <Paper sx={{ p: 2, mt: 3, height: 400 }}>
            <ResponsiveContainer>
              <BarChart
                data={prepareChartData()}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={formatTime}
                />
                <YAxis
                  dataKey="level"
                  type="category"
                />
                <Tooltip
                  formatter={(value) => formatTime(value)}
                />
                <Legend />
                <Bar
                  dataKey="time"
                  fill="#8884d8"
                  name="Standard Time"
                />
                {personalBests[selectedEvent] && (
                  <ReferenceLine
                    x={personalBests[selectedEvent]}
                    stroke="red"
                    label="Personal Best"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Standard Level</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedEvent && standards[selectedEvent] && 
                  Object.entries(standards[selectedEvent])
                    .sort((a, b) => b[1] - a[1])
                    .map(([level, time]) => {
                      const personalBest = personalBests[selectedEvent];
                      const achieved = personalBest && personalBest <= time;
                      
                      return (
                        <TableRow 
                          key={level}
                          sx={{
                            backgroundColor: achieved ? 
                              `${getStandardColor(level)}20` : 
                              'inherit'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  backgroundColor: getStandardColor(level),
                                  mr: 1
                                }}
                              />
                              {level}
                            </Box>
                          </TableCell>
                          <TableCell>{formatTime(time)}</TableCell>
                          <TableCell>
                            {achieved ? '✓ Achieved' : 'Not Yet'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default SwimmingStandards;
