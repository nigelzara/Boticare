
import React from 'react';
import { HistoricalDataPoint } from '../types';

interface MetricChartProps {
  data: HistoricalDataPoint[];
  color: string;
  label: string;
}

const MetricChart: React.FC<MetricChartProps> = ({ data, color, label }) => {
  const width = 500;
  const height = 200;
  const padding = 30;

  if (!data || data.length === 0) return <div>No data available</div>;

  const minVal = Math.min(...data.map(d => d.value));
  const maxVal = Math.max(...data.map(d => d.value));
  const range = maxVal - minVal || 1; // avoid division by zero

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-bold mb-4">{label} Trend</h3>
      <div className="relative w-full aspect-[2/1] md:aspect-[3/1]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full border border-boticare-gray-medium rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
          
          {/* The Data Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
            const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
            return (
              <g key={i} className="group">
                <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
                <rect x={x - 25} y={y - 35} width="50" height="25" rx="4" fill="black" opacity="0" className="group-hover:opacity-80 transition-opacity" />
                <text x={x} y={y - 20} textAnchor="middle" fill="white" fontSize="12" opacity="0" className="group-hover:opacity-100 transition-opacity pointer-events-none">
                  {d.value}
                </text>
                {/* X-axis Labels */}
                <text x={x} y={height - 10} textAnchor="middle" fill="#9ca3af" fontSize="10">
                    {d.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default MetricChart;
