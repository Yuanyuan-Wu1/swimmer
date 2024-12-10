import React from 'react';
import { List, ListItem, ListItemText, Card, CardHeader } from '@mui/material';

const RecentActivities = ({ activities }) => (
  <Card>
    <CardHeader title="Recent Activities" />
    <List>
      {activities.map((activity) => (
        <ListItem key={activity.id}>
          <ListItemText
            primary={activity.description}
            secondary={new Date(activity.date).toLocaleDateString()}
          />
        </ListItem>
      ))}
    </List>
  </Card>
);

export default RecentActivities; 