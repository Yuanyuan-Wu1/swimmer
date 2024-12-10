import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { settingsApi } from '../../services/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      phone: '',
      usaSwimmingId: ''
    },
    notifications: {
      email: true,
      push: true,
      medals: true,
      competitions: true,
      training: true
    },
    privacy: {
      showProfile: true,
      showMedals: true,
      showPerformance: true
    },
    sync: {
      autoSync: true,
      syncFrequency: 'daily'
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsApi.getSettings();
      setSettings(response.data);
    } catch (error) {
      setError('Failed to load settings');
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await settingsApi.updateSettings(settings);
      setSuccess(true);
    } catch (error) {
      setError('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={settings.profile.name}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, name: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, email: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={settings.profile.phone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, phone: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="USA Swimming ID"
                  value={settings.profile.usaSwimmingId}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, usaSwimmingId: e.target.value }
                  }))}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: e.target.checked }
                      }))}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: e.target.checked }
                      }))}
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Notify me about:
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.medals}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, medals: e.target.checked }
                      }))}
                    />
                  }
                  label="New Medals"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.competitions}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, competitions: e.target.checked }
                      }))}
                    />
                  }
                  label="Competitions"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.training}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, training: e.target.checked }
                      }))}
                    />
                  }
                  label="Training Updates"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Privacy Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showProfile}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showProfile: e.target.checked }
                      }))}
                    />
                  }
                  label="Show Profile to Team Members"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showMedals}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showMedals: e.target.checked }
                      }))}
                    />
                  }
                  label="Show Medals"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showPerformance}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showPerformance: e.target.checked }
                      }))}
                    />
                  }
                  label="Show Performance Data"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Data Sync Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Synchronization
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.sync.autoSync}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        sync: { ...prev.sync, autoSync: e.target.checked }
                      }))}
                    />
                  }
                  label="Auto-sync with USA Swimming"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Sync Frequency"
                  value={settings.sync.syncFrequency}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    sync: { ...prev.sync, syncFrequency: e.target.value }
                  }))}
                  disabled={!settings.sync.autoSync}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Settings saved successfully
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Settings'}
        </Button>
      </Box>
    </Container>
  );
};

export default Settings; 