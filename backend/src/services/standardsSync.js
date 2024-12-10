const Standards = require('../models/standards');

class StandardsSyncService {
  // 从PDF文件更新标准时间
  async updateFromPDF(pdfPath) {
    const standards = await this.extractStandardsFromPDF(pdfPath);
    await Standards.bulkWrite(
      standards.map(standard => ({
        updateOne: {
          filter: {
            event: standard.event,
            ageGroup: standard.ageGroup
          },
          update: { $set: standard },
          upsert: true
        }
      }))
    );
  }

  // 手动更新标准时间
  async updateStandards(standards) {
    await Standards.bulkWrite(
      standards.map(standard => ({
        updateOne: {
          filter: {
            event: standard.event,
            ageGroup: standard.ageGroup
          },
          update: { $set: standard },
          upsert: true
        }
      }))
    );
  }
} 