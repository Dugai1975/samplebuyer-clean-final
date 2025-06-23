'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Dropdown, Menu, List, Tag, Avatar } from 'antd';
import { 
  BellOutlined, CheckCircleOutlined, WarningOutlined, 
  InfoCircleOutlined, ClearOutlined 
} from '@ant-design/icons';

interface Notification {
  id: number;
  type: 'completion' | 'quality' | 'supplier' | 'quota';
  message: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
  read?: boolean;
}

interface LiveNotificationsProps {
  notifications: Notification[];
  onClear?: () => void;
}

export const LiveNotifications: React.FC<LiveNotificationsProps> = ({
  notifications,
  onClear
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const getNotificationIcon = (type: string, severity?: string) => {
    switch (type) {
      case 'completion':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'quality':
        return <WarningOutlined className={
          severity === 'high' ? 'text-red-500' :
          severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'
        } />;
      case 'supplier':
        return <InfoCircleOutlined className="text-blue-500" />;
      default:
        return <InfoCircleOutlined className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'completion': return 'green';
      case 'quality': return 'orange';
      case 'supplier': return 'blue';
      default: return 'gray';
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
    
    return time.toLocaleDateString();
  };

  const notificationMenu = (
    <Menu style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
      <Menu.Item key="header" disabled>
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold">Live Notifications</span>
          {notifications.length > 0 && (
            <Button 
              type="text" 
              size="small" 
              icon={<ClearOutlined />}
              onClick={onClear}
            >
              Clear
            </Button>
          )}
        </div>
      </Menu.Item>
      <Menu.Divider />
      
      {notifications.length === 0 ? (
        <Menu.Item key="empty" disabled>
          <div className="text-center py-4 text-gray-500">
            No notifications yet
          </div>
        </Menu.Item>
      ) : (
        notifications.slice(0, 10).map(notification => (
          <Menu.Item key={notification.id} style={{ height: 'auto', padding: '8px 12px' }}>
            <div className="flex items-start space-x-3">
              <Avatar 
                size="small" 
                icon={getNotificationIcon(notification.type, notification.severity)}
                className="flex-shrink-0 mt-1"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 mb-1 break-words">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between">
                  <Tag 
                    color={getNotificationColor(notification.type)}
                  >
                    {notification.type}
                  </Tag>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(notification.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </Menu.Item>
        ))
      )}
      
      {notifications.length > 10 && (
        <>
          <Menu.Divider />
          <Menu.Item key="view-all" disabled>
            <div className="text-center text-blue-500">
              View all {notifications.length} notifications
            </div>
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <Dropdown 
      overlay={notificationMenu} 
      trigger={['click']}
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
      placement="bottomRight"
    >
      <Button 
        type="text" 
        icon={
          <Badge count={unreadCount} size="small" offset={[0, 0]}>
            <BellOutlined className="text-lg" />
          </Badge>
        }
        className="hover:bg-gray-100"
      />
    </Dropdown>
  );
};
