const OpenAI = require('openai');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const VideoAnalysis = require('../models/videoAnalysis');

class VideoAnalysisService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeVideo(videoPath, event, userId) {
    try {
      // Extract frames from video for analysis
      const frames = await this.extractKeyFrames(videoPath);
      
      // Analyze each frame using OpenAI Vision
      const frameAnalyses = await Promise.all(
        frames.map(frame => this.analyzeFrame(frame, event))
      );

      // Compile comprehensive analysis
      const analysis = this.compileAnalysis(frameAnalyses, event);

      // Generate technical feedback and recommendations
      const feedback = await this.generateFeedback(analysis, event);

      return {
        strokeAnalysis: analysis,
        aiAnalysis: feedback
      };
    } catch (error) {
      console.error('Error analyzing video:', error);
      throw error;
    }
  }

  async extractKeyFrames(videoPath) {
    return new Promise((resolve, reject) => {
      const frames = [];
      const outputDir = path.join(__dirname, '../temp/frames');
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      ffmpeg(videoPath)
        .on('end', () => resolve(frames))
        .on('error', (err) => reject(err))
        .screenshots({
          count: 10,
          folder: outputDir,
          filename: 'frame-%i.png',
          size: '1280x720'
        });
    });
  }

  async analyzeFrame(framePath, event) {
    const image = fs.readFileSync(framePath);
    const base64Image = image.toString('base64');

    const prompt = `Analyze this swimming frame for ${event.replace(/_/g, ' ')}. 
    Focus on:
    1. Body position and alignment
    2. Stroke technique
    3. Head position
    4. Arm movement
    5. Leg movement
    6. Overall efficiency
    
    Provide detailed technical analysis and identify any issues.`;

    const response = await this.openai.createImageAnalysis({
      image: `data:image/jpeg;base64,${base64Image}`,
      model: "vision-v2",
      prompt: prompt
    });

    // Clean up frame file
    fs.unlinkSync(framePath);

    return response.data.choices[0].message.content;
  }

  compileAnalysis(frameAnalyses, event) {
    // Extract common patterns and key observations
    const analysisPoints = frameAnalyses.flatMap(analysis => 
      analysis.split('\n').filter(point => point.trim())
    );

    // Group observations by category
    const categories = {
      bodyPosition: [],
      armMovement: [],
      legMovement: [],
      timing: [],
      general: []
    };

    analysisPoints.forEach(point => {
      if (point.toLowerCase().includes('body') || point.toLowerCase().includes('position')) {
        categories.bodyPosition.push(point);
      } else if (point.toLowerCase().includes('arm') || point.toLowerCase().includes('stroke')) {
        categories.armMovement.push(point);
      } else if (point.toLowerCase().includes('leg') || point.toLowerCase().includes('kick')) {
        categories.legMovement.push(point);
      } else if (point.toLowerCase().includes('timing') || point.toLowerCase().includes('rhythm')) {
        categories.timing.push(point);
      } else {
        categories.general.push(point);
      }
    });

    return {
      strokeType: this.getStrokeTypeFromEvent(event),
      bodyPosition: this.summarizeCategory(categories.bodyPosition),
      armMovement: this.summarizeCategory(categories.armMovement),
      legMovement: this.summarizeCategory(categories.legMovement),
      timing: this.summarizeCategory(categories.timing)
    };
  }

  async generateFeedback(analysis, event) {
    const prompt = `
    Based on the following stroke analysis for ${event.replace(/_/g, ' ')}:
    ${JSON.stringify(analysis, null, 2)}

    Please provide:
    1. Technical feedback points
    2. Key areas for improvement
    3. Notable strengths
    4. Specific drills to address technique issues

    Format the response as JSON with the following structure:
    {
      "technicalFeedback": [],
      "improvements": [],
      "strengths": [],
      "recommendedDrills": [
        {
          "name": "",
          "description": "",
          "focus": ""
        }
      ]
    }`;

    const completion = await this.openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert swimming coach specializing in technique analysis and improvement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    return JSON.parse(completion.data.choices[0].message.content);
  }

  getStrokeTypeFromEvent(event) {
    if (event.includes('FR')) return 'freestyle';
    if (event.includes('BK')) return 'backstroke';
    if (event.includes('BR')) return 'breaststroke';
    if (event.includes('FL')) return 'butterfly';
    return 'freestyle'; // default
  }

  summarizeCategory(points) {
    // Remove duplicates and combine similar observations
    const uniquePoints = [...new Set(points)];
    return uniquePoints.join(' ');
  }

  async calculateMetrics(videoPath) {
    // Use ffmpeg to extract video metadata and calculate basic metrics
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const duration = metadata.format.duration;
        const resolution = {
          width: metadata.streams[0].width,
          height: metadata.streams[0].height
        };

        resolve({
          duration,
          resolution
        });
      });
    });
  }

  async compareVideos(mainVideoPath, comparisonVideoPath, event) {
    try {
      // Extract frames from both videos
      const mainFrames = await this.extractKeyFrames(mainVideoPath);
      const comparisonFrames = await this.extractKeyFrames(comparisonVideoPath);

      // Analyze corresponding frames
      const frameComparisons = await Promise.all(
        mainFrames.map(async (mainFrame, index) => {
          const comparisonFrame = comparisonFrames[index];
          return this.compareFrames(mainFrame, comparisonFrame, event);
        })
      );

      // Compile comparison analysis
      return this.compileComparison(frameComparisons, event);
    } catch (error) {
      console.error('Error comparing videos:', error);
      throw error;
    }
  }

  async compareFrames(mainFrame, comparisonFrame, event) {
    const mainImage = fs.readFileSync(mainFrame);
    const comparisonImage = fs.readFileSync(comparisonFrame);
    const mainBase64 = mainImage.toString('base64');
    const comparisonBase64 = comparisonImage.toString('base64');

    const prompt = `Compare these two swimming technique frames for ${event.replace(/_/g, ' ')}. 
    Focus on:
    1. Body position and alignment differences
    2. Stroke technique variations
    3. Head position comparison
    4. Arm movement differences
    5. Leg movement comparison
    6. Overall efficiency differences

    Provide a detailed comparison highlighting key similarities and differences.`;

    const response = await this.openai.createImageAnalysis({
      images: [
        `data:image/jpeg;base64,${mainBase64}`,
        `data:image/jpeg;base64,${comparisonBase64}`
      ],
      model: "vision-v2",
      prompt: prompt
    });

    // Clean up frame files
    fs.unlinkSync(mainFrame);
    fs.unlinkSync(comparisonFrame);

    return response.data.choices[0].message.content;
  }

  compileComparison(frameComparisons, event) {
    // Extract key points from all frame comparisons
    const allPoints = frameComparisons.flatMap(comparison => 
      comparison.split('\n').filter(point => point.trim())
    );

    // Categorize observations
    const categories = {
      similarities: [],
      differences: [],
      improvements: [],
      recommendations: []
    };

    allPoints.forEach(point => {
      const lowerPoint = point.toLowerCase();
      if (lowerPoint.includes('similar') || lowerPoint.includes('both')) {
        categories.similarities.push(point);
      } else if (lowerPoint.includes('differ') || lowerPoint.includes('contrast')) {
        categories.differences.push(point);
      } else if (lowerPoint.includes('improve') || lowerPoint.includes('could')) {
        categories.improvements.push(point);
      } else if (lowerPoint.includes('recommend') || lowerPoint.includes('should')) {
        categories.recommendations.push(point);
      }
    });

    // Remove duplicates and summarize
    return {
      similarities: [...new Set(categories.similarities)],
      differences: [...new Set(categories.differences)],
      improvements: [...new Set(categories.improvements)],
      recommendations: [...new Set(categories.recommendations)]
    };
  }
}

module.exports = new VideoAnalysisService();
