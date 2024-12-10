import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Slider,
  Typography
} from '@mui/material';

const HealthDataForm = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    sleepHours: 7,
    hydrationLevel: 5,
    fatigue: 5,
    nutritionScore: 5,
    notes: ''
  });

  const handleChange = (field) => (event, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value !== undefined ? value : event.target.value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      sleepHours: 7,
      hydrationLevel: 5,
      fatigue: 5,
      nutritionScore: 5,
      notes: ''
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record Health Data</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography gutterBottom>Sleep Hours</Typography>
            <Slider
              value={formData.sleepHours}
              onChange={handleChange('sleepHours')}
              min={0}
              max={12}
              step={0.5}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>Hydration Level (1-10)</Typography>
            <Slider
              value={formData.hydrationLevel}
              onChange={handleChange('hydrationLevel')}
              min={1}
              max={10}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>Fatigue Level (1-10)</Typography>
            <Slider
              value={formData.fatigue}
              onChange={handleChange('fatigue')}
              min={1}
              max={10}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>Nutrition Score (1-10)</Typography>
            <Slider
              value={formData.nutritionScore}
              onChange={handleChange('nutritionScore')}
              min={1}
              max={10}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={formData.notes}
              onChange={handleChange('notes')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HealthDataForm; 