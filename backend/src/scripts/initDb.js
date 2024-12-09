const mongoose = require('mongoose');
const standards = require('../data/standards');
require('dotenv').config();

// Define Schema for Standards
const standardSchema = new mongoose.Schema({
  organization: String,
  courseType: String,
  event: String,
  ageGroup: String,
  level: String,
  time: String
});

const Standard = mongoose.model('Standard', standardSchema);

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing standards
    await Standard.deleteMany({});
    console.log('Cleared existing standards');

    // Transform and insert standards
    const standardsToInsert = [];
    
    // Process USA Swimming standards
    Object.entries(standards.USA_SWIMMING).forEach(([courseType, events]) => {
      Object.entries(events).forEach(([event, ageGroups]) => {
        Object.entries(ageGroups).forEach(([ageGroup, levels]) => {
          Object.entries(levels).forEach(([level, time]) => {
            standardsToInsert.push({
              organization: 'USA_SWIMMING',
              courseType,
              event,
              ageGroup,
              level,
              time
            });
          });
        });
      });
    });

    // Process FINA points
    Object.entries(standards.FINA_POINTS).forEach(([courseType, events]) => {
      Object.entries(events).forEach(([event, time]) => {
        standardsToInsert.push({
          organization: 'FINA_POINTS',
          courseType,
          event,
          ageGroup: 'ALL',
          level: 'BASE',
          time
        });
      });
    });

    // Insert all standards
    await Standard.insertMany(standardsToInsert);
    console.log('Inserted standards data');

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initializeDatabase();
