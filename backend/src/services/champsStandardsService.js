const Standards = require('../models/standards');
const { readFileSync } = require('fs');
const path = require('path');

/**
 * 锦标赛标准时间服务
 * 管理锦标赛资格标准时间
 */
class ChampsStandardsService {
  constructor() {
    /** @private 标准时间缓存 */
    this.standardsCache = null;
    /** @private 最后更新时间 */
    this.lastUpdate = null;
  }

  /**
   * 加载锦标赛标准时间
   * @returns {Promise<Object>} 标准时间数据
   * @throws {Error} 加载失败时抛出错误
   */
  async loadStandards() {
    try {
      // 检查缓存
      if (this.standardsCache && Date.now() - this.lastUpdate < 3600000) {
        return this.standardsCache;
      }

      // 从JSON文件加载
      const jsonPath = path.join(__dirname, '../../data/champs_standards.json');
      const rawData = readFileSync(jsonPath, 'utf8');
      const data = JSON.parse(rawData);
      
      this.standardsCache = data.standards;
      this.lastUpdate = Date.now();
      
      return this.standardsCache;
    } catch (error) {
      console.error('Error loading champs standards:', error);
      throw error;
    }
  }

  /**
   * 获取项目达标时间
   * @param {string} event - 比赛项目
   * @param {string} gender - 性别
   * @param {string} ageGroup - 年龄组
   * @returns {Promise<number|null>} 达标时间(毫秒)
   */
  async getQualifyingTime(event, gender, ageGroup) {
    const standards = await this.loadStandards();
    return standards[gender]?.[ageGroup]?.[event]?.qualifying_time || null;
  }

  /**
   * 检查是否达到参赛标准
   * @param {Performance} performance - 成绩记录
   * @param {number} userAge - 用户年龄
   * @returns {Promise<boolean>} 是否达标
   */
  async checkQualification(performance, userAge) {
    const ageGroup = this._getAgeGroup(userAge);
    const qualifyingTime = await this.getQualifyingTime(
      performance.event,
      performance.gender,
      ageGroup
    );

    if (!qualifyingTime) return false;
    return performance.time.value <= qualifyingTime;
  }

  /**
   * 获取年龄组
   * @private
   * @param {number} age - 年龄
   * @returns {string} 年龄组标识
   */
  _getAgeGroup(age) {
    if (age <= 12) return '11_12';
    if (age <= 14) return '13_14';
    return null;
  }
}

module.exports = new ChampsStandardsService(); 