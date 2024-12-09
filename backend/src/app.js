const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const trainingRoutes = require('./routes/training');
const competitionRoutes = require('./routes/competition');
const performanceRoutes = require('./routes/performance');
const medalRoutes = require('./routes/medal');
const trainingPlanRoutes = require('./routes/trainingPlan');
const videoAnalysisRoutes = require('./routes/videoAnalysis');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Test route
app.get('/', (req, res) => {
  console.log('Received request to root endpoint');
  res.json({ message: 'Welcome to Swimmer API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/competition', competitionRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/medal', medalRoutes);
app.use('/api/training-plan', trainingPlanRoutes);
app.use('/api/video-analysis', videoAnalysisRoutes);
app.use('/api', dashboardRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
console.log('Attempting to start server on port', PORT);

const server = app.listen(PORT, '0.0.0.0', (error) => {
  if (error) {
    console.error('Failed to start server:', error);
    return;
  }
  console.log(`Server is running on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
