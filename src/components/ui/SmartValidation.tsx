'use client';

import React from 'react';
import { Alert, Progress, List, Typography, Space, Tag } from 'antd';
import { CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ValidationItem {
  id: string;
  label: string;
  status: 'success' | 'warning' | 'error' | 'loading';
  message?: string;
  required?: boolean;
}

interface SmartValidationProps {
  items: ValidationItem[];
  title?: string;
  showProgress?: boolean;
}

export const SmartValidation: React.FC<SmartValidationProps> = ({
  items,
  title = "Setup Progress",
  showProgress = true
}) => {
  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleOutlined className="text-green-500" />;
      case 'warning': return <WarningOutlined className="text-orange-500" />;
      case 'error': return <CloseCircleOutlined className="text-red-500" />;
      case 'loading': return <LoadingOutlined className="text-blue-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'warning': return 'orange';
      case 'error': return 'red';
      case 'loading': return 'blue';
      default: return 'default';
    }
  };

  const successCount = items.filter(item => item.status === 'success').length;
  const totalRequired = items.filter(item => item.required !== false).length;
  const progressPercent = totalRequired > 0 ? (successCount / totalRequired) * 100 : 0;

  return (
    <div className="space-y-4">
      {showProgress && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <Text strong>{title}</Text>
            <Text type="secondary">{successCount}/{totalRequired} Complete</Text>
          </div>
          <Progress 
            percent={Math.round(progressPercent)} 
            status={progressPercent === 100 ? 'success' : 'active'}
            size="small"
          />
        </div>
      )}
      
      <List
        size="small"
        dataSource={items}
        renderItem={(item) => (
          <List.Item className="px-0">
            <Space align="start" className="w-full">
              {getIcon(item.status)}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <Text strong={item.status === 'error'}>{item.label}</Text>
                  <Tag color={getStatusColor(item.status)} className="text-xs">
                    {item.status}
                  </Tag>
                </div>
                {item.message && (
                  <Text type="secondary" className="text-sm block mt-1">
                    {item.message}
                  </Text>
                )}
              </div>
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
};
