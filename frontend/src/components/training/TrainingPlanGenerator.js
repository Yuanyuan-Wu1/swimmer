import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Grid
} from '@mui/material';
import axios from 'axios';

const SWIMMING_EVENTS = [
  // SCY Events
  '50_FR_SCY', '100_FR_SCY', '200_FR_SCY', '500_FR_SCY',
  '50_BK_SCY', '100_BK_SCY',
  '50_BR_SCY', '100_BR_SCY',
  '50_FL_SCY', '100_FL_SCY',
  '100_IM_SCY', '200_IM_SCY',
  // LCM Events
  '50_FR_LCM', '100_FR_LCM', '200_FR_LCM', '400_FR_LCM',
  '50_BK_LCM', '100_BK_LCM',
  '50_BR_LCM', '100_BR_LCM',
  '50_FL_LCM', '100_FL_LCM',
  '200_IM_LCM'
];

const TrainingPlanGenerator = () => {
  const [formData, setFormData] = useState({
    targetEvents: [],
    currentLevel: '',
    goal: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEventChange = (event) => {
    setFormData(prev => ({
      ...prev,
      targetEvents: event.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/training-plan/generate`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setGeneratedPlan(response.data);
    } catch (error) {
      console.error('Error generating training plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventName = (event) => {
    return event.split('_').map(part => {
      if (part === 'FR') return 'Freestyle';
      if (part === 'BK') return 'Backstroke';
      if (part === 'BR') return 'Breaststroke';
      if (part === 'FL') return 'Butterfly';
      if (part === 'IM') return 'Individual Medley';
      if (part === 'SCY') return 'Short Course';
      if (part === 'LCM') return 'Long Course';
      return part;
    }).join(' ');
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Generate Training Plan
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target Events</InputLabel>
                <Select
                  multiple
                  name="targetEvents"
                  value={formData.targetEvents}
                  onChange={handleEventChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={formatEventName(value)} />
                      ))}
                    </Box>
                  )}
                >
                  {SWIMMING_EVENTS.map((event) => (
                    <MenuItem key={event} value={event}>
                      {formatEventName(event)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Current Level</InputLabel>
                <Select
                  name="currentLevel"
                  value={formData.currentLevel}
                  onChange={handleChange}
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                  <MenuItem value="elite">Elite</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="goal"
                label="Training Goal"
                multiline
                rows={3}
                value={formData.goal}
                onChange={handleChange}
                placeholder="Describe your training goals and objectives..."
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Training Plan'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {generatedPlan && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Generated Training Plan
          </Typography>
          
          {/* Display weekly schedule */}
          {generatedPlan.weeklySchedule.map((day, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day.dayOfWeek]}
              </Typography>
              
              {day.sessions.map((session, sessionIndex) => (
                <Box key={sessionIndex} sx={{ ml: 2, mb: 2 }}>
                  <Typography variant="body1" color="primary">
                    {session.type.toUpperCase()} - {session.focus}
                  </Typography>
                  
                  {session.mainSet.map((set, setIndex) => (
                    <Typography key={setIndex} variant="body2" sx={{ ml: 2 }}>
                      • {set.repetitions}x {set.distance}m {set.description} ({set.intensity})
                    </Typography>
                  ))}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Duration: {session.duration} minutes
                  </Typography>
                  {session.notes && (
                    <Typography variant="body2" color="text.secondary">
                      Notes: {session.notes}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ))}

          {/* Display dryland exercises */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Dryland Exercises
          </Typography>
          {generatedPlan.drylandExercises.map((exercise, index) => (
            <Box key={index} sx={{ ml: 2, mb: 1 }}>
              <Typography variant="body1">
                {exercise.name} - {exercise.sets} sets x {exercise.reps} reps
              </Typography>
              {exercise.notes && (
                <Typography variant="body2" color="text.secondary">
                  Notes: {exercise.notes}
                </Typography>
              )}
            </Box>
          ))}
        </Paper>
      )}
    </Container>
  );
};

export default TrainingPlanGenerator;
