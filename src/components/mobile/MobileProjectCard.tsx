'use client';

import React from 'react';
import { Card, Progress, Tag, Button } from 'antd';
import { 
  EyeOutlined, PlayCircleOutlined, PauseCircleOutlined,
  TeamOutlined, DollarOutlined, TrophyOutlined
} from '@ant-design/icons';
import type { EnhancedProject } from '@project-types';
import { motion } from 'framer-motion';

interface MobileProjectCardProps {
  project: EnhancedProject;
  onView: (project: EnhancedProject) => void;
  onToggleStatus: (project: EnhancedProject) => void;
}

export const MobileProjectCard: React.FC<MobileProjectCardProps> = ({
  project,
  onView,
  onToggleStatus
}) => {
  const completionRate = project.completion_percentage || 0;
  const isLive = project.state === 'live';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card 
        className="mobile-card shadow-md border-0"
        styles={{ body: { padding: '16px' } }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate text-gray-800">
              {project.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-500">#{project.code}</span>
              <Tag 
                color={isLive ? 'green' : 'orange'} 
                className="uppercase text-xs"
              >
                {project.state}
              </Tag>
              {isLive && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">LIVE</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-800">
              {project.fielded || 0}/{project.goal || 0}
            </span>
          </div>
          <Progress 
            percent={Math.min(completionRate, 100)}
            strokeColor={
              completionRate >= 100 ? '#52c41a' :
              completionRate >= 75 ? '#1890ff' :
              completionRate >= 50 ? '#faad14' : '#ff4d4f'
            }
            showInfo={false}
            strokeWidth={8}
          />
          {completionRate > 100 && (
            <div className="text-xs text-green-600 font-medium mt-1">
              🎉 Over-delivered by {Math.round(completionRate - 100)}%
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center mb-1">
              <TrophyOutlined className={`text-sm ${
                (project.quality_score || 0) > 90 ? 'text-green-500' :
                (project.quality_score || 0) > 80 ? 'text-orange-500' : 'text-red-500'
              }`} />
            </div>
            <div className="text-sm font-bold text-gray-800">
              {project.quality_score || 0}%
            </div>
            <div className="text-xs text-gray-600">Quality</div>
          </div>
          
          <div className="text-center bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center mb-1">
              <DollarOutlined className="text-sm text-green-500" />
            </div>
            <div className="text-sm font-bold text-gray-800">
              ${(project.current_cpi || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">CPI</div>
          </div>
          
          <div className="text-center bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center mb-1">
              <TeamOutlined className="text-sm text-blue-500" />
            </div>
            <div className="text-sm font-bold text-gray-800">
              {project.supplier_count || 0}
            </div>
            <div className="text-xs text-gray-600">Suppliers</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            type="primary"
            size="large"
            icon={<EyeOutlined />}
            onClick={() => onView(project)}
            className="flex-1 h-11 font-medium"
          >
            Monitor
          </Button>
          <Button
            size="large"
            icon={isLive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => onToggleStatus(project)}
            className={`h-11 ${isLive ? 'text-red-500 border-red-500' : 'text-green-500 border-green-500'}`}
          >
            {isLive ? 'Pause' : 'Resume'}
          </Button>
        </div>

        {/* Footer Info */}
        <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
          <span>Updated: {project.last_activity || 'Unknown'}</span>
          <span>{project.time_remaining || 'N/A'} remaining</span>
        </div>
      </Card>
    </motion.div>
  );
};
