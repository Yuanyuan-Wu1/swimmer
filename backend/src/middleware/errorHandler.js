const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // 区分不同类型的错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.id // 用于追踪
  });
}; 