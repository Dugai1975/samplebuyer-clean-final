'use client';

import React, { useState } from 'react';
import { Card, Collapse, Badge, Button, Space, Typography } from 'antd';
import { DownOutlined, UpOutlined, SettingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ProgressiveDisclosureProps {
  title: string;
  primaryContent: React.ReactNode;
  secondaryContent?: React.ReactNode;
  badge?: string | number;
  defaultExpanded?: boolean;
  showAdvanced?: boolean;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title,
  primaryContent,
  secondaryContent,
  badge,
  defaultExpanded = false,
  showAdvanced = true
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card className="mb-4">
      <div className="mb-4">
        <Space align="center" className="w-full justify-between">
          <Space>
            <Text strong className="text-lg">{title}</Text>
            {badge && <Badge count={badge} color="blue" />}
          </Space>
          {showAdvanced && secondaryContent && (
            <Button
              type="link"
              icon={expanded ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setExpanded(!expanded)}
              className="text-sm"
            >
              {expanded ? 'Hide' : 'Show'} Advanced
            </Button>
          )}
        </Space>
      </div>
      
      <div className="mb-4">
        {primaryContent}
      </div>
      
      {expanded && secondaryContent && (
        <div className="border-t pt-4 mt-4">
          <div className="text-sm text-gray-600 mb-2">
            <SettingOutlined className="mr-1" />
            Advanced Settings
          </div>
          {secondaryContent}
        </div>
      )}
    </Card>
  );
};
