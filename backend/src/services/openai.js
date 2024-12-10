const OpenAI = require('openai');
const Performance = require('../models/performance');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateTrainingPlan(userData) {
    try {
      const { user, targetEvents, currentLevel, goal } = userData;

      // Get user's performance history
      const performances = await Performance.find({ user: user._id })
        .sort({ date: -1 })
        .limit(10);

      // Format performance data for OpenAI
      const performanceHistory = performances.map(p => ({
        event: p.event,
        time: p.time,
        date: p.date
      }));

      // Create prompt for OpenAI
      const prompt = this.createTrainingPlanPrompt(
        performanceHistory,
        targetEvents,
        currentLevel,
        goal
      );

      // Generate training plan using OpenAI
      const completion = await this.openai.createChatCompletion({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are an expert swimming coach with experience in creating personalized training plans."
        }, {
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 2000
      });

      // Parse and structure the response
      return this.parseTrainingPlanResponse(completion.data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating training plan:', error);
      throw error;
    }
  }

  createTrainingPlanPrompt(performanceHistory, targetEvents, currentLevel, goal) {
    return `
Create a detailed swimming training plan with the following information:

Athlete Profile:
- Current Level: ${currentLevel}
- Target Events: ${targetEvents.join(', ')}
- Goal: ${goal}

Recent Performance History:
${performanceHistory.map(p => `- ${p.event}: ${p.time} (${new Date(p.date).toLocaleDateString()})`).join('\n')}

Please create a structured training plan that includes:
1. Weekly schedule with specific workouts
2. Main sets for each session
3. Dryland training exercises
4. Recovery and progression guidelines
5. Technical focus areas

The plan should follow standard swimming training principles and be formatted as JSON with the following structure:
{
  weeklySchedule: [{
    dayOfWeek: number,
    sessions: [{
      type: "swim"|"dryland"|"recovery",
      focus: string,
      mainSet: [{
        description: string,
        distance: number,
        intensity: string,
        repetitions: number
      }],
      duration: number,
      notes: string
    }]
  }],
  drylandExercises: [{
    name: string,
    sets: number,
    reps: number,
    notes: string
  }]
}`;
  }

  parseTrainingPlanResponse(response) {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const planData = JSON.parse(jsonMatch[0]);

      // Validate and structure the data
      return {
        weeklySchedule: planData.weeklySchedule.map(day => ({
          dayOfWeek: day.dayOfWeek,
          sessions: day.sessions.map(session => ({
            type: session.type,
            focus: session.focus,
            mainSet: session.mainSet,
            duration: session.duration,
            notes: session.notes
          }))
        })),
        drylandExercises: planData.drylandExercises
      };
    } catch (error) {
      console.error('Error parsing training plan response:', error);
      throw new Error('Failed to parse training plan response');
    }
  }

  async generateWorkoutFeedback(workoutData) {
    try {
      const prompt = `
Analyze this swimming workout and provide feedback:

Workout Details:
${JSON.stringify(workoutData, null, 2)}

Please provide:
1. Technical analysis
2. Areas for improvement
3. Specific recommendations
4. Progress indicators`;

      const completion = await this.openai.createChatCompletion({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are an expert swimming coach providing detailed workout analysis and feedback."
        }, {
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 1000
      });

      return completion.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating workout feedback:', error);
      throw error;
    }
  }
}

module.exports = new OpenAIService();
