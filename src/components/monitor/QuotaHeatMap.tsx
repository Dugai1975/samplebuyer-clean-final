"use client";

import React from 'react';
import { Card, Progress, Tag, Button } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { QuotaProgress } from '@/types/enhanced';

interface QuotaHeatMapProps {
  quotas: QuotaProgress[];
  onAddQuota?: () => void;
  onEditQuota?: (quota: QuotaProgress) => void;
}

export const QuotaHeatMap: React.FC<QuotaHeatMapProps> = ({
  quotas,
  onAddQuota,
  onEditQuota
}) => {
  const getHeatColor = (percentage: number) => {
    if (percentage >= 100) return '#52c41a'; // Green
    if (percentage >= 75) return '#1890ff';  // Blue
    if (percentage >= 50) return '#faad14';  // Orange
    if (percentage >= 25) return '#ff7875';  // Light red
    return '#ff4d4f'; // Red
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'active': return '🔄';
      case 'overdelivered': return '🎯';
      default: return '⏳';
    }
  };

  return (
    <Card 
      title="Quota Heat Map" 
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="small"
          onClick={onAddQuota}
        >
          Add Quota
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotas.map(quota => (
          <div 
            key={quota.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            style={{ 
              borderColor: getHeatColor(quota.percentage),
              borderWidth: '2px'
            }}
            onClick={() => onEditQuota?.(quota)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-sm truncate">{quota.name}</h4>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-lg">{getStatusIcon(quota.status)}</span>
                  <Tag 
                    color={
                      quota.status === 'completed' ? 'green' :
                      quota.status === 'active' ? 'blue' :
                      quota.status === 'overdelivered' ? 'purple' : 'gray'
                    }
                  >
                    {quota.status}
                  </Tag>
                </div>
              </div>
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditQuota?.(quota);
                }}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="font-bold">
                  {quota.current}/{quota.target}
                </span>
              </div>
              
              <Progress 
                percent={Math.min(quota.percentage, 100)}
                strokeColor={getHeatColor(quota.percentage)}
                size="small"
                format={() => `${quota.percentage.toFixed(0)}%`}
              />
              
              {quota.percentage > 100 && (
                <div className="text-xs text-purple-600 font-medium">
                  Over-delivered by {(quota.percentage - 100).toFixed(0)}%
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Add New Quota Card */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          onClick={onAddQuota}
        >
          <div className="text-center">
            <PlusOutlined className="text-2xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Add New Quota</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
