"use client";

import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { 
  TeamOutlined, DollarOutlined, TrophyOutlined, 
  ClockCircleOutlined, ArrowUpOutlined, ArrowDownOutlined 
} from '@ant-design/icons';
import type { EnhancedProject } from '@project-types';

interface DashboardStatsProps {
  projects: EnhancedProject[];
  lastUpdate: Date;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  projects, 
  lastUpdate 
}) => {
  const liveProjects = projects.filter(p => p.state === 'live');
  const totalCompletes = projects.reduce((sum, p) => sum + (p.fielded || 0), 0);
  const avgQuality = projects.reduce((sum, p) => sum + (p.quality_score || 0), 0) / projects.length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget_used || 0), 0);

  const timeAgo = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
  const lastUpdateText = timeAgo < 60 ? 'Just now' : `${Math.floor(timeAgo / 60)}m ago`;

  return (
    <div className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Live Projects"
              value={liveProjects.length}
              suffix={`/ ${projects.length}`}
              prefix={<TeamOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Completes"
              value={totalCompletes}
              prefix={<TrophyOutlined className="text-blue-500" />}
              suffix={
                <span className="text-xs text-green-500">
                  <ArrowUpOutlined /> +12%
                </span>
              }
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Avg Quality"
              value={avgQuality}
              precision={1}
              suffix="%"
              prefix={<TrophyOutlined className="text-purple-500" />}
              valueStyle={{ 
                color: avgQuality > 90 ? '#52c41a' : avgQuality > 80 ? '#faad14' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Spend"
              value={totalBudget}
              prefix={<DollarOutlined className="text-orange-500" />}
              precision={2}
              suffix={
                <span className="text-xs text-red-500">
                  <ArrowUpOutlined /> +8%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>
      
      <div className="text-center mt-2">
        <span className="text-xs text-gray-500">
          <ClockCircleOutlined className="mr-1" />
          Last updated: {lastUpdateText}
        </span>
      </div>
    </div>
  );
};
