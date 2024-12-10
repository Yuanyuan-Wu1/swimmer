import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, achieved, color }) => ({
  position: 'relative',
  transition: 'transform 0.3s ease-in-out',
  backgroundColor: achieved ? theme.palette.background.paper : theme.palette.grey[100],
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: achieved ? color : theme.palette.grey[300]
  }
}));

const MedalCard = ({ 
  type = 'standard',
  level = '',
  achieved = false,
  details = '',
  requirements = {},
  progress = 0  // 添加进度属性
}) => {
  const getColor = () => {
    const colors = {
      AAAA: '#FFD700', // Gold
      AAA: '#C0C0C0',  // Silver
      AA: '#CD7F32',   // Bronze
      A: '#4CAF50',    // Green
      BB: '#2196F3',   // Blue
      B: '#9C27B0',    // Purple
      champs: '#FF4081' // Pink for championships
    };
    return colors[level] || '#757575';
  };

  return (
    <StyledCard achieved={achieved} color={getColor()} sx={{ m: 1, minWidth: 275 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              color: achieved ? 'text.primary' : 'text.secondary',
              fontWeight: achieved ? 600 : 400
            }}
          >
            {level} {type === 'champs' ? 'Championship' : 'Standard'}
          </Typography>
          <Chip 
            label={achieved ? "Achieved" : "Not Achieved"}
            color={achieved ? "success" : "default"}
            sx={{ 
              opacity: achieved ? 1 : 0.7,
              '& .MuiChip-label': {
                fontWeight: achieved ? 600 : 400
              }
            }}
          />
        </Box>

        <Typography 
          variant="body2" 
          color={achieved ? 'text.primary' : 'text.secondary'} 
          gutterBottom
        >
          {details}
        </Typography>

        {/* 进度条 */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getColor()
              }
            }}
          />
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}
          >
            {progress}% Complete
          </Typography>
        </Box>

        {/* 标准时间要求 */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Requirements:
          </Typography>
          {Object.entries(requirements).map(([event, time]) => (
            <Box 
              key={event} 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mb: 0.5,
                opacity: achieved ? 1 : 0.7
              }}
            >
              <Typography variant="body2">{event}:</Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: achieved ? 600 : 400,
                  color: achieved ? getColor() : 'text.secondary'
                }}
              >
                {time}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default MedalCard;
