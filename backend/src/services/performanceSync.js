const Performance = require('../models/performance');
const swimCloudApi = require('../apis/swimcloud');
const westTeamApi = require('../apis/westteam');

class PerformanceSyncService {
  // 从SwimCloud同步数据
  async syncFromSwimCloud(userId, swimCloudId) {
    try {
      // 获取SwimCloud数据
      const swimmerData = await swimCloudApi.getSwimmerData(swimCloudId);
      
      // 处理每个成绩
      for (const result of swimmerData.results) {
        await Performance.findOneAndUpdate(
          {
            user: userId,
            source: 'swimcloud',
            sourceId: result.id
          },
          {
            event: this.normalizeEvent(result.event),
            time: {
              value: this.convertToMs(result.time),
              displayValue: result.time
            },
            date: result.date,
            splits: result.splits?.map(s => ({
              distance: s.distance,
              time: this.convertToMs(s.time)
            }))
          },
          { upsert: true }
        );
      }
    } catch (error) {
      console.error('SwimCloud sync error:', error);
      throw error;
    }
  }

  // 从West Team同步数据
  async syncFromWestTeam(userId, westTeamId) {
    try {
      const results = await westTeamApi.getSwimmerResults(westTeamId);
      
      for (const result of results) {
        await Performance.findOneAndUpdate(
          {
            user: userId,
            source: 'westteam',
            sourceId: result.id
          },
          {
            event: result.event,
            time: {
              value: result.time,
              displayValue: this.formatTime(result.time)
            },
            date: result.date,
            splits: result.splits
          },
          { upsert: true }
        );
      }
    } catch (error) {
      console.error('West Team sync error:', error);
      throw error;
    }
  }

  // 检查并更新达标情况
  async checkStandards(performance) {
    const standards = await Standards.findOne({
      event: performance.event,
      ageGroup: this.getAgeGroup(performance.user.profile.age)
    });

    if (standards) {
      performance.standardsAchieved = {
        AAAA: performance.time.value <= standards.AAAA,
        AAA: performance.time.value <= standards.AAA,
        AA: performance.time.value <= standards.AA,
        A: performance.time.value <= standards.A,
        BB: performance.time.value <= standards.BB,
        B: performance.time.value <= standards.B
      };
      await performance.save();
    }
  }
} 