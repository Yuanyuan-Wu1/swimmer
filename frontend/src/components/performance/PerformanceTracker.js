import React, { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import AddPerformanceModal from './AddPerformanceModal';
import { performanceApi } from '../../services/api';

const SWIMMING_EVENTS = [
  '50_FR_SCY', '100_FR_SCY', '200_FR_SCY', '500_FR_SCY',
  '50_BK_SCY', '100_BK_SCY',
  '50_BR_SCY', '100_BR_SCY',
  '50_FL_SCY', '100_FL_SCY',
  '100_IM_SCY', '200_IM_SCY'
];

const PerformanceTracker = () => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('50_FR_SCY');
  const [showAddModal, setShowAddModal] = useState(false);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchPerformances();
  }, [selectedEvent]);

  const fetchPerformances = async () => {
    try {
      const response = await performanceApi.getPerformances(selectedEvent);
      setPerformances(response.data);
      prepareChartData(response.data);
    } catch (error) {
      console.error('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerformance = async (data) => {
    try {
      await performanceApi.addPerformance({
        ...data,
        event: selectedEvent
      });
      fetchPerformances();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding performance:', error);
    }
  };

  const prepareChartData = (data) => {
    if (!data || data.length === 0) {
      setChartData(null);
      return;
    }

    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setChartData({
      labels: sortedData.map(p => new Date(p.date).toLocaleDateString()),
      datasets: [{
        label: 'Time (seconds)',
        data: sortedData.map(p => parseFloat(p.time)),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    });
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Performance Tracker
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Event</InputLabel>
          <Select
            value={selectedEvent}
            label="Event"
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            {SWIMMING_EVENTS.map((event) => (
              <MenuItem key={event} value={event}>
                {event.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Performance
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {chartData && (
            <Box sx={{ mb: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Line data={chartData} options={{ responsive: true }} />
              </Paper>
            </Box>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Competition</TableCell>
                  <TableCell>Place</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performances.map((performance) => (
                  <TableRow key={performance._id}>
                    <TableCell>
                      {new Date(performance.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{performance.time}</TableCell>
                    <TableCell>{performance.competition}</TableCell>
                    <TableCell>{performance.place}</TableCell>
                  </TableRow>
                ))}
                {performances.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No performances recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <AddPerformanceModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPerformance}
      />
    </Container>
  );
};

export default PerformanceTracker;
