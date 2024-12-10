import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import MedalCard from './MedalCard';
import { medalApi, standardsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MedalDisplay = () => {
  const [medals, setMedals] = useState([]);
  const [standards, setStandards] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medalsRes, standardsRes] = await Promise.all([
          medalApi.getAll(),
          standardsApi.getMotivational()
        ]);

        setMedals(medalsRes.data || []);
        setStandards(standardsRes.data || {});
      } catch (error) {
        console.error('Error fetching medal data:', error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // 计算进度
  const calculateProgress = (event, level) => {
    const userBestTime = 25.5; // 这里应该从用户成绩中获取
    const standardTime = parseFloat(standards[event]?.[level]?.replace(':', '') || 0);
    if (!standardTime) return 0;
    
    const progress = (standardTime / userBestTime) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const renderStandardMedals = () => {
    if (!standards) return null;

    const levels = ['AAAA', 'AAA', 'AA', 'A', 'BB', 'B'];
    
    return Object.entries(standards).map(([event, times]) => (
      <Grid item xs={12} sm={6} md={4} key={event}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {event}
          </Typography>
          {levels.map(level => (
            <MedalCard
              key={`${event}-${level}`}
              type="standard"
              level={level}
              achieved={medals.some(m => 
                m?.type === 'standard' && 
                m?.level === level && 
                m?.event === event
              )}
              details={`${event} ${level} Standard Time`}
              requirements={{ [event]: times[level] }}
              progress={calculateProgress(event, level)}
            />
          ))}
        </Box>
      </Grid>
    ));
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Achievement Medals
      </Typography>
      <Grid container spacing={3}>
        {renderStandardMedals()}
      </Grid>
    </Container>
  );
};

export default MedalDisplay;
