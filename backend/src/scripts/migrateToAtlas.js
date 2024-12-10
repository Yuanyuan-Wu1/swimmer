const mongoose = require('mongoose');
require('dotenv').config();

// Source (Local) MongoDB URI
const SOURCE_URI = 'mongodb://127.0.0.1:27017/swimmer';

// Target (Atlas) MongoDB URI from .env
const TARGET_URI = process.env.MONGODB_URI;

// Collections to migrate
const COLLECTIONS = ['standards', 'performances', 'medals', 'users', 'training_plans'];

async function migrateCollection(sourceDb, targetDb, collectionName) {
  console.log(`Migrating collection: ${collectionName}`);
  
  try {
    // Get all documents from source collection
    const documents = await sourceDb.collection(collectionName).find({}).toArray();
    
    if (documents.length > 0) {
      // Insert documents into target collection
      await targetDb.collection(collectionName).insertMany(documents);
      console.log(`✓ Migrated ${documents.length} documents from ${collectionName}`);
    } else {
      console.log(`- No documents found in ${collectionName}`);
    }
  } catch (error) {
    console.error(`Error migrating ${collectionName}:`, error);
  }
}

async function migrateData() {
  let sourceClient, targetClient;

  try {
    // Connect to both databases
    sourceClient = await mongoose.connect(SOURCE_URI);
    console.log('Connected to source database');

    targetClient = await mongoose.createConnection(TARGET_URI);
    console.log('Connected to target database');

    // Migrate each collection
    for (const collection of COLLECTIONS) {
      await migrateCollection(
        sourceClient.connection.db,
        targetClient.db,
        collection
      );
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close connections
    if (sourceClient) await sourceClient.disconnect();
    if (targetClient) await targetClient.close();
  }
}

migrateData();
