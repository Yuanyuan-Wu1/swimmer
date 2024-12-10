import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const SWIMMING_EVENTS = [
  '50_FR_SCY', '100_FR_SCY', '200_FR_SCY', '500_FR_SCY',
  '50_BK_SCY', '100_BK_SCY',
  '50_BR_SCY', '100_BR_SCY',
  '50_FL_SCY', '100_FL_SCY',
  '100_IM_SCY', '200_IM_SCY',
  '200_FR_R_SCY', '200_MED_R_SCY',
  '50_FR_LCM', '100_FR_LCM', '200_FR_LCM', '400_FR_LCM',
  '50_BK_LCM', '100_BK_LCM',
  '50_BR_LCM', '100_BR_LCM',
  '50_FL_LCM', '100_FL_LCM',
  '200_IM_LCM',
  '200_FR_R_LCM', '200_MED_R_LCM'
];

const AddPerformanceModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    event: '',
    minutes: '',
    seconds: '',
    milliseconds: '',
    date: new Date(),
    competition: '',
    place: '',
    splits: []
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.event) {
      newErrors.event = 'Please select an event';
    }
    
    const mins = parseInt(formData.minutes || '0');
    const secs = parseInt(formData.seconds || '0');
    const ms = parseInt(formData.milliseconds || '0');
    
    if (mins < 0 || mins >= 60 || isNaN(mins)) {
      newErrors.minutes = 'Invalid minutes';
    }
    if (secs < 0 || secs >= 60 || isNaN(secs)) {
      newErrors.seconds = 'Invalid seconds';
    }
    if (ms < 0 || ms >= 100 || isNaN(ms)) {
      newErrors.milliseconds = 'Invalid milliseconds';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const timeInSeconds = 
      (parseInt(formData.minutes || '0') * 60) +
      parseInt(formData.seconds || '0') +
      (parseInt(formData.milliseconds || '0') / 100);
    
    onSubmit({
      ...formData,
      time: timeInSeconds.toFixed(2)
    });

    setFormData({
      event: '',
      minutes: '',
      seconds: '',
      milliseconds: '',
      date: new Date(),
      competition: '',
      place: '',
      splits: []
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Performance</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Event</InputLabel>
              <Select
                name="event"
                value={formData.event}
                onChange={handleChange}
                error={!!errors.event}
              >
                {SWIMMING_EVENTS.map((event) => (
                  <MenuItem key={event} value={event}>
                    {event.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Minutes"
                name="minutes"
                value={formData.minutes}
                onChange={handleChange}
                type="number"
                inputProps={{ min: 0, max: 59 }}
                error={!!errors.minutes}
                helperText={errors.minutes}
              />
              <TextField
                label="Seconds"
                name="seconds"
                value={formData.seconds}
                onChange={handleChange}
                type="number"
                inputProps={{ min: 0, max: 59 }}
                error={!!errors.seconds}
                helperText={errors.seconds}
              />
              <TextField
                label="Milliseconds"
                name="milliseconds"
                value={formData.milliseconds}
                onChange={handleChange}
                type="number"
                inputProps={{ min: 0, max: 99 }}
                error={!!errors.milliseconds}
                helperText={errors.milliseconds}
              />
            </Box>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!!errors.date}
                    helperText={errors.date}
                  />
                )}
              />
            </LocalizationProvider>

            <TextField
              label="Competition"
              name="competition"
              value={formData.competition}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Place"
              name="place"
              value={formData.place}
              onChange={handleChange}
              type="number"
              inputProps={{ min: 1 }}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Add Performance
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddPerformanceModal;
