import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import AddPerformanceModal from './AddPerformanceModal';
import { performanceApi } from '../../services/api';
import { format, formatTime, getStandardColor } from '../../utils/utils';
import EventSelector from './EventSelector';
import TimeRangeSelector from './TimeRangeSelector';
import PerformanceTable from './PerformanceTable';
import { standardsApi, champsStandardsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CustomTooltip from './CustomTooltip';

/**
 * 成绩追踪组件
 * 展示用户的成绩历史和达标情况
 * @component
 */
const PerformanceTracker = () => {
  /** @state {Performance[]} 成绩记录列表 */
  const [performances, setPerformances] = useState([]);
  
  /** @state {Object} 标准时间数据 */
  const [standards, setStandards] = useState(null);
  const [champsStandards, setChampsStandards] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [timeRange, setTimeRange] = useState('1y'); // 1y, 6m, 3m
  const [view, setView] = useState('graph'); // graph, table
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [selectedEvent]);

  /**
   * 加载成绩和标准数据
   * @async
   */
  const fetchData = async () => {
    try {
      const [perfRes, stdRes, champsRes] = await Promise.all([
        performanceApi.getPerformances({ event: selectedEvent }),
        standardsApi.getEventStandards(selectedEvent, user.profile),
        champsStandardsApi.getQualifyingTime(selectedEvent, user.profile)
      ]);

      setPerformances(perfRes.data);
      setStandards(stdRes.data);
      setChampsStandards(champsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  /**
   * 处理图表数据
   * @returns {Object[]} 格式化后的图表数据
   */
  const chartData = useMemo(() => {
    if (!performances.length) return [];

    return performances.map(p => ({
      date: format(new Date(p.date), 'yyyy-MM-dd'),
      time: p.time.value,
      displayTime: p.time.displayValue,
      // 添加标准线数据
      ...standards && Object.entries(standards).reduce((acc, [level, time]) => ({
        ...acc,
        [level]: time
      }), {}),
      // 添加锦标赛标准线
      champsQualifying: champsStandards?.qualifying_time
    }));
  }, [performances, standards, champsStandards]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Performance Tracking
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <EventSelector value={selectedEvent} onChange={setSelectedEvent} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </Grid>
      <Grid item xs={12}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tickFormatter={format} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="time" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Grid>
      <Grid item xs={12}>
        <PerformanceTable performances={performances} />
      </Grid>
    </Grid>
  );
};

export default PerformanceTracker;
