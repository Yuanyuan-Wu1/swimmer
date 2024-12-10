import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  IconButton,
  DialogActions,
  Button
} from '@mui/material';
import {
  EmojiEvents,
  Timeline,
  CheckCircle,
  Close
} from '@mui/icons-material';

const MedalDetailView = ({ medal, open, onClose }) => {
  const getMedalColor = (type) => {
    if (type.includes('AAAA')) return '#FFD700';
    if (type.includes('AAA')) return '#FFC125';
    if (type.includes('AA')) return '#EEC900';
    if (type.includes('A')) return '#CDC673';
    if (type.includes('BB')) return '#C0C0C0';
    if (type.includes('B')) return '#CD7F32';
    return '#8884d8';
  };

  const formatTime = (timeInMs) => {
    if (!timeInMs) return '--:--';
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = ((timeInMs % 60000) / 1000).toFixed(2);
    return `${minutes}:${seconds.padStart(5, '0')}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Medal Details</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Medal Icon and Basic Info */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2
              }}
            >
              <EmojiEvents
                sx={{
                  fontSize: 80,
                  color: getMedalColor(medal?.type || '')
                }}
              />
              <Typography variant="h6" align="center" gutterBottom>
                {medal?.name}
              </Typography>
              <Chip
                label={medal?.earned ? 'Earned' : 'In Progress'}
                color={medal?.earned ? 'success' : 'default'}
                sx={{ mt: 1 }}
              />
              {medal?.earnedDate && (
                <Typography variant="caption" color="text.secondary">
                  Earned on {new Date(medal.earnedDate).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Medal Requirements and Progress */}
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" gutterBottom>
              Requirements
            </Typography>
            <Typography variant="body2" paragraph>
              {medal?.requirement}
            </Typography>

            {medal?.targetTime && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Target Time: {formatTime(medal.targetTime)}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Current Best: {formatTime(medal.currentBestTime)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={medal.progress}
                    sx={{
                      height: 8,
                      borderRadius: 5
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Progress: {medal.progress}%
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Related Performances */}
            {medal?.relatedPerformances?.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Related Performances
                </Typography>
                <Timeline>
                  {medal.relatedPerformances.map((perf) => (
                    <Box key={perf._id} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {formatTime(perf.time)} - {perf.event}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(perf.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Timeline>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!medal?.earned && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircle />}
            disabled
          >
            Mark as Earned
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MedalDetailView; 