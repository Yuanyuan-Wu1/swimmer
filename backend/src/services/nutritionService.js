/**
 * 营养建议服务
 * 基于用户数据生成个性化营养建议
 */
class NutritionService {
  /**
   * 生成营养建议
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 营养建议
   */
  async generateRecommendations(userId) {
    try {
      const user = await User.findById(userId).populate('profile');
      const recentNutrition = await Nutrition.find({ user: userId })
        .sort({ date: -1 })
        .limit(7);
      
      // 计算基础代谢率(BMR)
      const bmr = this._calculateBMR(user.profile);
      
      // 分析近期营养摄入
      const nutritionAnalysis = this._analyzeNutritionHistory(recentNutrition);
      
      // 生成建议
      const recommendations = {
        dailyCalories: this._calculateDailyCalories(bmr, user.profile.activityLevel),
        macroSplit: this._recommendMacroSplit(user.profile.goals),
        mealPlan: this._generateMealPlan(nutritionAnalysis),
        supplements: this._recommendSupplements(nutritionAnalysis)
      };

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * 计算基础代谢率
   * @private
   */
  _calculateBMR(profile) {
    const { weight, height, age, gender } = profile;
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    }
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // ... 其他内部方法
} 