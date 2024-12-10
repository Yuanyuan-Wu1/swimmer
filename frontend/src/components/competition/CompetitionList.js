import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CompetitionForm from './CompetitionForm';
import { competitionApi } from '../../services/api';

const CompetitionList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: 'all'
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const response = await competitionApi.getCompetitions(filters);
      setCompetitions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  const handleEdit = (competition) => {
    setSelectedCompetition(competition);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await competitionApi.deleteCompetition(id);
      fetchCompetitions();
    } catch (error) {
      console.error('Error deleting competition:', error);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedCompetition) {
        await competitionApi.updateCompetition(selectedCompetition._id, data);
      } else {
        await competitionApi.createCompetition(data);
      }
      setShowForm(false);
      setSelectedCompetition(null);
      fetchCompetitions();
    } catch (error) {
      console.error('Error saving competition:', error);
    }
  };

  const addCompetition = async (competitionData) => {
    try {
      const response = await competitionApi.createCompetition(competitionData);
      setCompetitions(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error adding competition:', error);
    }
  };

  const updateCompetition = async (id, updates) => {
    try {
      const response = await competitionApi.updateCompetition(id, updates);
      setCompetitions(prev => 
        prev.map(comp => 
          comp._id === id ? response.data : comp
        )
      );
    } catch (error) {
      console.error('Error updating competition:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center" mb={3}>
          <Grid item>
            <Typography variant="h4">Competitions</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowForm(true)}
            >
              Add Competition
            </Button>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Events</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {competitions.map((competition) => (
                <TableRow key={competition._id}>
                  <TableCell>
                    {new Date(competition.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{competition.name}</TableCell>
                  <TableCell>{competition.location}</TableCell>
                  <TableCell>
                    {competition.events.map((event) => (
                      <Chip
                        key={event._id}
                        label={event.name}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={competition.status}
                      color={
                        competition.status === 'completed'
                          ? 'success'
                          : competition.status === 'upcoming'
                          ? 'primary'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(competition)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(competition._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <CompetitionForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedCompetition(null);
        }}
        onSubmit={handleFormSubmit}
        competition={selectedCompetition}
      />
    </Container>
  );
};

export default CompetitionList; 