const fs = require('fs');
const path = require('path');

// 读取标准时间数据
const standardsData = require(path.join(__dirname, '../data/standards.json'));

// 生成后端数据模块
const backendCode = `
const SWIMMING_STANDARDS = ${JSON.stringify(standardsData, null, 2)};

module.exports = {
  SWIMMING_STANDARDS
};
`;

// 生成前端数据模块
const frontendCode = `
export const SWIMMING_STANDARDS = ${JSON.stringify(standardsData, null, 2)};
`;

// 写入文件
fs.writeFileSync(
  path.join(__dirname, '../data/standards.js'),
  backendCode
);

fs.writeFileSync(
  path.join(__dirname, '../../frontend/src/data/standards.js'),
  frontendCode
);

console.log('Standards data synced successfully!'); 