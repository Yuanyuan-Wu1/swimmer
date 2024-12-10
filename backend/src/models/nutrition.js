/**
 * 饮食记录数据模型
 * 记录用户的饮食摄入和营养分析
 * @typedef {Object} Nutrition
 */
const nutritionSchema = new mongoose.Schema({
  /** 关联的用户ID */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  /** 记录日期 */
  date: {
    type: Date,
    default: Date.now
  },

  /** 
   * 餐次类型
   * @enum ['breakfast', 'lunch', 'dinner', 'snack']
   */
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },

  /** 食物列表 */
  foods: [{
    /** 食物名称 */
    name: String,
    
    /** 份量(克) */
    amount: Number,
    
    /** 卡路里 */
    calories: Number,
    
    /** 蛋白质(克) */
    protein: Number,
    
    /** 碳水化合物(克) */
    carbs: Number,
    
    /** 脂肪(克) */
    fat: Number,
    
    /** 维生素和矿物质 */
    nutrients: {
      vitaminA: Number,
      vitaminC: Number,
      calcium: Number,
      iron: Number
    }
  }],

  /** 营养总计 */
  totals: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    water: Number
  },

  /** 用户备注 */
  notes: String,

  /** 
   * 饮食目标达成情况
   * @property {boolean} calories - 卡路里目标
   * @property {boolean} protein - 蛋白质目标
   * @property {boolean} hydration - 水分目标
   */
  goalsAchieved: {
    calories: Boolean,
    protein: Boolean,
    hydration: Boolean
  }
}, {
  timestamps: true
});

// 添加索引
nutritionSchema.index({ user: 1, date: -1 });
nutritionSchema.index({ user: 1, 'goalsAchieved.calories': 1 }); 