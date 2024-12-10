import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import PerformanceSummary from '../performance/PerformanceSummary';
import RecentActivities from '../activity/RecentActivities';
import UpcomingEvents from '../competition/UpcomingEvents';
import { apiService } from '../../services/api';

const Dashboard = () => {
  const [data, setData] = useState({
    performances: [],
    activities: [],
    events: []
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [performances, activities, events] = await Promise.all([
          apiService.performance.getAll(),
          apiService.activity.getRecent(),
          apiService.competition.getUpcoming()
        ]);

        setData({
          performances: performances.data,
          activities: activities.data,
          events: events.data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // 测试API连接
    const testConnection = async () => {
      try {
        const response = await apiService.get('/test');
        console.log('API test successful:', response.data);
      } catch (error) {
        console.error('API test failed:', error);
      }
    };
    
    testConnection();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <PerformanceSummary performances={data.performances} />
      </Grid>
      <Grid item xs={12} md={4}>
        <RecentActivities activities={data.activities} />
      </Grid>
      <Grid item xs={12} md={4}>
        <UpcomingEvents events={data.events} />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
