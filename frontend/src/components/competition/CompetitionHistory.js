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
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';

const CompetitionHistory = () => {
  const [competitions, setCompetitions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [timeData, setTimeData] = useState([]);
  const [standardTimes, setStandardTimes] = useState({});
  const [view, setView] = useState('graph'); // 'graph' or 'table'

  const SWIMMING_EVENTS = [
    '50_FR_SCY', '100_FR_SCY', '200_FR_SCY', '500_FR_SCY',
    '50_BK_SCY', '100_BK_SCY',
    '50_BR_SCY', '100_BR_SCY',
    '50_FL_SCY', '100_FL_SCY',
    '100_IM_SCY', '200_IM_SCY'
  ];

  useEffect(() => {
    fetchCompetitionHistory();
    fetchStandardTimes();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      processTimeData();
    }
  }, [selectedEvent, competitions]);

  const fetchCompetitionHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/competition/history`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCompetitions(response.data);
    } catch (error) {
      console.error('Error fetching competition history:', error);
    }
  };

  const fetchStandardTimes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/standards/times`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStandardTimes(response.data);
    } catch (error) {
      console.error('Error fetching standard times:', error);
    }
  };

  const processTimeData = () => {
    if (!selectedEvent || !competitions.length) return;

    const data = competitions
      .filter(comp => comp.performances?.some(perf => perf.event === selectedEvent))
      .map(comp => {
        const performance = comp.performances.find(perf => perf.event === selectedEvent);
        return {
          date: format(new Date(comp.date), 'yyyy-MM-dd'),
          time: performance ? performance.time : null,
          finaPoints: performance ? performance.finaPoints : null,
          competition: comp.name
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Add standard times if available
    if (standardTimes[selectedEvent]) {
      const standards = standardTimes[selectedEvent];
      data.forEach(point => {
        Object.entries(standards).forEach(([level, time]) => {
          point[`${level}Standard`] = time;
        });
      });
    }

    setTimeData(data);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(2);
    return minutes > 0 ? 
      `${minutes}:${seconds.padStart(5, '0')}` : 
      seconds;
  };

  const calculateImprovement = (current, previous) => {
    if (!previous || !current) return null;
    const diff = previous - current;
    return diff.toFixed(2);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Competition History
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Event</InputLabel>
              <Select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                {SWIMMING_EVENTS.map(event => (
                  <MenuItem key={event} value={event}>
                    {event.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant={view === 'graph' ? 'contained' : 'outlined'}
              onClick={() => setView('graph')}
              sx={{ mr: 2 }}
            >
              Graph View
            </Button>
            <Button
              variant={view === 'table' ? 'contained' : 'outlined'}
              onClick={() => setView('table')}
            >
              Table View
            </Button>
          </Grid>
        </Grid>

        {view === 'graph' ? (
          <Paper sx={{ p: 2, mt: 3, height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={formatTime}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'time' || name.includes('Standard')) {
                      return formatTime(value);
                    }
                    return value;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#8884d8"
                  name="Your Time"
                  connectNulls
                />
                {standardTimes[selectedEvent] && Object.entries(standardTimes[selectedEvent])
                  .map(([level, time], index) => (
                    <Line
                      key={level}
                      type="monotone"
                      dataKey={`${level}Standard`}
                      stroke={`hsl(${index * 30}, 70%, 50%)`}
                      name={`${level} Standard`}
                      strokeDasharray="5 5"
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        ) : (
          <Paper sx={{ p: 2, mt: 3 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Competition</th>
                    <th>Time</th>
                    <th>Improvement</th>
                    <th>FINA Points</th>
                  </tr>
                </thead>
                <tbody>
                  {timeData.map((data, index) => (
                    <tr key={data.date}>
                      <td>{data.date}</td>
                      <td>{data.competition}</td>
                      <td>{formatTime(data.time)}</td>
                      <td>
                        {index > 0 ? 
                          calculateImprovement(data.time, timeData[index - 1].time) :
                          '-'}
                      </td>
                      <td>{data.finaPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default CompetitionHistory;
