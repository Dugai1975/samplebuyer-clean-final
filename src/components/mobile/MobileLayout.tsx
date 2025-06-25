'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Drawer, Button, Badge, Avatar } from 'antd';
import { 
  MenuOutlined, BellOutlined, PlusOutlined, HomeOutlined,
  SettingOutlined, UserOutlined, CloseOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useFeatureFlagContext } from '@/components/shared/FeatureFlagProvider';

const { Header, Content } = Layout;

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { userContext } = useFeatureFlagContext();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
  { key: 'dashboard', path: '/', icon: <HomeOutlined />, label: 'Dashboard', active: pathname === '/' },
  { key: 'feasibility', path: '/feasibility', icon: <ThunderboltOutlined />, label: 'Check Feasibility', active: pathname === '/feasibility' },
  { key: 'wizard', path: '/wizard', icon: <PlusOutlined />, label: 'Create Project', active: pathname === '/wizard' },
  { key: 'settings', path: '/settings', icon: <SettingOutlined />, label: 'Settings', active: pathname === '/settings' }
];

  const handleNavigation = (path: string) => {
    router.push(path);
    setDrawerVisible(false);
  };

  if (!isMobile) {
    return <Layout className="min-h-screen">{children}</Layout>;
  }

  return (
    <Layout className="min-h-screen">
      {/* Mobile Header */}
      <Header className="mobile-header bg-white border-b border-gray-200 p-0">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-3">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              className="touch-target"
            />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RIWI</span>
              </div>
              <span className="font-semibold text-gray-800 hidden sm:block">
                <span className="text-white">Audience</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="touch-target"
              />
            </Badge>
            <Avatar 
              size="small" 
              icon={<UserOutlined />}
              className="bg-blue-500"
            />
          </div>
        </div>
      </Header>

      {/* Content */}
      <Content className="flex-1 bg-gray-50 pb-20">
        {children}
      </Content>

      {/* Bottom Navigation */}
      <div className="mobile-nav">
        <div className="flex items-center justify-around">
          {navigationItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleNavigation(item.path)}
              className={`mobile-nav-item ${
                item.active ? 'text-blue-500 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Side Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span>Menu</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setDrawerVisible(false)}
            />
          </div>
        }
        placement="left"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={280}
        className="mobile-drawer"
      >
        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar 
                size="large" 
                icon={<UserOutlined />}
                className="bg-blue-500"
              />
              <div>
                <div className="font-medium">
                  {userContext.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {userContext.role === 'internal' ? 'Internal' : 'Client'} Mode
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {navigationItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Quick Actions</div>
            <div className="space-y-2">
              <Button 
                type="primary" 
                block 
                size="large"
                icon={<PlusOutlined />}
                onClick={() => handleNavigation('/wizard')}
              >
                Find Audience
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </Layout>
  );
};
