export const formatTime = (timeInMs) => {
  const minutes = Math.floor(timeInMs / 60000);
  const seconds = ((timeInMs % 60000) / 1000).toFixed(2);
  return minutes ? `${minutes}:${seconds.padStart(5, '0')}` : seconds;
};

export const parseTime = (timeStr) => {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return (minutes || 0) * 60000 + seconds * 1000;
};

export const getAgeGroup = (age) => {
  if (age <= 10) return '10_UNDER';
  if (age <= 12) return '11_12';
  if (age <= 14) return '13_14';
  return '15_OVER';
};

export const format = (date) => {
  return new Date(date).toLocaleDateString();
};

export const getStandardColor = (level) => {
  const colors = {
    AAAA: '#FFD700', // Gold
    AAA: '#C0C0C0',  // Silver
    AA: '#CD7F32',   // Bronze
    A: '#4CAF50',    // Green
    BB: '#2196F3',   // Blue
    B: '#9C27B0'     // Purple
  };
  return colors[level] || '#757575';
}; 