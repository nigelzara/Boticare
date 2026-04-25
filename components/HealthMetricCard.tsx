
import React from 'react';
import { HealthMetric, HealthMetricStatus } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

interface HealthMetricCardProps {
  metric: HealthMetric;
}

const statusStyles = {
  [HealthMetricStatus.Normal]: {
    bg: 'bg-boticare-green dark:bg-green-900/50',
    text: 'text-boticare-green-dark dark:text-green-300',
  },
  [HealthMetricStatus.Warning]: {
    bg: 'bg-boticare-yellow dark:bg-yellow-900/50',
    text: 'text-boticare-yellow-dark dark:text-yellow-300',
  },
};

const trendStyles = {
  up: 'text-red-500 dark:text-red-400',
  down: 'text-green-500 dark:text-green-400',
  stable: 'text-boticare-gray-dark dark:text-gray-400',
}

const HealthMetricCard: React.FC<HealthMetricCardProps> = ({ metric }) => {
  const TrendIcon = metric.trendDirection === 'up' ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="bg-white p-5 rounded-xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <p className="font-semibold">{metric.name}</p>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[metric.status].bg} ${statusStyles[metric.status].text}`}>
          {metric.status}
        </span>
      </div>
      <div className="my-4">
        <span className="text-4xl font-bold">{metric.value}</span>
        <span className="text-lg text-boticare-gray-dark ml-1 dark:text-gray-400">{metric.unit}</span>
      </div>
      <div className="border-t border-boticare-gray-medium pt-3 flex items-center text-sm dark:border-gray-700">
        <div className={`flex items-center ${trendStyles[metric.trendDirection]}`}>
            {metric.trendDirection !== 'stable' && <TrendIcon className="w-4 h-4 mr-1" />}
            <span className="font-medium">{metric.trend}</span>
        </div>
      </div>
    </div>
  );
};

export default HealthMetricCard;