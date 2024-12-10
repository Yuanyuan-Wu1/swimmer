const Performance = require('../models/performance');
const User = require('../models/user');
const finaPointsService = require('./finaPoints');
const mongoose = require('mongoose');

class RankingsService {
  /**
   * Get rankings for a specific event
   * @param {string} event - Event code
   * @param {Object} filters - Ranking filters (age group, gender, etc.)
   * @param {number} limit - Number of results to return
   * @returns {Array} Ranked performances
   */
  async getEventRankings(event, filters = {}, limit = 100) {
    try {
      const query = { event };

      // Apply age group filter
      if (filters.ageGroup) {
        const [minAge, maxAge] = filters.ageGroup.split('-').map(Number);
        query['athlete.age'] = { $gte: minAge, $lte: maxAge };
      }

      // Apply gender filter
      if (filters.gender) {
        query['athlete.gender'] = filters.gender;
      }

      // Apply date range filter
      if (filters.dateRange) {
        query.date = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      }

      const performances = await Performance.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'athlete',
            foreignField: '_id',
            as: 'athleteInfo'
          }
        },
        { $unwind: '$athleteInfo' },
        {
          $project: {
            time: 1,
            date: 1,
            competition: 1,
            finaPoints: 1,
            athlete: {
              name: '$athleteInfo.name',
              age: '$athleteInfo.age',
              gender: '$athleteInfo.gender',
              team: '$athleteInfo.team'
            }
          }
        },
        { $sort: { time: 1 } },
        { $limit: limit }
      ]);

      // Add ranking information
      return performances.map((perf, index) => ({
        ...perf,
        rank: index + 1,
        formattedTime: finaPointsService.formatTime(perf.time).formatted
      }));
    } catch (error) {
      console.error('Error getting event rankings:', error);
      throw error;
    }
  }

  /**
   * Get rankings by FINA points across all events
   * @param {Object} filters - Ranking filters
   * @param {number} limit - Number of results to return
   * @returns {Array} Ranked performances by FINA points
   */
  async getFinaPointsRankings(filters = {}, limit = 100) {
    try {
      const query = {};

      if (filters.ageGroup) {
        const [minAge, maxAge] = filters.ageGroup.split('-').map(Number);
        query['athlete.age'] = { $gte: minAge, $lte: maxAge };
      }

      if (filters.gender) {
        query['athlete.gender'] = filters.gender;
      }

      if (filters.dateRange) {
        query.date = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      }

      const performances = await Performance.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'athlete',
            foreignField: '_id',
            as: 'athleteInfo'
          }
        },
        { $unwind: '$athleteInfo' },
        {
          $project: {
            event: 1,
            time: 1,
            date: 1,
            competition: 1,
            finaPoints: 1,
            athlete: {
              name: '$athleteInfo.name',
              age: '$athleteInfo.age',
              gender: '$athleteInfo.gender',
              team: '$athleteInfo.team'
            }
          }
        },
        { $sort: { finaPoints: -1 } },
        { $limit: limit }
      ]);

      return performances.map((perf, index) => ({
        ...perf,
        rank: index + 1,
        formattedTime: finaPointsService.formatTime(perf.time).formatted
      }));
    } catch (error) {
      console.error('Error getting FINA points rankings:', error);
      throw error;
    }
  }

  /**
   * Get athlete rankings based on average FINA points
   * @param {Object} filters - Ranking filters
   * @param {number} limit - Number of results to return
   * @returns {Array} Ranked athletes
   */
  async getAthleteRankings(filters = {}, limit = 50) {
    try {
      const query = {};

      if (filters.ageGroup) {
        const [minAge, maxAge] = filters.ageGroup.split('-').map(Number);
        query.age = { $gte: minAge, $lte: maxAge };
      }

      if (filters.gender) {
        query.gender = filters.gender;
      }

      const athletes = await User.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'performances',
            localField: '_id',
            foreignField: 'athlete',
            as: 'performances'
          }
        },
        {
          $project: {
            name: 1,
            age: 1,
            gender: 1,
            team: 1,
            performanceCount: { $size: '$performances' },
            averageFinaPoints: {
              $avg: '$performances.finaPoints'
            },
            topFinaPoints: {
              $max: '$performances.finaPoints'
            }
          }
        },
        { $sort: { averageFinaPoints: -1 } },
        { $limit: limit }
      ]);

      return athletes.map((athlete, index) => ({
        ...athlete,
        rank: index + 1,
        averageFinaPoints: Math.round(athlete.averageFinaPoints)
      }));
    } catch (error) {
      console.error('Error getting athlete rankings:', error);
      throw error;
    }
  }

  /**
   * Get team rankings based on average FINA points
   * @param {Object} filters - Ranking filters
   * @param {number} limit - Number of results to return
   * @returns {Array} Ranked teams
   */
  async getTeamRankings(filters = {}, limit = 25) {
    try {
      const query = {};

      if (filters.dateRange) {
        query.date = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      }

      const teams = await Performance.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'athlete',
            foreignField: '_id',
            as: 'athleteInfo'
          }
        },
        { $unwind: '$athleteInfo' },
        {
          $group: {
            _id: '$athleteInfo.team',
            athleteCount: { $addToSet: '$athlete' },
            averageFinaPoints: { $avg: '$finaPoints' },
            topFinaPoints: { $max: '$finaPoints' },
            performanceCount: { $sum: 1 }
          }
        },
        {
          $project: {
            team: '$_id',
            athleteCount: { $size: '$athleteCount' },
            averageFinaPoints: 1,
            topFinaPoints: 1,
            performanceCount: 1
          }
        },
        { $sort: { averageFinaPoints: -1 } },
        { $limit: limit }
      ]);

      return teams.map((team, index) => ({
        ...team,
        rank: index + 1,
        averageFinaPoints: Math.round(team.averageFinaPoints)
      }));
    } catch (error) {
      console.error('Error getting team rankings:', error);
      throw error;
    }
  }
}

module.exports = new RankingsService();
