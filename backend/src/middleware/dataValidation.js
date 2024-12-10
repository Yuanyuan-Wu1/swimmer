const validatePerformance = (req, res, next) => {
  const { event, time, splits } = req.body;
  
  // 验证事件格式
  const eventPattern = /^\d+_(FR|BK|BR|FL|IM)_(SCY|LCM|SCM)$/;
  if (!eventPattern.test(event)) {
    return res.status(400).json({ error: 'Invalid event format' });
  }
  
  // 验证时间格式
  if (typeof time !== 'number' || time <= 0) {
    return res.status(400).json({ error: 'Invalid time format' });
  }
  
  // 验证分段时间
  if (splits && (!Array.isArray(splits) || splits.some(s => typeof s !== 'number'))) {
    return res.status(400).json({ error: 'Invalid splits format' });
  }
  
  next();
}; 