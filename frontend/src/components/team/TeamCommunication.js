import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { apiService } from '../../services/api';

const TeamCommunication = () => {
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const [messagesRes, announcementsRes] = await Promise.all([
          apiService.team.getMessages(),
          apiService.team.getAnnouncements()
        ]);

        setMessages(messagesRes.data);
        setAnnouncements(announcementsRes.data);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Team Announcements
          </Typography>
          {announcements.map(announcement => (
            <div key={announcement.id}>
              <Typography variant="subtitle1">{announcement.title}</Typography>
              <Typography variant="body2">{announcement.content}</Typography>
            </div>
          ))}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Team Messages
          </Typography>
          {messages.map(message => (
            <div key={message.id}>
              <Typography variant="subtitle2">{message.sender}</Typography>
              <Typography variant="body2">{message.content}</Typography>
            </div>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TeamCommunication; 