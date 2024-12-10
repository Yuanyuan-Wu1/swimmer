import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import CustomTooltip from './CustomTooltip';

const PerformanceChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey="time" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
);

export default PerformanceChart; 