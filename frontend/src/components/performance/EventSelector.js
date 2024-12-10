import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const EventSelector = ({ value, onChange }) => (
  <FormControl fullWidth>
    <InputLabel>Event</InputLabel>
    <Select value={value} onChange={onChange}>
      <MenuItem value="50_FR">50 Free</MenuItem>
      <MenuItem value="100_FR">100 Free</MenuItem>
      <MenuItem value="50_BK">50 Back</MenuItem>
      {/* 添加更多项目 */}
    </Select>
  </FormControl>
);

export default EventSelector; 