import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';

const Rankings = () => {
  const [rankingType, setRankingType] = useState(0); // 0: Event, 1: FINA Points, 2: Athletes, 3: Teams
  const [selectedEvent, setSelectedEvent] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  const SWIMMING_EVENTS = {
    SCY: [
      '50_FR_SCY', '100_FR_SCY', '200_FR_SCY', '500_FR_SCY',
      '50_BK_SCY', '100_BK_SCY',
      '50_BR_SCY', '100_BR_SCY',
      '50_FL_SCY', '100_FL_SCY',
      '100_IM_SCY', '200_IM_SCY'
    ],
    LCM: [
      '50_FR_LCM', '100_FR_LCM', '200_FR_LCM', '400_FR_LCM',
      '50_BK_LCM', '100_BK_LCM',
      '50_BR_LCM', '100_BR_LCM',
      '50_FL_LCM', '100_FL_LCM',
      '200_IM_LCM'
    ]
  };

  const AGE_GROUPS = [
    '10-under',
    '11-12',
    '13-14',
    '15-16',
    '17-18',
    '19-over'
  ];

  useEffect(() => {
    fetchRankings();
  }, [rankingType]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const filters = {
        ageGroup,
        gender,
        dateRange: startDate && endDate ? {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        } : undefined
      };

      let endpoint;
      switch (rankingType) {
        case 0: // Event Rankings
          endpoint = `/api/rankings/event/${selectedEvent}`;
          break;
        case 1: // FINA Points Rankings
          endpoint = '/api/rankings/fina-points';
          break;
        case 2: // Athlete Rankings
          endpoint = '/api/rankings/athletes';
          break;
        case 3: // Team Rankings
          endpoint = '/api/rankings/teams';
          break;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters
        }
      );
      setRankings(response.data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
    setLoading(false);
  };

  const renderRankingsTable = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (rankingType) {
      case 0: // Event Rankings
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Athlete</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>FINA Points</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankings.map((ranking) => (
                  <TableRow key={ranking._id}>
                    <TableCell>{ranking.rank}</TableCell>
                    <TableCell>{ranking.athlete.name}</TableCell>
                    <TableCell>{ranking.athlete.age}</TableCell>
                    <TableCell>{ranking.athlete.team}</TableCell>
                    <TableCell>{ranking.formattedTime}</TableCell>
                    <TableCell>{ranking.finaPoints}</TableCell>
                    <TableCell>
                      {new Date(ranking.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 1: // FINA Points Rankings
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Athlete</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>FINA Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankings.map((ranking) => (
                  <TableRow key={ranking._id}>
                    <TableCell>{ranking.rank}</TableCell>
                    <TableCell>{ranking.athlete.name}</TableCell>
                    <TableCell>{ranking.athlete.age}</TableCell>
                    <TableCell>{ranking.athlete.team}</TableCell>
                    <TableCell>{ranking.event.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{ranking.formattedTime}</TableCell>
                    <TableCell>{ranking.finaPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 2: // Athlete Rankings
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Athlete</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Average FINA Points</TableCell>
                  <TableCell>Top FINA Points</TableCell>
                  <TableCell>Performance Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankings.map((ranking) => (
                  <TableRow key={ranking._id}>
                    <TableCell>{ranking.rank}</TableCell>
                    <TableCell>{ranking.name}</TableCell>
                    <TableCell>{ranking.age}</TableCell>
                    <TableCell>{ranking.team}</TableCell>
                    <TableCell>{ranking.averageFinaPoints}</TableCell>
                    <TableCell>{ranking.topFinaPoints}</TableCell>
                    <TableCell>{ranking.performanceCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 3: // Team Rankings
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Athletes</TableCell>
                  <TableCell>Average FINA Points</TableCell>
                  <TableCell>Top FINA Points</TableCell>
                  <TableCell>Performance Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankings.map((ranking) => (
                  <TableRow key={ranking._id}>
                    <TableCell>{ranking.rank}</TableCell>
                    <TableCell>{ranking.team}</TableCell>
                    <TableCell>{ranking.athleteCount}</TableCell>
                    <TableCell>{ranking.averageFinaPoints}</TableCell>
                    <TableCell>{ranking.topFinaPoints}</TableCell>
                    <TableCell>{ranking.performanceCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Rankings
        </Typography>

        <Tabs
          value={rankingType}
          onChange={(e, newValue) => setRankingType(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Event Rankings" />
          <Tab label="FINA Points Rankings" />
          <Tab label="Athlete Rankings" />
          <Tab label="Team Rankings" />
        </Tabs>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            {rankingType === 0 && (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Event</InputLabel>
                  <Select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                  >
                    {Object.entries(SWIMMING_EVENTS).map(([course, events]) => (
                      <MenuItem key={course} disabled>
                        {course}
                        {events.map(event => (
                          <MenuItem key={event} value={event}>
                            {event.replace(/_/g, ' ')}
                          </MenuItem>
                        ))}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Age Group</InputLabel>
                <Select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                >
                  <MenuItem value="">All Ages</MenuItem>
                  {AGE_GROUPS.map(group => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                onClick={fetchRankings}
                fullWidth
                sx={{ height: '100%' }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          {renderRankingsTable()}
        </Paper>
      </Box>
    </Container>
  );
};

export default Rankings;
