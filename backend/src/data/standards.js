/**
 * 游泳标准时间数据
 * 包含动机性标准时间和锦标赛标准时间
 * @module standards
 */

/**
 * 锦标赛标准时间配置 (2024 PNS Championships)
 * @constant
 * @type {Object}
 */
const CHAMPS_STANDARDS = {
  /** 女子标准时间 */
  GIRLS: {
    /** 10岁及以下组 */
    '10_UNDER': {
      // 自由泳
      '50_FR_SCY': {
        automatic: 31290,    // 31.29
        consideration: 31690 // 31.69
      },
      '100_FR_SCY': {
        automatic: 109490,   // 1:09.49
        consideration: 110990 // 1:10.99
      },
      '200_FR_SCY': {
        automatic: 232490,   // 2:32.49
        consideration: 238790 // 2:38.79
      },
      '500_FR_SCY': {
        automatic: 638190,   // 6:38.19
        consideration: 653390 // 6:53.39
      },
      // 仰泳
      '50_BK_SCY': {
        automatic: 36490,    // 36.49
        consideration: 37390  // 37.39
      },
      '100_BK_SCY': {
        automatic: 119890,   // 1:19.89
        consideration: 121690 // 1:21.69
      },
      // ... 其他项目
    },
    /** 11-12岁组 */
    '11_12': {
      '50_FR_SCY': {
        automatic: 27690,    // 27.69
        consideration: 28190  // 28.19
      },
      // ... 其他项目
    }
  },
  /** 男子标准时间 */
  BOYS: {
    /** 10岁及以下组 */
    '10_UNDER': {
      '50_FR_SCY': {
        automatic: 32390,    // 32.39
        consideration: 31790  // 31.79
      },
      // ... 其他项目
    },
    /** 11-12岁组 */
    '11_12': {
      '50_FR_SCY': {
        automatic: 27690,    // 27.69
        consideration: 27090  // 27.09
      },
      // ... 其他项目
    }
  }
};

/**
 * 动机性标准时间配置
 * @constant
 * @type {Object}
 */
const MOTIVATIONAL_STANDARDS = {
  /** 男子标准时间 */
  BOYS: {
    /** 10岁及以下组 */
    '10_UNDER': {
      '50_FR_SCY': {
        AAAA: 28500,  // 28.50秒
        AAA: 29800,   // 29.80秒
        AA: 31100,    // 31.10秒
        A: 32400,     // 32.40秒
        BB: 35000,    // 35.00秒
        B: 37600      // 37.60秒
      },
      // ... 其他项目
    }
  }
};

/**
 * 泳姿枚举
 * @enum {string}
 */
const STROKES = {
  FR: 'Freestyle',
  BK: 'Backstroke',
  BR: 'Breaststroke',
  FL: 'Butterfly',
  IM: 'Individual Medley'
};

/**
 * 泳池类型枚举
 * @enum {string}
 */
const COURSES = {
  SCY: 'Short Course Yards',
  LCM: 'Long Course Meters',
  SCM: 'Short Course Meters'
};

module.exports = {
  CHAMPS_STANDARDS,
  MOTIVATIONAL_STANDARDS,
  STROKES,
  COURSES
};
