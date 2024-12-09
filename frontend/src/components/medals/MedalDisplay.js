import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import MedalCard from './MedalCard';
import axios from 'axios';

const MedalDisplay = () => {
  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);

  const categories = [
    { key: 'all', label: 'All Medals' },
    { key: 'achievement', label: 'Achievement' },
    { key: 'progress', label: 'Progress' },
    { key: 'training', label: 'Training' },
    { key: 'special', label: 'Special' }
  ];

  useEffect(() => {
    const fetchMedals = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/medal/medals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMedals(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching medals:', err);
        setError('Failed to load medals. Please try again later.');
        setLoading(false);
      }
    };

    fetchMedals();
  }, []);

  const filterMedals = (medals) => {
    if (selectedCategory === 'all') return medals;
    
    return medals.filter(medal => {
      const type = medal.type.toLowerCase();
      switch (selectedCategory) {
        case 'achievement':
          return type.includes('standard');
        case 'progress':
          return type.includes('progress');
        case 'training':
          return type.includes('training');
        case 'special':
          return type.includes('time') || type.includes('place') || type.includes('finish');
        default:
          return true;
      }
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const filteredMedals = filterMedals(medals);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Swimming Achievements
      </Typography>
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 1,
          mb: 4 
        }}
      >
        {categories.map(category => (
          <Chip
            key={category.key}
            label={category.label}
            onClick={() => setSelectedCategory(category.key)}
            color={selectedCategory === category.key ? 'primary' : 'default'}
            variant={selectedCategory === category.key ? 'filled' : 'outlined'}
            sx={{ m: 0.5 }}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {filteredMedals.map((medal, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <MedalCard medal={medal} />
          </Grid>
        ))}
        {filteredMedals.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary">
              No medals found in this category.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default MedalDisplay;
