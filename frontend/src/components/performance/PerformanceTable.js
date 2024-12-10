import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const PerformanceTable = ({ performances }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Event</TableCell>
          <TableCell>Time</TableCell>
          <TableCell>Place</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {performances.map((perf) => (
          <TableRow key={perf.id}>
            <TableCell>{new Date(perf.date).toLocaleDateString()}</TableCell>
            <TableCell>{perf.event}</TableCell>
            <TableCell>{perf.time}</TableCell>
            <TableCell>{perf.place}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default PerformanceTable; 