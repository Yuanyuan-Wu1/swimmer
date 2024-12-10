import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { Line } from 'react-chartjs-2';

const PerformanceAnalysis = ({ athleteName }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/analysis/${athleteName}`);
        const data = await response.json();
        setAnalysisData(data);
        if (data.events.length > 0) {
          setSelectedEvent(data.events[0].name);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
      }
    };
    
    fetchAnalysis();
  }, [athleteName]);
  
  if (!analysisData) return <div>Loading analysis...</div>;
  
  const renderBestTimesTable = () => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Event</TableCell>
            <TableCell>Best Time</TableCell>
            <TableCell>Meet</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Standard</TableCell>
            <TableCell>Achievement</TableCell>
            <TableCell>Improvement</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {analysisData.bestTimes.map((event) => (
            <TableRow 
              key={event.name}
              sx={{
                backgroundColor: event.achieved ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
              }}
            >
              <TableCell>{event.name}</TableCell>
              <TableCell>{event.bestTime}</TableCell>
              <TableCell>{event.meet}</TableCell>
              <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
              <TableCell>{event.standard}</TableCell>
              <TableCell>{event.achieved ? 'Achieved' : 'Not Achieved'}</TableCell>
              <TableCell>
                {event.improvement > 0 ? 
                  `-${event.improvement.toFixed(2)}s` : 
                  event.improvement.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  const renderTrendChart = () => {
    if (!selectedEvent) return null;
    
    const eventData = analysisData.trends[selectedEvent];
    const data = {
      labels: eventData.dates,
      datasets: [
        {
          label: 'Performance',
          data: eventData.times,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Trend',
          data: eventData.trendLine,
          borderColor: 'rgb(255, 99, 132)',
          borderDash: [5, 5],
          tension: 0.1
        }
      ]
    };
    
    return (
      <Box sx={{ height: 400 }}>
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                reverse: true
              }
            }
          }}
        />
      </Box>
    );
  };
  
  const renderMeetDetails = () => {
    if (!selectedEvent) return null;
    
    const eventData = analysisData.trends[selectedEvent];
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Meet</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {eventData.meets.map((meet, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(eventData.dates[index]).toLocaleDateString()}</TableCell>
                <TableCell>{meet}</TableCell>
                <TableCell>{eventData.times_display[index]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Performance Analysis for {athleteName}
      </Typography>
      
      {/* 最好成绩表格 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Best Times Analysis
          </Typography>
          {renderBestTimesTable()}
        </CardContent>
      </Card>
      
      {/* 成绩趋势图表和比赛详情 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Trends
          </Typography>
          
          <Tabs
            value={selectedEvent}
            onChange={(e, newValue) => setSelectedEvent(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {analysisData.events.map((event) => (
              <Tab key={event.name} label={event.name} value={event.name} />
            ))}
          </Tabs>
          
          {renderTrendChart()}
          {renderMeetDetails()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerformanceAnalysis; 