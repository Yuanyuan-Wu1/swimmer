const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Database Connection', () => {
  let mongoServer;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  test('should connect to database', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
}); 