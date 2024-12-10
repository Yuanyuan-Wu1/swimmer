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
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  // 获取历史记录
  const fetchHistory = async () => {
    try {
      const [historyResponse, statsResponse] = await Promise.all([
        competitionApi.getHistory(),
        competitionApi.getStats()
      ]);
      
      setHistory(historyResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // 添加比赛结果
  const addResult = async (resultData) => {
    try {
      // 保存到数据库
      const response = await competitionApi.addResult(resultData);
      
      // 更新本地状态
      setHistory(prev => [...prev, response.data]);
      
      // 检查是否达到勋章条件
      await medalApi.checkMedals(response.data);
      
      // 更新统计数据
      const newStats = await competitionApi.getStats();
      setStats(newStats.data);
    } catch (error) {
      console.error('Error adding result:', error);
    }
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
