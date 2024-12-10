const axios = require('axios');
const cheerio = require('cheerio');

class CompetitionPlatformService {
  constructor() {
    this.platforms = {
      swimcloud: {
        baseUrl: 'https://www.swimcloud.com/api/v1',
        headers: {
          'User-Agent': 'Swimmer-App/1.0'
        }
      },
      ondeck: {
        baseUrl: 'https://api.ondeck.com/v1',
        headers: {
          'User-Agent': 'Swimmer-App/1.0'
        }
      },
      meet: {
        baseUrl: 'https://api.meet.com/v1',
        headers: {
          'User-Agent': 'Swimmer-App/1.0'
        }
      }
    };
  }

  /**
   * Search for swimmer across platforms
   * @param {Object} query - Search parameters
   * @returns {Array} Search results from all platforms
   */
  async searchSwimmer(query) {
    try {
      const results = await Promise.all([
        this.searchSwimCloud(query),
        this.searchOnDeck(query),
        this.searchMeet(query)
      ]);

      return results.flat().filter(Boolean);
    } catch (error) {
      console.error('Error searching swimmer:', error);
      throw error;
    }
  }

  /**
   * Get swimmer's competition history
   * @param {string} swimmerId - Swimmer ID
   * @param {string} platform - Platform name
   * @returns {Array} Competition history
   */
  async getCompetitionHistory(swimmerId, platform) {
    try {
      switch (platform) {
        case 'swimcloud':
          return await this.getSwimCloudHistory(swimmerId);
        case 'ondeck':
          return await this.getOnDeckHistory(swimmerId);
        case 'meet':
          return await this.getMeetHistory(swimmerId);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      console.error('Error getting competition history:', error);
      throw error;
    }
  }

  /**
   * Search SwimCloud for swimmer
   * @param {Object} query - Search parameters
   * @returns {Array} Search results
   */
  async searchSwimCloud(query) {
    try {
      const response = await axios.get(
        `${this.platforms.swimcloud.baseUrl}/search`,
        {
          params: {
            q: query.name,
            team: query.team,
            age: query.age
          },
          headers: this.platforms.swimcloud.headers
        }
      );

      return response.data.swimmers.map(swimmer => ({
        platform: 'swimcloud',
        id: swimmer.id,
        name: swimmer.name,
        team: swimmer.team,
        age: swimmer.age,
        bestTimes: swimmer.bestTimes
      }));
    } catch (error) {
      console.error('Error searching SwimCloud:', error);
      return [];
    }
  }

  /**
   * Get swimmer's history from SwimCloud
   * @param {string} swimmerId - SwimCloud swimmer ID
   * @returns {Array} Competition history
   */
  async getSwimCloudHistory(swimmerId) {
    try {
      const response = await axios.get(
        `${this.platforms.swimcloud.baseUrl}/swimmers/${swimmerId}/meets`,
        {
          headers: this.platforms.swimcloud.headers
        }
      );

      return response.data.meets.map(meet => ({
        platform: 'swimcloud',
        meetId: meet.id,
        name: meet.name,
        date: meet.date,
        location: meet.location,
        results: meet.results.map(result => ({
          event: result.event,
          time: result.time,
          place: result.place
        }))
      }));
    } catch (error) {
      console.error('Error getting SwimCloud history:', error);
      return [];
    }
  }

  /**
   * Search OnDeck for swimmer
   * @param {Object} query - Search parameters
   * @returns {Array} Search results
   */
  async searchOnDeck(query) {
    try {
      const response = await axios.get(
        `${this.platforms.ondeck.baseUrl}/swimmers/search`,
        {
          params: {
            name: query.name,
            team: query.team,
            age: query.age
          },
          headers: this.platforms.ondeck.headers
        }
      );

      return response.data.swimmers.map(swimmer => ({
        platform: 'ondeck',
        id: swimmer.id,
        name: swimmer.name,
        team: swimmer.team,
        age: swimmer.age,
        bestTimes: swimmer.bestTimes
      }));
    } catch (error) {
      console.error('Error searching OnDeck:', error);
      return [];
    }
  }

  /**
   * Get swimmer's history from OnDeck
   * @param {string} swimmerId - OnDeck swimmer ID
   * @returns {Array} Competition history
   */
  async getOnDeckHistory(swimmerId) {
    try {
      const response = await axios.get(
        `${this.platforms.ondeck.baseUrl}/swimmers/${swimmerId}/competitions`,
        {
          headers: this.platforms.ondeck.headers
        }
      );

      return response.data.competitions.map(comp => ({
        platform: 'ondeck',
        competitionId: comp.id,
        name: comp.name,
        date: comp.date,
        location: comp.location,
        results: comp.results.map(result => ({
          event: result.event,
          time: result.time,
          place: result.place
        }))
      }));
    } catch (error) {
      console.error('Error getting OnDeck history:', error);
      return [];
    }
  }

  /**
   * Search Meet Mobile for swimmer
   * @param {Object} query - Search parameters
   * @returns {Array} Search results
   */
  async searchMeet(query) {
    try {
      const response = await axios.get(
        `${this.platforms.meet.baseUrl}/search`,
        {
          params: {
            swimmer: query.name,
            team: query.team,
            age: query.age
          },
          headers: this.platforms.meet.headers
        }
      );

      return response.data.results.map(result => ({
        platform: 'meet',
        id: result.id,
        name: result.name,
        team: result.team,
        age: result.age,
        bestTimes: result.bestTimes
      }));
    } catch (error) {
      console.error('Error searching Meet Mobile:', error);
      return [];
    }
  }

  /**
   * Get swimmer's history from Meet Mobile
   * @param {string} swimmerId - Meet Mobile swimmer ID
   * @returns {Array} Competition history
   */
  async getMeetHistory(swimmerId) {
    try {
      const response = await axios.get(
        `${this.platforms.meet.baseUrl}/swimmers/${swimmerId}/history`,
        {
          headers: this.platforms.meet.headers
        }
      );

      return response.data.history.map(event => ({
        platform: 'meet',
        eventId: event.id,
        meet: event.meet,
        date: event.date,
        location: event.location,
        results: event.results.map(result => ({
          event: result.event,
          time: result.time,
          place: result.place
        }))
      }));
    } catch (error) {
      console.error('Error getting Meet Mobile history:', error);
      return [];
    }
  }

  /**
   * Sync competition data from all platforms
   * @param {string} userId - User ID
   * @returns {Object} Sync status
   */
  async syncCompetitionData(userId) {
    try {
      const platforms = ['swimcloud', 'ondeck', 'meet'];
      const results = await Promise.all(
        platforms.map(platform => 
          this.syncPlatformData(userId, platform)
        )
      );

      return {
        success: true,
        syncedPlatforms: results.filter(r => r.success).length,
        totalPlatforms: platforms.length,
        details: results
      };
    } catch (error) {
      console.error('Error syncing competition data:', error);
      throw error;
    }
  }

  /**
   * Sync data from specific platform
   * @param {string} userId - User ID
   * @param {string} platform - Platform name
   * @returns {Object} Sync status
   */
  async syncPlatformData(userId, platform) {
    try {
      const user = await User.findById(userId);
      if (!user.platforms || !user.platforms[platform]) {
        return {
          platform,
          success: false,
          error: 'Platform not connected'
        };
      }

      const history = await this.getCompetitionHistory(
        user.platforms[platform].id,
        platform
      );

      // Store competition data
      for (const comp of history) {
        await Competition.findOneAndUpdate(
          {
            userId,
            platform: comp.platform,
            platformCompetitionId: comp.competitionId || comp.meetId || comp.eventId
          },
          comp,
          { upsert: true }
        );
      }

      return {
        platform,
        success: true,
        syncedCompetitions: history.length
      };
    } catch (error) {
      console.error(`Error syncing ${platform} data:`, error);
      return {
        platform,
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new CompetitionPlatformService();
