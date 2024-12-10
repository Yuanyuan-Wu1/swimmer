const axios = require('axios');
const cheerio = require('cheerio');
const Performance = require('../models/performance');
const User = require('../models/user');
const Competition = require('../models/competition');
const authConfig = require('../config/auth.json');

class SwimCloudSyncService {
  constructor() {
    this.baseUrl = 'https://www.swimcloud.com';
    this.teamId = '8290'; // West Coast Aquatics ID
    this.headers = {
      ...authConfig.headers,
      'Cookie': authConfig.cookies
    };
  }

  // 获取团队花名册数据
  async syncRoster() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/team/${this.teamId}/roster/`,
        {
          params: {
            page: 1,
            gender: 'F',
            season_id: 28,
            agegroup: 'UNOV',
            sort: 'name'
          }
        }
      );

      const $ = cheerio.load(response.data);
      const swimmers = [];

      // 解析表格数据
      $('table tr').each((i, row) => {
        if (i === 0) return; // 跳过表头

        const swimmer = {
          name: $(row).find('td:nth-child(1) a').text().trim(),
          swimCloudId: $(row).find('td:nth-child(1) a').attr('href').split('/')[2],
          hometown: $(row).find('td:nth-child(2)').text().trim(),
          score: $(row).find('td:nth-child(3) a').text().trim()
        };

        swimmers.push(swimmer);
      });

      // 更新数据库
      for (const swimmer of swimmers) {
        await User.findOneAndUpdate(
          { swimCloudId: swimmer.swimCloudId },
          {
            $set: {
              name: swimmer.name,
              hometown: swimmer.hometown,
              swimCloudScore: swimmer.score
            }
          },
          { upsert: true }
        );
      }

      return swimmers;
    } catch (error) {
      console.error('Error syncing roster:', error);
      throw error;
    }
  }

  // 同步比赛成绩
  async syncTimes() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/team/${this.teamId}/times/`,
        {
          params: {
            event: 150,
            event_course: 'Y',
            gender: 'M',
            page: 1,
            season_id: 28,
            year: 2024
          }
        }
      );

      const $ = cheerio.load(response.data);
      const performances = [];

      // 解析成绩数据
      $('.performance-row').each((i, row) => {
        const performance = {
          swimCloudId: $(row).attr('data-swimmer-id'),
          time: $(row).find('.time').text().trim(),
          event: $(row).find('.event').text().trim(),
          date: $(row).find('.date').text().trim(),
          competition: $(row).find('.meet').text().trim()
        };

        performances.push(performance);
      });

      // 更新数据库
      for (const perf of performances) {
        const user = await User.findOne({ swimCloudId: perf.swimCloudId });
        if (!user) continue;

        await Performance.findOneAndUpdate(
          {
            user: user._id,
            externalId: `swimcloud_${perf.swimCloudId}_${perf.date}_${perf.event}`
          },
          {
            $set: {
              time: this.convertTimeToMs(perf.time),
              event: this.normalizeEvent(perf.event),
              date: new Date(perf.date),
              source: 'swimcloud'
            }
          },
          { upsert: true }
        );
      }

      return performances;
    } catch (error) {
      console.error('Error syncing times:', error);
      throw error;
    }
  }

  // 同步 West Swim Team 比赛结果
  async syncWestTeamResults() {
    try {
      const response = await axios.get(
        'https://www.westswimteam.com/api/meet-results',
        { headers: this.headers }
      );

      const results = response.data;

      // 更新数据库
      for (const result of results) {
        // 创建或更新比赛记录
        const competition = await Competition.findOneAndUpdate(
          { westTeamId: result.meetId },
          {
            name: result.meetName,
            date: new Date(result.meetDate),
            location: result.location,
            source: 'westteam'
          },
          { upsert: true }
        );

        // 处理每个选手的成绩
        for (const swim of result.swims) {
          const user = await User.findOne({ 
            $or: [
              { westTeamId: swim.swimmerId },
              { name: swim.swimmerName }
            ]
          });

          if (!user) continue;

          await Performance.findOneAndUpdate(
            {
              user: user._id,
              competition: competition._id,
              event: this.normalizeEvent(swim.event)
            },
            {
              time: this.convertTimeToMs(swim.time),
              place: swim.place,
              splits: swim.splits,
              source: 'westteam'
            },
            { upsert: true }
          );
        }
      }

      return results;
    } catch (error) {
      console.error('Error syncing West Team results:', error);
      throw error;
    }
  }

  // 辅助方法：转换时间格式为毫秒
  convertTimeToMs(timeStr) {
    const parts = timeStr.split(':');
    let minutes = 0;
    let seconds = 0;

    if (parts.length === 2) {
      minutes = parseInt(parts[0]);
      seconds = parseFloat(parts[1]);
    } else {
      seconds = parseFloat(parts[0]);
    }

    return (minutes * 60 + seconds) * 1000;
  }

  // 辅助方法：标准化项目名称
  normalizeEvent(eventName) {
    // 根据需要实现项目名称的标准化
    return eventName.trim().toLowerCase();
  }

  // 定期同步数据
  scheduleSync() {
    // 每天凌晨2点同步数据
    const schedule = require('node-schedule');
    
    schedule.scheduleJob('0 2 * * *', async () => {
      try {
        await this.syncRoster();
        await this.syncTimes();
        await this.syncWestTeamResults();
        console.log('Data sync completed successfully');
      } catch (error) {
        console.error('Error in scheduled sync:', error);
      }
    });
  }
}

module.exports = new SwimCloudSyncService(); 