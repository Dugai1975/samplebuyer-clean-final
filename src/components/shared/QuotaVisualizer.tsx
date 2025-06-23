"use client";

import React from 'react';
import { Card, Progress, Tag } from 'antd';
import { QuotaProgress } from '@/types/enhanced';

interface QuotaVisualizerProps {
  quotas: QuotaProgress[];
  showProgress?: boolean;
}

export const QuotaVisualizer: React.FC<QuotaVisualizerProps> = ({ 
  quotas, 
  showProgress = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'active': return 'blue';
      case 'overdelivered': return 'purple';
      default: return 'gray';
    }
  };

  const totalTarget = quotas.reduce((sum, quota) => sum + quota.target, 0);
  const totalCurrent = quotas.reduce((sum, quota) => sum + quota.current, 0);

  return (
    <Card title="Quota Overview" className="shadow-sm">
      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-blue-600">{quotas.length}</div>
            <div className="text-sm text-gray-600">Total Quotas</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">
              {showProgress ? totalCurrent : totalTarget}
            </div>
            <div className="text-sm text-gray-600">
              {showProgress ? 'Completed' : 'Target'}
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-600">
              {showProgress ? Math.round((totalCurrent / totalTarget) * 100) : 100}%
            </div>
            <div className="text-sm text-gray-600">
              {showProgress ? 'Overall Progress' : 'Coverage'}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Quotas */}
      <div className="space-y-3">
        {quotas.map(quota => (
          <div key={quota.id} className="border rounded-lg p-3 hover:bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{quota.name}</span>
              <div className="flex items-center space-x-2">
                <Tag color={getStatusColor(quota.status)}>
                  {quota.status}
                </Tag>
                <span className="text-sm text-gray-600">
                  {showProgress ? `${quota.current}/${quota.target}` : quota.target}
                </span>
              </div>
            </div>
            {showProgress && (
              <Progress 
                percent={quota.percentage}
                size="small"
                strokeColor={
                  quota.percentage >= 100 ? '#52c41a' :
                  quota.percentage >= 75 ? '#1890ff' :
                  quota.percentage >= 50 ? '#faad14' : '#ff4d4f'
                }
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
