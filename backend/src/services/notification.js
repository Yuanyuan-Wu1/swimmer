const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class NotificationService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws, req) => {
      try {
        // 验证token
        const token = req.url.split('token=')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // 存储连接
        this.clients.set(userId, ws);

        ws.on('close', () => {
          this.clients.delete(userId);
        });

      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.terminate();
      }
    });
  }

  // 发送实时通知
  async sendNotification(userId, notification) {
    try {
      const ws = this.clients.get(userId);
      if (ws) {
        ws.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
      }

      // 保存通知到数据库
      await this.saveNotification(userId, notification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // 发送广播通知
  async broadcastNotification(userIds, notification) {
    for (const userId of userIds) {
      await this.sendNotification(userId, notification);
    }
  }

  // 保存通知到数据库
  async saveNotification(userId, notification) {
    try {
      const newNotification = new Notification({
        user: userId,
        type: notification.type,
        content: notification.content,
        data: notification.data,
        read: false
      });
      await newNotification.save();
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }
}

module.exports = new NotificationService();
