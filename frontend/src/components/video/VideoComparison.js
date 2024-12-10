import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  FastRewind,
  FastForward,
  Compare,
  Speed,
  Sync
} from '@mui/icons-material';
import axios from 'axios';

const VideoComparison = ({ analysisId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [comparisonVideo, setComparisonVideo] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [syncOffset, setSyncOffset] = useState(0);
  const [showSpeedDialog, setShowSpeedDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);

  const mainVideoRef = useRef(null);
  const comparisonVideoRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId]);

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/video-analysis/analysis/${analysisId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const handleComparisonVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);
    formData.append('analysisId', analysisId);
    formData.append('type', 'custom');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/video-analysis/comparison/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      setComparisonVideo(response.data);
      fetchAnalysis(); // Refresh analysis data
    } catch (error) {
      console.error('Error uploading comparison video:', error);
    }
  };

  const handlePlayPause = () => {
    if (mainVideoRef.current && comparisonVideoRef.current) {
      if (playing) {
        mainVideoRef.current.pause();
        comparisonVideoRef.current.pause();
        clearInterval(progressInterval.current);
      } else {
        Promise.all([
          mainVideoRef.current.play(),
          comparisonVideoRef.current.play()
        ]).catch(console.error);
        
        progressInterval.current = setInterval(() => {
          syncVideos();
        }, 1000);
      }
      setPlaying(!playing);
    }
  };

  const syncVideos = () => {
    if (mainVideoRef.current && comparisonVideoRef.current) {
      const mainTime = mainVideoRef.current.currentTime;
      const comparisonTime = mainTime + syncOffset;
      
      if (Math.abs(comparisonVideoRef.current.currentTime - comparisonTime) > 0.1) {
        comparisonVideoRef.current.currentTime = comparisonTime;
      }
    }
  };

  const handleSeek = (change) => {
    if (mainVideoRef.current && comparisonVideoRef.current) {
      mainVideoRef.current.currentTime += change;
      comparisonVideoRef.current.currentTime = mainVideoRef.current.currentTime + syncOffset;
    }
  };

  const handleSpeedChange = (speed) => {
    if (mainVideoRef.current && comparisonVideoRef.current) {
      mainVideoRef.current.playbackRate = speed;
      comparisonVideoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleSyncOffsetChange = (event, newValue) => {
    setSyncOffset(newValue);
    if (comparisonVideoRef.current && mainVideoRef.current) {
      comparisonVideoRef.current.currentTime = 
        mainVideoRef.current.currentTime + newValue;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" gutterBottom>
          Video Comparison Analysis
        </Typography>

        <Grid container spacing={2}>
          {/* Video Controls */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => handleSeek(-5)}>
                <FastRewind />
              </IconButton>
              <IconButton onClick={handlePlayPause}>
                {playing ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={() => handleSeek(5)}>
                <FastForward />
              </IconButton>
              <IconButton onClick={() => setShowSpeedDialog(true)}>
                <Speed />
              </IconButton>
              <IconButton onClick={() => setShowComparisonDialog(true)}>
                <Compare />
              </IconButton>
              
              <Box sx={{ width: 200, mx: 2 }}>
                <Typography gutterBottom>Sync Offset</Typography>
                <Slider
                  value={syncOffset}
                  onChange={handleSyncOffsetChange}
                  min={-5}
                  max={5}
                  step={0.1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}s`}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Videos */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Current Performance
              </Typography>
              <video
                ref={mainVideoRef}
                src={analysis?.video?.url}
                style={{ width: '100%' }}
                controls={false}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comparison Video
              </Typography>
              {analysis?.comparisonVideo ? (
                <video
                  ref={comparisonVideoRef}
                  src={analysis.comparisonVideo.url}
                  style={{ width: '100%' }}
                  controls={false}
                />
              ) : (
                <Box
                  sx={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200'
                  }}
                >
                  <Button
                    variant="contained"
                    component="label"
                  >
                    Upload Comparison Video
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      onChange={handleComparisonVideoUpload}
                    />
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Comparison Analysis */}
          {analysis?.comparisonAnalysis && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Comparison Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Similarities</Typography>
                    {analysis.comparisonAnalysis.similarities.map((item, index) => (
                      <Typography key={index} variant="body2">
                        • {item}
                      </Typography>
                    ))}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Differences</Typography>
                    {analysis.comparisonAnalysis.differences.map((item, index) => (
                      <Typography key={index} variant="body2">
                        • {item}
                      </Typography>
                    ))}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Recommendations</Typography>
                    {analysis.comparisonAnalysis.recommendations.map((item, index) => (
                      <Typography key={index} variant="body2">
                        • {item}
                      </Typography>
                    ))}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Playback Speed Dialog */}
      <Dialog
        open={showSpeedDialog}
        onClose={() => setShowSpeedDialog(false)}
      >
        <DialogTitle>Playback Speed</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Speed</InputLabel>
            <Select
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(e.target.value)}
            >
              <MenuItem value={0.25}>0.25x</MenuItem>
              <MenuItem value={0.5}>0.5x</MenuItem>
              <MenuItem value={1}>1x</MenuItem>
              <MenuItem value={1.5}>1.5x</MenuItem>
              <MenuItem value={2}>2x</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
      </Dialog>

      {/* Comparison Settings Dialog */}
      <Dialog
        open={showComparisonDialog}
        onClose={() => setShowComparisonDialog(false)}
      >
        <DialogTitle>Comparison Settings</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Comparison Type</InputLabel>
            <Select
              value={analysis?.comparisonVideo?.type || 'custom'}
              onChange={(e) => {
                // Handle comparison type change
              }}
            >
              <MenuItem value="reference">Reference Technique</MenuItem>
              <MenuItem value="previous">Previous Performance</MenuItem>
              <MenuItem value="custom">Custom Video</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            sx={{ mt: 2 }}
            value={analysis?.comparisonVideo?.description || ''}
            onChange={(e) => {
              // Handle notes change
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default VideoComparison;
