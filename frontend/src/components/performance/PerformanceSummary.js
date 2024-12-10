import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const PerformanceSummary = ({ performances }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Performance Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Total Events</Typography>
          <Typography variant="h4">{performances.length}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Personal Bests</Typography>
          <Typography variant="h4">
            {performances.filter(p => p.isPB).length}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default PerformanceSummary; 