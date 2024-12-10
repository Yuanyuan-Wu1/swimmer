import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
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
  AddComment
} from '@mui/icons-material';
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

const VideoAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationData, setAnnotationData] = useState({
    timestamp: 0,
    description: '',
    type: 'technique'
  });
  
  const videoRef = useRef(null);
  const progressInterval = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedEvent) {
      alert('Please select a video file and event type');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('event', selectedEvent);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/video-analysis/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Poll for analysis results
      pollAnalysisStatus(response.data.analysisId);
    } catch (error) {
      console.error('Error uploading video:', error);
      setUploading(false);
    }
  };

  const pollAnalysisStatus = async (analysisId) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/video-analysis/analysis/${analysisId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.status === 'completed') {
          setAnalysis(response.data);
          setUploading(false);
          clearInterval(interval);
        } else if (response.data.status === 'failed') {
          alert('Video analysis failed');
          setUploading(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling analysis status:', error);
        setUploading(false);
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
        clearInterval(progressInterval.current);
      } else {
        videoRef.current.play();
        progressInterval.current = setInterval(() => {
          setCurrentTime(videoRef.current.currentTime);
        }, 1000);
      }
      setPlaying(!playing);
    }
  };

  const handleSeek = (change) => {
    if (videoRef.current) {
      videoRef.current.currentTime += change;
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleAddAnnotation = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/video-analysis/analysis/${analysis._id}/annotations`,
        {
          ...annotationData,
          timestamp: currentTime
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh analysis data
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/video-analysis/analysis/${analysis._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAnalysis(response.data);
      setShowAnnotationDialog(false);
      setAnnotationData({
        timestamp: 0,
        description: '',
        type: 'technique'
      });
    } catch (error) {
      console.error('Error adding annotation:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Video Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="video-upload"
              />
              <label htmlFor="video-upload">
                <Button
                  variant="contained"
                  component="span"
                  sx={{ mr: 2 }}
                >
                  Select Video
                </Button>
              </label>

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Event</InputLabel>
                <Select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  label="Event"
                >
                  {SWIMMING_EVENTS.map((event) => (
                    <MenuItem key={event} value={event}>
                      {event.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!selectedFile || !selectedEvent || uploading}
                sx={{ ml: 2 }}
              >
                {uploading ? <CircularProgress size={24} /> : 'Upload & Analyze'}
              </Button>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <video
                ref={videoRef}
                style={{ width: '100%', maxHeight: '400px' }}
                onLoadedMetadata={() => setDuration(videoRef.current.duration)}
                controls={false}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography sx={{ mr: 2 }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
                <IconButton onClick={() => handleSeek(-5)}>
                  <FastRewind />
                </IconButton>
                <IconButton onClick={handlePlayPause}>
                  {playing ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton onClick={() => handleSeek(5)}>
                  <FastForward />
                </IconButton>
                <Tooltip title="Add Annotation">
                  <IconButton 
                    onClick={() => setShowAnnotationDialog(true)}
                    disabled={!analysis}
                  >
                    <AddComment />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            {analysis && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  Stroke Analysis
                </Typography>
                <Box sx={{ ml: 2, mb: 2 }}>
                  <Typography variant="body2">
                    Body Position: {analysis.strokeAnalysis.bodyPosition}
                  </Typography>
                  <Typography variant="body2">
                    Arm Movement: {analysis.strokeAnalysis.armMovement}
                  </Typography>
                  <Typography variant="body2">
                    Leg Movement: {analysis.strokeAnalysis.legMovement}
                  </Typography>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Technical Feedback
                </Typography>
                <Box sx={{ ml: 2, mb: 2 }}>
                  {analysis.aiAnalysis.technicalFeedback.map((feedback, index) => (
                    <Typography key={index} variant="body2">
                      • {feedback}
                    </Typography>
                  ))}
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Recommended Drills
                </Typography>
                <Box sx={{ ml: 2 }}>
                  {analysis.aiAnalysis.recommendedDrills.map((drill, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {drill.name}
                      </Typography>
                      <Typography variant="body2">
                        {drill.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Annotation Dialog */}
      <Dialog 
        open={showAnnotationDialog} 
        onClose={() => setShowAnnotationDialog(false)}
      >
        <DialogTitle>Add Annotation</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={annotationData.description}
            onChange={(e) => setAnnotationData(prev => ({
              ...prev,
              description: e.target.value
            }))}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={annotationData.type}
              onChange={(e) => setAnnotationData(prev => ({
                ...prev,
                type: e.target.value
              }))}
              label="Type"
            >
              <MenuItem value="technique">Technique</MenuItem>
              <MenuItem value="position">Position</MenuItem>
              <MenuItem value="timing">Timing</MenuItem>
              <MenuItem value="general">General</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAnnotationDialog(false)}>Cancel</Button>
          <Button onClick={handleAddAnnotation} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VideoAnalyzer;
