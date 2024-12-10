module.exports = {
  westTeam: {
    baseUrl: 'https://www.westswimteam.com/api',
    endpoints: {
      meetResults: '/meet-results',
      swimmers: '/swimmers'
    }
  },
  swimCloud: {
    baseUrl: 'https://www.swimcloud.com/api',
    endpoints: {
      swimmer: '/swimmer',
      times: '/times'
    }
  },
  garmin: {
    baseUrl: 'https://api.garmin.com',
    endpoints: {
      activities: '/wellness/activities',
      metrics: '/wellness/metrics'
    }
  },
  appleHealth: {
    endpoints: {
      workouts: 'workouts',
      vitals: 'vitals'
    }
  }
}; 