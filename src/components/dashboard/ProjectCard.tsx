"use client";

import React from 'react';
import { Card, Progress, Tag, Button, Statistic, Dropdown, Menu, Avatar } from 'antd';
import { 
  EyeOutlined, MoreOutlined, PlayCircleOutlined, PauseCircleOutlined,
  TeamOutlined, DollarOutlined, ClockCircleOutlined, CheckOutlined,
  TrophyOutlined, WarningOutlined, ExperimentOutlined
} from '@ant-design/icons';
import type { EnhancedProject } from '@project-types';

interface ProjectCardProps {
  project: EnhancedProject;
  onView: (project: EnhancedProject) => void;
  onEdit?: (project: EnhancedProject) => void;
  onPause?: (project: EnhancedProject) => void;
  onResume?: (project: EnhancedProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onView,
  onEdit,
  onPause,
  onResume
}) => {
  // Soft launch state badge
  const getSoftLaunchStatus = () => {
    if (project.state === 'soft_launch') {
      return (
        <Tag color="blue" className="flex items-center animate-pulse">
          <ExperimentOutlined className="mr-1" />🧪 Soft Launch Active
        </Tag>
      );
    }
    if (project.state === 'soft_paused') {
      return (
        <Tag color="orange" className="flex items-center">
          ⏸️ Awaiting Review
        </Tag>
      );
    }
    if (project.state === 'awaiting_review') {
      return (
        <Tag color="purple" className="flex items-center">
          📋 Review Needed
        </Tag>
      );
    }
    return null;
  };

  // Soft launch progress bar
  const getSoftLaunchProgress = () => {
    if (project.soft_launch_config && (project.state === 'soft_launch' || project.state === 'soft_paused')) {
      const testLimit = project.soft_launch_config.test_limit || 1;
      const testFielded = project.fielded || 0;
      const percent = Math.min(100, Math.round((testFielded / testLimit) * 100));
      return (
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-blue-600 font-semibold">Test: {testFielded}/{testLimit} completes</span>
            <span className="text-xs text-gray-400">{percent}%</span>
          </div>
          <Progress
            percent={percent}
            status={percent >= 100 ? 'success' : 'active'}
            strokeColor={percent >= 100 ? '#52c41a' : '#1890ff'}
            size="small"
            showInfo={false}
          />
        </div>
      );
    }
    return null;
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'live': return 'green';
      case 'paused': return 'orange';
      case 'completed': return 'blue';
      case 'draft': return 'gray';
      default: return 'red';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <TrophyOutlined className="text-green-500" />;
      case 'good': return <CheckOutlined className="text-blue-500" />;
      case 'warning': return <WarningOutlined className="text-orange-500" />;
      case 'critical': return <WarningOutlined className="text-red-500" />;
      default: return null;
    }
  };

  const moreMenu = (
    <Menu>
      <Menu.Item key="clone" onClick={() => console.log('Clone project')}>
        Clone Project
      </Menu.Item>
      <Menu.Item key="export" onClick={() => console.log('Export data')}>
        Export Data
      </Menu.Item>
      <Menu.Item key="settings" onClick={() => onEdit?.(project)}>
        Project Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="archive" danger>
        Archive Project
      </Menu.Item>
    </Menu>
  );

  const progressPercent = project.completion_percentage || 0;
  const isOverDelivered = progressPercent > 100;

  // Soft launch action buttons
  const softLaunchActions = () => {
    if (project.state === 'soft_launch') {
      return [
        <Button key="monitor" type="link" icon={<ExperimentOutlined />} onClick={() => onView(project)}>
          Monitor Test
        </Button>
      ];
    }
    if (project.state === 'soft_paused' || project.state === 'awaiting_review') {
      return [
        <Button key="review" type="primary" icon={<ExperimentOutlined />} onClick={() => onView(project)}>
          Review Results
        </Button>
      ];
    }
    return null;
  };

  return (
    <Card
      className={`card-hover shadow-sm border border-gray-200 rounded-lg ${project.state.startsWith('soft_') || project.state === 'awaiting_review' ? 'ring-2 ring-blue-200' : ''}`}
      style={{ minHeight: '280px', position: 'relative', overflow: 'visible' }}
      actions={[
        ...(softLaunchActions() || [
          <Button 
            key="view"
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => onView(project)}
          >
            Monitor
          </Button>,
          project.state === 'live' ? (
            <Button 
              key="pause"
              type="link" 
              icon={<PauseCircleOutlined />}
              onClick={() => onPause?.(project)}
            >
              Pause
            </Button>
          ) : (
            <Button 
              key="resume"
              type="link" 
              icon={<PlayCircleOutlined />}
              onClick={() => onResume?.(project)}
            >
              Resume
            </Button>
          ),
          <Dropdown key="more" menu={{ items: [
            { key: 'clone', label: 'Clone Project', onClick: () => console.log('Clone project') },
            { key: 'export', label: 'Export Data', onClick: () => console.log('Export data') },
            { key: 'settings', label: 'Project Settings', onClick: () => onEdit?.(project) },
            { type: 'divider' as const },
            { key: 'archive', label: 'Archive Project', danger: true },
          ]}} trigger={['click']}>
            <Button type="link" icon={<MoreOutlined />}>
              More
            </Button>
          </Dropdown>
        ]),
      ]}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {project.name}
            </h3>
            {getHealthIcon(project.health_status || 'good')}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">#{project.code}</span>
            {getSoftLaunchStatus() || (
              <Tag color={getStatusColor(project.state)} className="capitalize">
                {project.state}
              </Tag>
            )}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {getSoftLaunchProgress() || (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Completion</span>
            <span className="text-sm font-bold text-gray-800">
              {project.fielded || 0}/{project.goal || 0}
            </span>
          </div>
          <Progress 
            percent={Math.min(progressPercent, 100)}
            status={isOverDelivered ? "success" : progressPercent > 90 ? "success" : "active"}
            strokeColor={
              isOverDelivered ? "#52c41a" :
              progressPercent > 90 ? "#52c41a" :
              progressPercent > 70 ? "#1890ff" :
              progressPercent > 30 ? "#faad14" : "#ff4d4f"
            }
            className="mb-2"
          />
          {isOverDelivered && (
            <div className="text-xs text-green-600 font-medium">
              🎉 Over-delivered by {progressPercent - 100}%
            </div>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckOutlined 
              className={`mr-1 ${
                (project.quality_score || 0) > 90 ? 'text-green-500' :
                (project.quality_score || 0) > 80 ? 'text-orange-500' : 'text-red-500'
              }`}
            />
            <span className="text-xs text-gray-600">Quality</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {project.quality_score || 0}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarOutlined className="mr-1 text-blue-500" />
            <span className="text-xs text-gray-600">CPI</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            ${(project.current_cpi || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center">
          <TeamOutlined className="mr-1" />
          <span>{project.supplier_count || 0} suppliers</span>
        </div>
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-1" />
          <span>{project.time_remaining || 'Unknown'}</span>
        </div>
      </div>

      {/* Live Activity Indicator */}
      {project.state === 'live' && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full pulse-animation"></div>
            <span className="text-xs text-green-600 font-medium">LIVE</span>
          </div>
        </div>
      )}
    </Card>
  );
};
