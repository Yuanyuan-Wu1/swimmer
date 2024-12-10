const Standards = require('../models/standards');
const { readFileSync } = require('fs');
const path = require('path');

/**
 * 游泳标准时间服务
 * 管理动机性标准时间和锦标赛标准时间
 */
class StandardsService {
  constructor() {
    /** @private 标准时间缓存 */
    this.standardsCache = null;
    /** @private 最后更新时间 */
    this.lastUpdate = null;
  }

  /**
   * 加载标准时间数据
   * 优先从缓存加载,缓存过期则从数据库或文件加载
   * @returns {Promise<Object>} 标准时间数据
   * @throws {Error} 加载失败时抛出错误
   */
  async loadStandards() {
    try {
      // 如果缓存存在且未过期，直接返回缓存
      if (this.standardsCache && Date.now() - this.lastUpdate < 3600000) {
        return this.standardsCache;
      }

      // 从数据库加载标准
      const standards = await Standards.find().lean();
      
      if (standards.length === 0) {
        // 如果数据库为空，从JSON文件加载
        const jsonPath = path.join(__dirname, '../../data/swimming_standards.json');
        const rawData = readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(rawData);
        
        // 保存到数据库
        await this._saveStandardsToDb(data.standards);
        
        this.standardsCache = data.standards;
      } else {
        // 构建缓存
        this.standardsCache = this._formatStandards(standards);
      }
      
      this.lastUpdate = Date.now();
      return this.standardsCache;
    } catch (error) {
      console.error('Error loading standards:', error);
      throw error;
    }
  }

  /**
   * 获取特定项目的标准时间
   * @param {string} event - 比赛项目
   * @param {string} gender - 性别
   * @param {string} ageGroup - 年龄组
   * @returns {Promise<Object|null>} 标准时间数据
   */
  async getStandardsForEvent(event, gender, ageGroup) {
    const standards = await this.loadStandards();
    return standards[gender]?.SCY?.[ageGroup]?.[event] || null;
  }

  /**
   * 检查成绩是否达到各级标准
   * @param {Performance} performance - 成绩记录
   * @param {number} userAge - 用户年龄
   * @returns {Promise<Object>} 达标情况
   */
  async checkPerformanceStandards(performance, userAge) {
    const ageGroup = this._getAgeGroup(userAge);
    const standards = await this.getStandardsForEvent(
      performance.event,
      performance.gender,
      ageGroup
    );

    if (!standards) return null;

    return {
      AAAA: performance.time <= standards.AAAA,
      AAA: performance.time <= standards.AAA,
      AA: performance.time <= standards.AA,
      A: performance.time <= standards.A,
      BB: performance.time <= standards.BB,
      B: performance.time <= standards.B
    };
  }

  /**
   * 检查成绩是否达到锦标赛标准
   * @param {Performance} performance - 成绩记录
   * @param {Object} profile - 用户档案
   * @returns {Promise<Object>} 达标情况
   */
  async checkChampsQualification(performance, profile) {
    const standards = await this.loadStandards();
    const ageGroup = this._getAgeGroup(profile.age);
    
    if (!ageGroup) return null;

    try {
      const eventStandards = standards[profile.gender][ageGroup][performance.course][performance.event];
      
      return {
        automatic: performance.time.value <= eventStandards.automatic,
        consideration: performance.time.value <= eventStandards.consideration
      };
    } catch (error) {
      console.error('Error checking qualification:', error);
      return null;
    }
  }

  // 内部方法使用下划线前缀
  _getAgeGroup(age) {
    if (age <= 10) return '10_UNDER';
    if (age <= 12) return '11_12';
    if (age <= 14) return '13_14';
    if (age <= 16) return '15_16';
    return '17_18';
  }

  _formatStandards(dbStandards) {
    const formatted = {
      BOYS: { SCY: {} },
      GIRLS: { SCY: {} }
    };

    for (const standard of dbStandards) {
      if (!formatted[standard.gender].SCY[standard.ageGroup]) {
        formatted[standard.gender].SCY[standard.ageGroup] = {};
      }
      formatted[standard.gender].SCY[standard.ageGroup][standard.event] = standard.standards;
    }

    return formatted;
  }
}

module.exports = new StandardsService(); 