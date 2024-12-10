import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Divider,
  Button
} from '@mui/material';
import {
  Notifications,
  Close,
  EmojiEvents,
  Event,
  Announcement,
  Assessment
} from '@mui/icons-material';

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    connectWebSocket();
    fetchNotifications();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    const wsUrl = `${process.env.REACT_APP_WS_URL}?token=${token}`;
    const socket = new WebSocket(wsUrl);

    let heartbeat = null;

    socket.onopen = () => {
      heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    socket.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      handleNewNotification(notification);
    };

    socket.onclose = () => {
      clearInterval(heartbeat);
      setTimeout(connectWebSocket, 3000);
    };

    setWs(socket);
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    // 显示浏览器通知
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/logo192.png'
      });
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'medal_earned':
        return <EmojiEvents color="primary" />;
      case 'competition':
        return <Event color="secondary" />;
      case 'announcement':
        return <Announcement color="info" />;
      case 'report':
        return <Assessment color="success" />;
      default:
        return <Notifications />;
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Notifications
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <List>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => markAsRead(notification.id)}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover'
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {notification.content}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {new Date(notification.date).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          {notifications.length === 0 && (
            <Box textAlign="center" py={3}>
              <Typography color="textSecondary">
                No notifications
              </Typography>
            </Box>
          )}

          {notifications.length > 0 && (
            <Box mt={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
              >
                Clear All
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationCenter; 