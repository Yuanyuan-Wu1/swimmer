import React from 'react';
import { Paper, Typography } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1 }}>
        <Typography variant="body2">
          Date: {new Date(label).toLocaleDateString()}
        </Typography>
        <Typography variant="body2">
          Time: {payload[0].value}
        </Typography>
      </Paper>
    );
  }
  return null;
};

export default CustomTooltip; 