const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const VideoAnalysis = require('../models/videoAnalysis');
const videoAnalysisService = require('../services/videoAnalysis');

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|mov|avi/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Videos Only!');
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Upload and analyze video
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { event } = req.body;
    if (!event) {
      return res.status(400).json({ error: 'Event type is required' });
    }

    // Create initial video analysis record
    const videoAnalysis = new VideoAnalysis({
      user: req.user._id,
      event,
      video: {
        url: req.file.path,
        filename: req.file.filename
      },
      status: 'analyzing'
    });
    await videoAnalysis.save();

    // Start analysis process
    videoAnalysisService.analyzeVideo(req.file.path, event, req.user._id)
      .then(async (analysis) => {
        videoAnalysis.strokeAnalysis = analysis.strokeAnalysis;
        videoAnalysis.aiAnalysis = analysis.aiAnalysis;
        videoAnalysis.status = 'completed';
        await videoAnalysis.save();
      })
      .catch(async (error) => {
        console.error('Error in video analysis:', error);
        videoAnalysis.status = 'failed';
        await videoAnalysis.save();
      });

    res.status(201).json({
      message: 'Video uploaded and analysis started',
      analysisId: videoAnalysis._id
    });
  } catch (error) {
    console.error('Error in video upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get analysis status and results
router.get('/analysis/:id', auth, async (req, res) => {
  try {
    const analysis = await VideoAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all analyses for a user
router.get('/analyses', auth, async (req, res) => {
  try {
    const analyses = await VideoAnalysis.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add annotation to video analysis
router.post('/analysis/:id/annotations', auth, async (req, res) => {
  try {
    const { timestamp, description, type } = req.body;
    const analysis = await VideoAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    analysis.annotations.push({
      timestamp,
      description,
      type
    });

    await analysis.save();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete video analysis
router.delete('/analysis/:id', auth, async (req, res) => {
  try {
    const analysis = await VideoAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Delete video file
    if (analysis.video.url) {
      fs.unlink(analysis.video.url, (err) => {
        if (err) console.error('Error deleting video file:', err);
      });
    }

    await analysis.delete();
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload comparison video
router.post('/comparison/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { analysisId, type } = req.body;
    const analysis = await VideoAnalysis.findOne({
      _id: analysisId,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    analysis.comparisonVideo = {
      url: req.file.path,
      filename: req.file.filename,
      uploadDate: new Date(),
      type: type || 'custom'
    };

    // Generate comparison analysis using AI
    const comparisonAnalysis = await videoAnalysisService.compareVideos(
      analysis.video.url,
      req.file.path,
      analysis.event
    );

    analysis.comparisonAnalysis = comparisonAnalysis;
    await analysis.save();

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Error uploading comparison video:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update comparison video settings
router.patch('/comparison/:id', auth, async (req, res) => {
  try {
    const { type, description } = req.body;
    const analysis = await VideoAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (!analysis.comparisonVideo) {
      return res.status(400).json({ error: 'No comparison video found' });
    }

    analysis.comparisonVideo.type = type || analysis.comparisonVideo.type;
    analysis.comparisonVideo.description = description || analysis.comparisonVideo.description;

    await analysis.save();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comparison video
router.delete('/comparison/:id', auth, async (req, res) => {
  try {
    const analysis = await VideoAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (!analysis.comparisonVideo) {
      return res.status(400).json({ error: 'No comparison video found' });
    }

    // Delete comparison video file
    if (analysis.comparisonVideo.url) {
      fs.unlink(analysis.comparisonVideo.url, (err) => {
        if (err) console.error('Error deleting comparison video file:', err);
      });
    }

    analysis.comparisonVideo = undefined;
    analysis.comparisonAnalysis = undefined;
    await analysis.save();

    res.json({ message: 'Comparison video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
