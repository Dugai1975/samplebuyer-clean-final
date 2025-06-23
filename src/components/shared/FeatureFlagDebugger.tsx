'use client';

import React, { useState, useEffect } from 'react';
import { Card, Switch, Select, Tag, Button, Collapse } from 'antd';
import { useFeatureFlagContext } from './FeatureFlagProvider';
import { useMultipleFeatureFlags } from '@/hooks/useFeatureFlag';
import { defaultFeatureFlags } from '@/config/featureFlags';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

const { Option } = Select;

export const FeatureFlagDebugger: React.FC = () => {
  const { userContext, updateUserContext } = useFeatureFlagContext();
  const flags = useMultipleFeatureFlags(
    Object.keys(defaultFeatureFlags) as any[],
    userContext
  );
  const [visible, setVisible] = useState(true);
  
  // Check localStorage for visibility preference
  useEffect(() => {
    const storedVisibility = localStorage.getItem('devPanelVisible');
    if (storedVisibility !== null) {
      setVisible(storedVisibility === 'true');
    }
  }, []);
  
  // Save visibility preference
  const toggleVisibility = () => {
    const newVisibility = !visible;
    setVisible(newVisibility);
    localStorage.setItem('devPanelVisible', String(newVisibility));
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  if (!visible) {
    return (
      <Button 
        type="text" 
        icon={<EyeOutlined />} 
        size="small"
        className="fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100"
        onClick={toggleVisibility}
      >
        Show Dev Panel
      </Button>
    );
  }

  return (
    <Card 
      title="Feature Flags (Dev Only)" 
      size="small" 
      className="mb-4 border-dashed border-gray-200 bg-gray-50 opacity-80 hover:opacity-100 transition-opacity"
      style={{ maxWidth: '400px', marginLeft: 'auto' }}
      extra={<Button type="text" icon={<EyeInvisibleOutlined />} size="small" onClick={toggleVisibility} />}
    >
      <Collapse ghost items={[
        {
          key: '1',
          label: 'Role & User Settings',
          children: (
            <>
              <div className="mb-4">
                <span className="mr-2">Role:</span>
                <Select
                  value={userContext.role ?? 'client'}
                  style={{ width: 120, marginRight: 16 }}
                  onChange={(value) => updateUserContext({ role: value as 'internal' | 'client' })}
                >
                  <Option value="client">Client User</Option>
                  <Option value="internal">Internal User</Option>
                </Select>
                
                <span className="mr-2">Beta Tester:</span>
                <Switch
                  checked={userContext.betaTester || false}
                  onChange={(checked) => updateUserContext({ betaTester: checked })}
                />
              </div>
              
              <div className="text-xs text-gray-500">
                User ID: {userContext.userId}
              </div>
            </>
          )
        },
        {
          key: '2',
          label: 'Feature Flag Status',
          children: (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(flags).map(([flagName, enabled]) => (
                <div key={flagName} className="flex justify-between items-center">
                  <span className="text-sm">{flagName}</span>
                  <Tag color={enabled ? 'green' : 'red'}>
                    {enabled ? 'ON' : 'OFF'}
                  </Tag>
                </div>
              ))}
            </div>
          )
        }
      ]} />
    </Card>
  );
};
