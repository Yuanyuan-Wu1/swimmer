const axios = require('axios');
const Performance = require('../models/performance');
const HealthData = require('../models/healthData');

class TrainingAIService {
  constructor() {
    this.openaiConfig = {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1'
    };
  }

  /**
   * Generate personalized training plan
   * @param {string} userId - User ID
   * @returns {Object} Training plan
   */
  async generateTrainingPlan(userId) {
    try {
      // 收集用户数据
      const [
        performances,
        healthData,
        goals,
        recentTraining
      ] = await Promise.all([
        this.getPerformanceHistory(userId),
        this.getHealthData(userId),
        this.getUserGoals(userId),
        this.getRecentTraining(userId)
      ]);

      // 准备AI提示
      const prompt = this.buildTrainingPrompt({
        performances,
        healthData,
        goals,
        recentTraining
      });

      // 调用GPT-4生成训练计划
      const response = await axios.post(
        `${this.openaiConfig.baseUrl}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: 'You are an expert swimming coach with deep knowledge of training methodology, physiology, and performance optimization.'
          }, {
            role: 'user',
            content: prompt
          }],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 解析和格式化AI响应
      const plan = this.parseTrainingPlan(response.data.choices[0].message.content);

      // 存储训练计划
      await this.storeTrainingPlan(userId, plan);

      return plan;
    } catch (error) {
      console.error('Error generating training plan:', error);
      throw error;
    }
  }

  /**
   * Analyze technique using video
   * @param {string} userId - User ID
   * @param {string} videoUrl - Video URL
   * @returns {Object} Technique analysis
   */
  async analyzeTechnique(userId, videoUrl) {
    try {
      // 调用GPT-4 Vision API分析视频
      const response = await axios.post(
        `${this.openaiConfig.baseUrl}/chat/completions`,
        {
          model: 'gpt-4-vision-preview',
          messages: [{
            role: 'system',
            content: 'You are an expert swimming technique analyst.'
          }, {
            role: 'user',
            content: [
              { type: 'text', text: 'Please analyze this swimming technique video:' },
              { type: 'image_url', url: videoUrl }
            ]
          }],
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 解析和格式化分析结果
      const analysis = this.parseTechniqueAnalysis(
        response.data.choices[0].message.content
      );

      // 存储分析结果
      await this.storeTechniqueAnalysis(userId, analysis);

      return analysis;
    } catch (error) {
      console.error('Error analyzing technique:', error);
      throw error;
    }
  }

  /**
   * Get performance predictions
   * @param {string} userId - User ID
   * @param {string} event - Event code
   * @returns {Object} Performance predictions
   */
  async getPredictions(userId, event) {
    try {
      // 收集历史数据
      const [
        performances,
        training,
        health
      ] = await Promise.all([
        this.getPerformanceHistory(userId),
        this.getTrainingHistory(userId),
        this.getHealthData(userId)
      ]);

      // 准备机器学习数据
      const features = this.prepareMLFeatures({
        performances,
        training,
        health
      });

      // 调用预测模型
      const predictions = await this.predictPerformance(features, event);

      return {
        event,
        predictions: {
          nextMeet: predictions.nextMeet,
          season: predictions.season,
          potential: predictions.potential
        },
        confidence: predictions.confidence,
        factors: predictions.factors
      };
    } catch (error) {
      console.error('Error getting predictions:', error);
      throw error;
    }
  }

  /**
   * Get recovery recommendations
   * @param {string} userId - User ID
   * @returns {Object} Recovery recommendations
   */
  async getRecoveryRecommendations(userId) {
    try {
      // 收集健康和训练数据
      const [
        recentTraining,
        healthMetrics,
        sleepData,
        stressLevels
      ] = await Promise.all([
        this.getRecentTraining(userId),
        this.getHealthMetrics(userId),
        this.getSleepData(userId),
        this.getStressLevels(userId)
      ]);

      // 分析恢复状态
      const recoveryStatus = this.analyzeRecoveryStatus({
        training: recentTraining,
        health: healthMetrics,
        sleep: sleepData,
        stress: stressLevels
      });

      // 生成建议
      const recommendations = this.generateRecoveryRecommendations(recoveryStatus);

      return {
        status: recoveryStatus,
        recommendations,
        nextTrainingAdjustments: recommendations.trainingAdjustments,
        lifestyle: recommendations.lifestyleChanges
      };
    } catch (error) {
      console.error('Error getting recovery recommendations:', error);
      throw error;
    }
  }

  /**
   * Get nutrition recommendations
   * @param {string} userId - User ID
   * @returns {Object} Nutrition recommendations
   */
  async getNutritionRecommendations(userId) {
    try {
      // 收集相关数据
      const [
        trainingLoad,
        healthData,
        goals
      ] = await Promise.all([
        this.getTrainingLoad(userId),
        this.getHealthData(userId),
        this.getUserGoals(userId)
      ]);

      // 生成营养建议
      const recommendations = await this.generateNutritionPlan({
        training: trainingLoad,
        health: healthData,
        goals
      });

      return {
        dailyPlan: recommendations.dailyPlan,
        preworkout: recommendations.preworkout,
        postworkout: recommendations.postworkout,
        hydration: recommendations.hydration,
        supplements: recommendations.supplements
      };
    } catch (error) {
      console.error('Error getting nutrition recommendations:', error);
      throw error;
    }
  }

  /**
   * Build training prompt
   * @param {Object} data - User data
   * @returns {string} AI prompt
   */
  buildTrainingPrompt(data) {
    return `
      Please analyze the following swimmer's data and generate a personalized training plan:

      Recent Performances:
      ${JSON.stringify(data.performances, null, 2)}

      Health Metrics:
      ${JSON.stringify(data.healthData, null, 2)}

      Goals:
      ${JSON.stringify(data.goals, null, 2)}

      Recent Training:
      ${JSON.stringify(data.recentTraining, null, 2)}

      Please provide:
      1. Weekly training schedule
      2. Specific workouts for each session
      3. Technical focus points
      4. Recovery recommendations
      5. Performance targets
    `;
  }

  /**
   * Parse training plan from AI response
   * @param {string} response - AI response
   * @returns {Object} Structured training plan
   */
  parseTrainingPlan(response) {
    // 实现解析逻辑
    const plan = {
      weekly: [],
      technical: [],
      recovery: [],
      targets: []
    };

    // 解析周计划
    const weeklyMatch = response.match(/Weekly Schedule:([\s\S]*?)(?=Technical Focus|$)/i);
    if (weeklyMatch) {
      plan.weekly = weeklyMatch[1].trim().split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [day, ...details] = line.split(':');
          return {
            day: day.trim(),
            workout: details.join(':').trim()
          };
        });
    }

    // 解析技术重点
    const technicalMatch = response.match(/Technical Focus:([\s\S]*?)(?=Recovery|$)/i);
    if (technicalMatch) {
      plan.technical = technicalMatch[1].trim().split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());
    }

    // 解析恢复建议
    const recoveryMatch = response.match(/Recovery:([\s\S]*?)(?=Targets|$)/i);
    if (recoveryMatch) {
      plan.recovery = recoveryMatch[1].trim().split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());
    }

    // 解析目标
    const targetsMatch = response.match(/Targets:([\s\S]*?)$/i);
    if (targetsMatch) {
      plan.targets = targetsMatch[1].trim().split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [event, target] = line.split(':');
          return {
            event: event.trim(),
            target: target.trim()
          };
        });
    }

    return plan;
  }

  /**
   * Parse technique analysis from AI response
   * @param {string} response - AI response
   * @returns {Object} Structured analysis
   */
  parseTechniqueAnalysis(response) {
    const analysis = {
      overview: '',
      strengths: [],
      improvements: [],
      drills: []
    };

    // 解析总体评价
    const overviewMatch = response.match(/Overview:([\s\S]*?)(?=Strengths|$)/i);
    if (overviewMatch) {
      analysis.overview = overviewMatch[1].trim();
    }

    // 解析优点
    const strengthsMatch = response.match(/Strengths:([\s\S]*?)(?=Areas for Improvement|$)/i);
    if (strengthsMatch) {
      analysis.strengths = strengthsMatch[1].trim().split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());
    }

    // 解析改进点
    const improvementsMatch = response.match(/Areas for Improvement:([\s\S]*?)(?=Recommended Drills|$)/i);
    if (improvementsMatch) {
      analysis.improvements = improvementsMatch[1].trim().split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());
    }

    // 解析建议练习
    const drillsMatch = response.match(/Recommended Drills:([\s\S]*?)$/i);
    if (drillsMatch) {
      analysis.drills = drillsMatch[1].trim().split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [name, ...description] = line.split(':');
          return {
            name: name.trim(),
            description: description.join(':').trim()
          };
        });
    }

    return analysis;
  }
}

module.exports = new TrainingAIService();
