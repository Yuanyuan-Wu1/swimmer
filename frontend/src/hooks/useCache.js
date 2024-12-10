import React, { useState, useEffect } from 'react';

/**
 * 数据缓存Hook
 * @param {string} key - 缓存键
 * @param {Function} fetcher - 数据获取函数
 * @param {Object} options - 配置选项
 * @returns {[any, Function]} [缓存数据, 刷新函数]
 */
export const useCache = (key, fetcher, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetcher();
      setData(response.data);
      // 缓存数据
      if (!options.noCache) {
        localStorage.setItem(key, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(key);
    if (cached && !options.bypass) {
      const { data: cachedData, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      if (age < (options.ttl || 3600000)) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }
    
    fetchData();
  }, [key]);

  return [data, loading, error, fetchData];
}; 