import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockIcon from '@mui/icons-material/Lock';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TimerIcon from '@mui/icons-material/Timer';
import InfoIcon from '@mui/icons-material/Info';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';

const MedalCard = ({ medal }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getMedalColor = (type) => {
    if (!medal.earned) return '#808080'; // gray for locked medals
    
    // Achievement Medals
    if (type.includes('AAAA')) return '#FFD700'; // gold
    if (type.includes('AAA')) return '#FFC125';  // deep gold
    if (type.includes('AA')) return '#EEC900';   // light gold
    if (type.includes('A')) return '#CDC673';    // dark gold
    if (type.includes('BB')) return '#C0C0C0';   // silver
    if (type.includes('B')) return '#CD7F32';    // bronze
    
    // Progress Medals
    if (type.includes('PROGRESS_10')) return '#4169E1'; // royal blue
    if (type.includes('PROGRESS_5')) return '#1E90FF';  // dodger blue
    if (type.includes('PROGRESS_3')) return '#87CEEB';  // sky blue
    
    // Training Medals
    if (type.includes('TRAINING')) return '#9932CC'; // purple
    
    // Special Achievement Medals
    if (type.includes('GOLD')) return '#FFD700';   // gold
    if (type.includes('SILVER')) return '#C0C0C0'; // silver
    if (type.includes('BRONZE')) return '#CD7F32'; // bronze
    
    return '#FFD700'; // default gold
  };

  const getMedalIcon = (type) => {
    if (!medal.earned) {
      return <LockIcon style={{ color: '#808080', fontSize: 40 }} />;
    }
    
    const color = getMedalColor(type);
    
    if (type.includes('TRAINING')) {
      return <DirectionsRunIcon style={{ color, fontSize: 40 }} />;
    }
    if (type.includes('PROGRESS')) {
      return <WhatshotIcon style={{ color, fontSize: 40 }} />;
    }
    if (type.includes('TIME') || type.includes('STANDARD')) {
      return <TimerIcon style={{ color, fontSize: 40 }} />;
    }
    
    return <EmojiEventsIcon style={{ color, fontSize: 40 }} />;
  };

  const formatTime = (timeInMs) => {
    if (!timeInMs) return '';
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = timeInMs % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  const getProgressInfo = () => {
    if (!medal.targetTime || !medal.currentBestTime) return null;
    
    const timeToImprove = medal.timeToImprove;
    if (timeToImprove <= 0) return 'Target achieved!';
    
    return `Need to improve by: ${formatTime(timeToImprove)}`;
  };

  const frontContent = (
    <>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'grey.100'
        }}
      >
        {getMedalIcon(medal.type)}
        <IconButton 
          size="small" 
          onClick={() => setIsFlipped(true)}
          sx={{ opacity: 0.7 }}
        >
          <FlipCameraAndroidIcon />
        </IconButton>
      </Box>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {medal.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {medal.description}
        </Typography>
        {medal.earned && (
          <>
            <Typography variant="caption" display="block" gutterBottom>
              Earned: {new Date(medal.earnedDate).toLocaleDateString()}
            </Typography>
            {medal.event && (
              <Chip 
                label={medal.event.replace(/_/g, ' ')} 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
          </>
        )}
        {medal.progress > 0 && medal.progress < 100 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Progress: {medal.progress}%
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 4,
                bgcolor: 'grey.200',
                borderRadius: 2,
                mt: 0.5
              }}
            >
              <Box
                sx={{
                  width: `${medal.progress}%`,
                  height: '100%',
                  bgcolor: getMedalColor(medal.type),
                  borderRadius: 2,
                  transition: 'width 0.5s ease-in-out'
                }}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </>
  );

  const backContent = (
    <>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'grey.100'
        }}
      >
        <InfoIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
        <IconButton 
          size="small" 
          onClick={() => setIsFlipped(false)}
          sx={{ opacity: 0.7 }}
        >
          <FlipCameraAndroidIcon />
        </IconButton>
      </Box>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Requirements
        </Typography>
        <Typography variant="body2" paragraph>
          {medal.requirement}
        </Typography>
        
        {medal.targetTime && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Target Time: {formatTime(medal.targetTime)}
            </Typography>
            {medal.currentBestTime && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Current Best: {formatTime(medal.currentBestTime)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getProgressInfo()}
                </Typography>
              </>
            )}
          </>
        )}
      </CardContent>
    </>
  );

  return (
    <Card 
      sx={{ 
        height: '100%',
        perspective: '1000px',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s',
        position: 'relative',
        '& > *': {
          backfaceVisibility: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }
      }}
    >
      <Box sx={{ 
        transform: 'rotateY(0)',
        opacity: medal.earned ? 1 : 0.7,
      }}>
        {frontContent}
      </Box>
      <Box sx={{ 
        transform: 'rotateY(180deg)',
        bgcolor: 'background.paper'
      }}>
        {backContent}
      </Box>
    </Card>
  );
};

export default MedalCard;
