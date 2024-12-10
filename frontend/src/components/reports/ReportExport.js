import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  Save
} from '@mui/icons-material';
import { exportApi } from '../../services/api';

const ReportExport = ({ data, onClose }) => {
  const [format, setFormat] = useState('pdf');
  const [sections, setSections] = useState({
    performance: true,
    medals: true,
    training: true,
    competitions: true,
    analytics: true
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await exportApi.generateReport({
        format,
        sections,
        dateRange,
        data
      });

      // 处理不同格式的导出
      if (format === 'pdf') {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `performance_report_${new Date().toISOString()}.pdf`;
        link.click();
      } else if (format === 'excel') {
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `performance_report_${new Date().toISOString()}.xlsx`;
        link.click();
      }

      onClose();
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Report</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Export Format
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={format === 'pdf' ? 'contained' : 'outlined'}
              startIcon={<PictureAsPdf />}
              onClick={() => setFormat('pdf')}
            >
              PDF
            </Button>
            <Button
              variant={format === 'excel' ? 'contained' : 'outlined'}
              startIcon={<TableChart />}
              onClick={() => setFormat('excel')}
            >
              Excel
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Date Range
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="date"
              label="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                start: e.target.value
              }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="End Date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                end: e.target.value
              }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Include Sections
          </Typography>
          <FormControl component="fieldset">
            <FormControlLabel
              control={
                <Checkbox
                  checked={sections.performance}
                  onChange={(e) => setSections(prev => ({
                    ...prev,
                    performance: e.target.checked
                  }))}
                />
              }
              label="Performance Analysis"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sections.medals}
                  onChange={(e) => setSections(prev => ({
                    ...prev,
                    medals: e.target.checked
                  }))}
                />
              }
              label="Medals & Achievements"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sections.training}
                  onChange={(e) => setSections(prev => ({
                    ...prev,
                    training: e.target.checked
                  }))}
                />
              }
              label="Training Records"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sections.competitions}
                  onChange={(e) => setSections(prev => ({
                    ...prev,
                    competitions: e.target.checked
                  }))}
                />
              }
              label="Competition Results"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sections.analytics}
                  onChange={(e) => setSections(prev => ({
                    ...prev,
                    analytics: e.target.checked
                  }))}
                />
              }
              label="Analytics & Insights"
            />
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          onClick={handleExport}
          disabled={loading}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportExport; 