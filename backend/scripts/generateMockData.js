/**
 * 测试数据生成器
 * 生成模拟的比赛成绩和选手数据
 */
const fs = require('fs');
const path = require('path');

function generateMockData() {
  const data = {
    performances: [],
    athletes: []
  };

  // 生成选手数据
  for (let i = 1; i <= 10; i++) {
    data.athletes.push({
      id: `ath${i}`,
      name: `Swimmer ${i}`,
      age: 12 + Math.floor(Math.random() * 6),
      team: `Team ${Math.ceil(i/3)}`,
      events: ['50_FR', '100_FR', '50_BK']
    });
  }

  // 生成成绩数据
  const events = ['50_FR_SCY', '100_FR_SCY', '50_BK_SCY'];
  const startDate = new Date('2023-01-01');
  
  data.athletes.forEach(athlete => {
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * 30);
      
      data.performances.push({
        id: `perf${athlete.id}${i}`,
        athleteId: athlete.id,
        event: events[Math.floor(Math.random() * events.length)],
        time: (25 + Math.random() * 5).toFixed(2),
        date: date.toISOString().split('T')[0],
        place: Math.ceil(Math.random() * 8)
      });
    }
  });

  return data;
}

// 生成并保存数据
const mockData = generateMockData();
const outputPath = path.join(__dirname, '../src/config/mockData.js');

fs.writeFileSync(
  outputPath,
  `module.exports = ${JSON.stringify(mockData, null, 2)};`
);

console.log('Mock data generated successfully!'); 