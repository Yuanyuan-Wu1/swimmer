import React from 'react';
import { List, ListItem, ListItemText, Card, CardHeader } from '@mui/material';

const UpcomingEvents = ({ events }) => (
  <Card>
    <CardHeader title="Upcoming Events" />
    <List>
      {events.map((event) => (
        <ListItem key={event.id}>
          <ListItemText
            primary={event.name}
            secondary={`${new Date(event.date).toLocaleDateString()} - ${event.location}`}
          />
        </ListItem>
      ))}
    </List>
  </Card>
);

export default UpcomingEvents; 