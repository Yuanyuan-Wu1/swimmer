import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const TimeRangeSelector = ({ value, onChange }) => (
  <FormControl fullWidth>
    <InputLabel>Time Range</InputLabel>
    <Select value={value} onChange={onChange}>
      <MenuItem value="1m">Last Month</MenuItem>
      <MenuItem value="3m">Last 3 Months</MenuItem>
      <MenuItem value="6m">Last 6 Months</MenuItem>
      <MenuItem value="1y">Last Year</MenuItem>
      <MenuItem value="all">All Time</MenuItem>
    </Select>
  </FormControl>
);

export default TimeRangeSelector; 