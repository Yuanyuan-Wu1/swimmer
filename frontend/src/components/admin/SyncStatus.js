import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { Sync } from '@mui/icons-material';

const SyncStatus = () => {
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type })
      });

      if (!response.ok) throw new Error('Sync failed');

      fetchSyncStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLastSync(data);
    } catch (err) {
      console.error('Error fetching sync status:', err);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Data Synchronization
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Last Sync: {lastSync ? new Date(lastSync.endTime).toLocaleString() : 'Never'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {lastSync?.status || 'N/A'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Sync />}
          onClick={() => handleSync('all')}
          disabled={loading}
        >
          Sync All Data
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleSync('roster')}
          disabled={loading}
        >
          Sync Roster
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleSync('times')}
          disabled={loading}
        >
          Sync Times
        </Button>
      </Box>
    </Paper>
  );
};

export default SyncStatus; 