import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { apiService } from '../../services/api';

const TrainingPlanGenerator = () => {
  const [standards, setStandards] = useState({});
  const [currentLevels, setCurrentLevels] = useState({});
  const [selectedEvent, setSelectedEvent] = useState('');
  const [targetLevel, setTargetLevel] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [standardsRes, levelsRes] = await Promise.all([
          apiService.standards.getAll(),
          apiService.get('/user/current-level')
        ]);
        
        setStandards(standardsRes.data.standards);
        setCurrentLevels(levelsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentTime = standards[selectedEvent][currentLevels[selectedEvent]];
    const targetTime = standards[selectedEvent][targetLevel];
    
    // 这里可以添加生成训练计划的逻辑
    console.log('Current time:', currentTime);
    console.log('Target time:', targetTime);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Generate Training Plan
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Levels
              </Typography>
              {Object.entries(currentLevels).map(([event, level]) => (
                <Box key={event} sx={{ mb: 1 }}>
                  <Typography>
                    {event}: {level} ({standards[event]?.[level]})
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Event</InputLabel>
              <Select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                {Object.keys(standards).map(event => (
                  <MenuItem key={event} value={event}>
                    {event}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Target Level</InputLabel>
              <Select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
              >
                {Object.keys(standards[selectedEvent] || {}).map(level => (
                  <MenuItem key={level} value={level}>
                    {level} ({standards[selectedEvent]?.[level]})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              fullWidth
            >
              Generate Plan
            </Button>
          </form>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainingPlanGenerator;
