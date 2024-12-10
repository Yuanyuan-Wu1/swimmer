const Team = require('../models/team');
const User = require('../models/user');
const { sendEmail } = require('./email');
const { sendNotification } = require('./notification');

class TeamService {
  // 创建团队公告
  async createAnnouncement(teamId, userId, announcement) {
    try {
      const team = await Team.findById(teamId);
      if (!team) throw new Error('Team not found');

      team.announcements.push({
        author: userId,
        content: announcement.content,
        date: new Date()
      });
      await team.save();

      // 发送通知给所有团队成员
      const members = await User.find({ _id: { $in: team.members } });
      for (const member of members) {
        await sendNotification(member._id, {
          type: 'team_announcement',
          teamId: team._id,
          announcement: announcement
        });

        // 发送邮件通知
        await sendEmail(member.email, {
          subject: `New Team Announcement - ${team.name}`,
          template: 'team-announcement',
          data: {
            teamName: team.name,
            announcement: announcement
          }
        });
      }

      return team;
    } catch (error) {
      throw error;
    }
  }

  // 获取团队动态
  async getTeamActivities(teamId, page = 1, limit = 10) {
    try {
      const activities = await Team.aggregate([
        { $match: { _id: teamId } },
        { $unwind: '$activities' },
        { $sort: { 'activities.date': -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]);

      return activities;
    } catch (error) {
      throw error;
    }
  }

  // 发送团队消息
  async sendTeamMessage(teamId, userId, message) {
    try {
      const team = await Team.findById(teamId);
      if (!team) throw new Error('Team not found');

      team.messages.push({
        sender: userId,
        content: message.content,
        date: new Date()
      });
      await team.save();

      // 实时通知在线成员
      // TODO: 实现WebSocket通知

      return team;
    } catch (error) {
      throw error;
    }
  }

  // 更新团队成员状态
  async updateMemberStatus(teamId, userId, status) {
    try {
      const team = await Team.findById(teamId);
      if (!team) throw new Error('Team not found');

      const memberIndex = team.members.findIndex(
        member => member.user.toString() === userId
      );

      if (memberIndex === -1) throw new Error('Member not found');

      team.members[memberIndex].status = status;
      await team.save();

      return team;
    } catch (error) {
      throw error;
    }
  }

  // 获取团队统计信息
  async getTeamStats(teamId) {
    try {
      const stats = await Team.aggregate([
        { $match: { _id: teamId } },
        {
          $lookup: {
            from: 'performances',
            localField: 'members.user',
            foreignField: 'user',
            as: 'performances'
          }
        },
        {
          $project: {
            totalMembers: { $size: '$members' },
            activeMembers: {
              $size: {
                $filter: {
                  input: '$members',
                  as: 'member',
                  cond: { $eq: ['$$member.status', 'active'] }
                }
              }
            },
            averagePerformance: { $avg: '$performances.time' },
            totalAnnouncements: { $size: '$announcements' }
          }
        }
      ]);

      return stats[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TeamService(); 