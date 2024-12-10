import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Divider,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import axios from 'axios';

const ActivePlanView = () => {
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    note: '',
    metrics: {
      fatigue: 5,
      performance: 5,
      motivation: 5
    }
  });
  const [aiFeedback, setAiFeedback] = useState('');

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const fetchActivePlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/training-plan/active`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setActivePlan(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching active plan:', error);
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/training-plan/${activePlan._id}/progress`,
        feedbackData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Get AI feedback on the workout
      const aiResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/training-plan/${activePlan._id}/feedback`,
        {
          workoutData: {
            ...feedbackData,
            plan: activePlan
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setAiFeedback(aiResponse.data.feedback);
      setOpenFeedback(false);
      fetchActivePlan();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleMetricChange = (metric, value) => {
    setFeedbackData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metric]: value
      }
    }));
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!activePlan) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Typography variant="h6">
            No active training plan found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            href="/training/generate"
          >
            Generate New Plan
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Active Training Plan
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Goal: {activePlan.goal}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {activePlan.targetEvents.map((event, index) => (
                <Chip
                  key={index}
                  label={event.replace(/_/g, ' ')}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Weekly Schedule */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Schedule
            </Typography>
            {activePlan.weeklySchedule.map((day, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day.dayOfWeek]}
                  </Typography>
                  {day.sessions.map((session, sessionIndex) => (
                    <Box key={sessionIndex} sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" color="primary">
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
                    </Box>
                  ))}
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Progress and Feedback */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Progress & Feedback
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setOpenFeedback(true)}
              sx={{ mb: 3 }}
            >
              Add Progress Note
            </Button>
            
            {activePlan.progressNotes.map((note, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {new Date(note.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">{note.note}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" display="block">
                    Fatigue: {note.metrics.fatigue}/10
                  </Typography>
                  <Typography variant="caption" display="block">
                    Performance: {note.metrics.performance}/10
                  </Typography>
                  <Typography variant="caption" display="block">
                    Motivation: {note.metrics.motivation}/10
                  </Typography>
                </Box>
                <Divider sx={{ mt: 1 }} />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Feedback Dialog */}
      <Dialog open={openFeedback} onClose={() => setOpenFeedback(false)}>
        <DialogTitle>Add Progress Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={feedbackData.note}
            onChange={(e) => setFeedbackData(prev => ({ ...prev, note: e.target.value }))}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 3 }}>
            <Typography component="legend">Fatigue Level</Typography>
            <Rating
              value={feedbackData.metrics.fatigue}
              onChange={(_, value) => handleMetricChange('fatigue', value)}
              max={10}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography component="legend">Performance Level</Typography>
            <Rating
              value={feedbackData.metrics.performance}
              onChange={(_, value) => handleMetricChange('performance', value)}
              max={10}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography component="legend">Motivation Level</Typography>
            <Rating
              value={feedbackData.metrics.motivation}
              onChange={(_, value) => handleMetricChange('motivation', value)}
              max={10}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFeedback(false)}>Cancel</Button>
          <Button onClick={handleFeedbackSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Feedback Dialog */}
      {aiFeedback && (
        <Dialog
          open={!!aiFeedback}
          onClose={() => setAiFeedback('')}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>AI Coach Feedback</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {aiFeedback}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAiFeedback('')}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default ActivePlanView;
