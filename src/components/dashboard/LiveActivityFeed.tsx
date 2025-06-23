"use client";

import React, { useState, useEffect } from 'react';
import { Card, Timeline, Tag, Avatar, Button } from 'antd';
import { 
  CheckCircleOutlined, WarningOutlined, ThunderboltOutlined,
  TeamOutlined, ReloadOutlined
} from '@ant-design/icons';

interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'complete' | 'quality_issue' | 'optimization' | 'quota_change';
  description: string;
  project_name?: string;
  automated?: boolean;
}

export const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Mock real-time activity feed
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        type: 'complete',
        description: 'Project "RH Users_Current" reached 75 completes',
        project_name: 'RH Users_Current',
        automated: false
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        type: 'quality_issue',
        description: 'AI Guardian flagged 3 suspicious responses in "RH Users_Design 2"',
        project_name: 'RH Users_Design 2',
        automated: true
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
        type: 'optimization',
        description: 'CPI optimized by $0.25 for better supplier performance',
        project_name: 'RH Users_Current',
        automated: true
      }
    ];

    setActivities(mockActivities);

    // Simulate new activities coming in
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: ['complete', 'optimization', 'quality_issue'][Math.floor(Math.random() * 3)] as any,
        description: [
          'New completion recorded with 95% quality score',
          'AI optimization reduced CPI by $0.15',
          'Quality check passed - no issues detected'
        ][Math.floor(Math.random() * 3)],
        project_name: 'RH Users_Current',
        automated: Math.random() > 0.5
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10
    }, 15000); // New activity every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string, automated: boolean) => {
    const props = { 
      style: { fontSize: '14px' },
      className: automated ? 'text-blue-500' : 'text-green-500'
    };

    switch (type) {
      case 'complete':
        return <CheckCircleOutlined {...props} />;
      case 'quality_issue':
        return <WarningOutlined {...props} className="text-orange-500" />;
      case 'optimization':
        return <ThunderboltOutlined {...props} />;
      default:
        return <TeamOutlined {...props} />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card 
      title="Live Activity Feed" 
      size="small"
      extra={
        <Button 
          type="text" 
          icon={<ReloadOutlined />} 
          size="small"
          onClick={() => console.log('Refresh feed')}
        />
      }
      className="h-96 overflow-hidden"
    >
      <div className="h-full overflow-y-auto">
        <Timeline
          mode="left"
          items={activities.map(activity => ({
            dot: getActivityIcon(activity.type, activity.automated || false),
            children: (
              <div className="pb-2">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-gray-800 mb-1">
                    {activity.description}
                  </p>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.project_name && (
                    <Tag color="blue">
                      {activity.project_name}
                    </Tag>
                  )}
                  {activity.automated && (
                    <Tag color="purple">
                      AI Auto
                    </Tag>
                  )}
                </div>
              </div>
            )
          }))}
        />
      </div>
    </Card>
  );
};
