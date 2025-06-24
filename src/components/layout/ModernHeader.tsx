"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Layout, Avatar, Dropdown, Menu, Badge, Button, Space, Typography, Input } from 'antd';
import type { InputRef } from 'antd';
import { 
  BellOutlined, SettingOutlined, UserOutlined, LogoutOutlined,
  QuestionCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import { useFeatureFlagContext } from '@/components/shared/FeatureFlagProvider';
import { useRouter } from 'next/navigation';

const { Header } = Layout;
const { Title } = Typography;

export const ModernHeader: React.FC = () => {
  const router = useRouter();
  const { userContext, updateUserContext } = useFeatureFlagContext();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef<InputRef>(null);
  const [notifications] = useState([
    { id: 1, title: 'Project "RH Users_Current" completed', time: '2 min ago', type: 'success' },
    { id: 2, title: 'Quality alert: 3 responses flagged', time: '5 min ago', type: 'warning' },
    { id: 3, title: 'New supplier "DataDiggers" added', time: '1 hour ago', type: 'info' }
  ]);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
    },
    { type: 'divider' as const },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help & Support',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
    },
  ]; 

  const notificationMenuItems = [
    ...notifications.map(notif => ({
      key: notif.id,
      label: (
        <div className="py-2">
          <div className="font-medium text-sm">{notif.title}</div>
          <div className="text-xs text-gray-500">{notif.time}</div>
        </div>
      ),
    })),
    { type: 'divider' as const },
    {
      key: 'view-all',
      label: <div className="text-center text-blue-500">View All Notifications</div>,
    },
  ];

  const userMenu = { items: userMenuItems };
  const notificationMenu = { items: notificationMenuItems };

  const getRoleInfo = () => {
    const roleMap = {
      client: { label: 'Find Audience', color: '#1890ff', description: 'Standard interface' },
      internal: { label: 'Admin', color: '#722ed1', description: 'Full system access' }
    };
    return roleMap[userContext.role || 'client'];
  };

  const roleInfo = getRoleInfo();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Header
      className="backdrop-blur-md bg-white/70 dark:bg-[#0e1726]/70 shadow-lg px-8 py-2 flex items-center justify-between sticky top-0 z-50"
      style={{
        borderBottom: '1px solid rgba(120,120,180,0.11)',
        boxShadow: '0 2px 16px 0 rgba(60,60,130,0.08)',
        minHeight: 64,
      }}
    >
      {/* Left side - Logo and Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-3 min-w-0">

          <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-400 via-purple-500 to-fuchsia-600 relative">
            <span className="text-white font-extrabold text-lg tracking-wide drop-shadow-lg" style={{textShadow: '0 1px 8px rgba(80,0,180,0.18)'}}>RIWI</span>
            <span className="absolute -right-2 -bottom-2 w-3 h-3 rounded-full bg-gradient-to-br from-blue-300 to-purple-500 opacity-60 blur-sm" />
          </div>
          <span className="ml-2 text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent tracking-tight drop-shadow-sm select-none" style={{letterSpacing: '-0.01em'}}>Audience</span>
        </div>

        {/* Role indicator removed */}
      </div>

      {/* Center - Expandable Search */}
      <div className="flex items-center space-x-3">
        {searchExpanded ? (
          <div className="flex items-center relative transition-all duration-200 ease-in-out" style={{ width: '260px' }}>
            <Input
              placeholder="Search..."
              size="large"
              className="pr-10 rounded-full border-0 bg-white/50 focus:bg-white/70"
              style={{ boxShadow: '0 1px 8px 0 rgba(120,80,200,0.04)', fontWeight: 400, fontSize: '0.95rem' }}
              autoFocus
              ref={searchInputRef}
              onBlur={() => {
                if (!searchValue.trim()) {
                  setSearchExpanded(false);
                }
              }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={() => {
                if (searchValue.trim()) {
                  console.log('Searching for:', searchValue);
                  // Implement search functionality here
                }
              }}
            />
            {searchValue && (
              <Button 
                type="text" 
                size="small" 
                icon={<SearchOutlined />} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent"
                onClick={() => {
                  if (searchValue.trim()) {
                    console.log('Searching for:', searchValue);
                    // Implement search functionality here
                  }
                }}
              />
            )}
          </div>
        ) : (
          <Button 
            icon={<SearchOutlined style={{ fontSize: 18 }}/>} 
            size="middle"
            className="rounded-full bg-white/30 border-0 text-gray-400 hover:bg-white/40 hover:text-gray-600 transition-all duration-150"
            style={{ boxShadow: '0 1px 6px 0 rgba(120,80,200,0.04)' }}
            onClick={() => handleNavigation('/wizard')}
          />
        )} 
      </div>

      {/* Right side - User controls */}
      <div className="flex items-center space-x-4">
        {/* Role switcher removed */}

        {/* Notifications */}
        <Dropdown menu={notificationMenu} trigger={['click']}>
          <Badge count={notifications.length} offset={[0, 0]}>
            <Button 
              icon={<BellOutlined style={{ fontSize: 20 }} />} 
              type="text" 
              className="rounded-full bg-white/80 shadow-md border-0 text-purple-400 hover:bg-purple-100 hover:text-fuchsia-500 transition-all duration-150"
              style={{ boxShadow: '0 2px 16px 0 rgba(120,80,200,0.08)' }}
            />
          </Badge>
        </Dropdown>

        {/* User Menu */}
        <Dropdown menu={userMenu} trigger={['click']}>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-purple-50 px-2 py-1 rounded-full transition-all duration-150">
            <Avatar 
              size={32} 
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', fontWeight: 700, fontSize: 18 }}
            >
              {(userContext.role ? userContext.role.charAt(0).toUpperCase() : 'U')}
            </Avatar>
            <span className="font-semibold text-gray-700">{roleInfo.label}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};
