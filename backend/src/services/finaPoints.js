// Base times in seconds
const BASE_TIMES = {
  // SCY Base Times
  SCY: {
    '50_FR': 18.47,
    '100_FR': 40.89,
    '200_FR': 89.79,
    '500_FR': 236.36,
    '1000_FR': 500.23,
    '1650_FR': 841.50,
    '50_BK': 21.07,
    '100_BK': 45.89,
    '200_BK': 98.76,
    '50_BR': 23.82,
    '100_BR': 51.73,
    '200_BR': 112.45,
    '50_FL': 20.24,
    '100_FL': 44.84,
    '200_FL': 98.15,
    '100_IM': 46.96,
    '200_IM': 103.29,
    '400_IM': 223.84
  },
  // LCM Base Times
  LCM: {
    '50_FR': 20.91,
    '100_FR': 46.91,
    '200_FR': 102.00,
    '400_FR': 220.07,
    '800_FR': 452.12,
    '1500_FR': 871.30,
    '50_BK': 24.00,
    '100_BK': 51.85,
    '200_BK': 111.92,
    '50_BR': 25.95,
    '100_BR': 56.88,
    '200_BR': 126.12,
    '50_FL': 22.27,
    '100_FL': 49.45,
    '200_FL': 110.73,
    '200_IM': 114.00,
    '400_IM': 243.84
  }
};

class FinaPointsService {
  /**
   * Calculate FINA points for a given performance
   * @param {number} time - Performance time in seconds
   * @param {string} event - Event code (e.g., '50_FR_SCY')
   * @returns {number} FINA points
   */
  calculatePoints(time, event) {
    try {
      const [distance, stroke, course] = event.split('_');
      const baseTimeKey = `${distance}_${stroke}`;
      const baseTime = BASE_TIMES[course][baseTimeKey];

      if (!baseTime) {
        throw new Error(`No base time found for event: ${event}`);
      }

      // FINA Points Formula: (Base Time / Actual Time)^3 * 1000
      const points = Math.pow(baseTime / time, 3) * 1000;
      return Math.round(points);
    } catch (error) {
      console.error('Error calculating FINA points:', error);
      return 0;
    }
  }

  /**
   * Calculate the time needed to achieve a specific FINA point score
   * @param {number} points - Target FINA points
   * @param {string} event - Event code
   * @returns {number} Required time in seconds
   */
  calculateTimeForPoints(points, event) {
    try {
      const [distance, stroke, course] = event.split('_');
      const baseTimeKey = `${distance}_${stroke}`;
      const baseTime = BASE_TIMES[course][baseTimeKey];

      if (!baseTime) {
        throw new Error(`No base time found for event: ${event}`);
      }

      // Reverse FINA Points Formula: Base Time / (Points/1000)^(1/3)
      const time = baseTime / Math.pow(points / 1000, 1/3);
      return Math.round(time * 100) / 100;
    } catch (error) {
      console.error('Error calculating time for FINA points:', error);
      return 0;
    }
  }

  /**
   * Get time standards based on FINA points
   * @param {string} event - Event code
   * @returns {Object} Time standards for different achievement levels
   */
  getTimeStandards(event) {
    const standards = {
      'Elite': 900,
      'National': 800,
      'Junior National': 700,
      'Regional': 600,
      'Age Group': 500
    };

    const timeStandards = {};
    for (const [level, points] of Object.entries(standards)) {
      timeStandards[level] = this.calculateTimeForPoints(points, event);
    }

    return timeStandards;
  }

  /**
   * Convert time between different formats
   * @param {number} time - Time in seconds
   * @returns {Object} Different time formats
   */
  formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    
    let formatted;
    if (minutes > 0) {
      formatted = `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
    } else {
      formatted = seconds.toFixed(2);
    }

    return {
      decimal: time,
      formatted,
      components: {
        minutes,
        seconds: Math.floor(seconds),
        hundredths: Math.round((seconds % 1) * 100)
      }
    };
  }

  /**
   * Parse formatted time string to seconds
   * @param {string} timeStr - Time string (e.g., "1:23.45" or "23.45")
   * @returns {number} Time in seconds
   */
  parseTime(timeStr) {
    try {
      const parts = timeStr.split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0]);
        const seconds = parseFloat(parts[1]);
        return minutes * 60 + seconds;
      } else {
        return parseFloat(timeStr);
      }
    } catch (error) {
      console.error('Error parsing time:', error);
      return 0;
    }
  }

  /**
   * Calculate pace per 100
   * @param {number} time - Total time in seconds
   * @param {number} distance - Distance in yards/meters
   * @returns {Object} Pace information
   */
  calculatePace(time, distance) {
    const pacePerHundred = (time / distance) * 100;
    return {
      pacePerHundred: this.formatTime(pacePerHundred).formatted,
      splitTimes: Array.from({ length: Math.ceil(distance / 100) }, (_, i) => 
        this.formatTime(pacePerHundred * (i + 1)).formatted
      )
    };
  }

  /**
   * Calculate race strategy based on event
   * @param {string} event - Event code
   * @param {number} targetTime - Target time in seconds
   * @returns {Object} Race strategy with splits
   */
  calculateRaceStrategy(event, targetTime) {
    const [distance] = event.split('_');
    const distanceNum = parseInt(distance);
    
    let strategy = {
      splits: [],
      pacing: '',
      description: ''
    };

    // Different pacing strategies based on event distance
    if (distanceNum <= 100) {
      // Sprint events: slightly faster first 50
      const firstHalf = targetTime * 0.485;
      const secondHalf = targetTime * 0.515;
      strategy.splits = [firstHalf, secondHalf];
      strategy.pacing = 'Sprint';
      strategy.description = 'Fast start, maintain speed';
    } else if (distanceNum <= 200) {
      // 200: controlled start, build middle, strong finish
      const quarter = targetTime / 4;
      strategy.splits = [
        quarter * 0.95,  // Controlled start
        quarter * 1.01,  // Build
        quarter * 1.02,  // Hold
        quarter * 1.02   // Finish
      ];
      strategy.pacing = 'Build';
      strategy.description = 'Controlled start, build through middle, strong finish';
    } else {
      // Distance: even pacing with slight negative split
      const numHundreds = distanceNum / 100;
      const baseHundred = targetTime / numHundreds;
      strategy.splits = Array.from({ length: numHundreds }, (_, i) => {
        const factor = 1 + (i - numHundreds/2) * 0.005; // Slight adjustment for negative split
        return baseHundred * factor;
      });
      strategy.pacing = 'Even';
      strategy.description = 'Even pacing with slight negative split';
    }

    // Format all splits
    strategy.splits = strategy.splits.map(split => this.formatTime(split).formatted);
    
    return strategy;
  }
}

module.exports = new FinaPointsService();
