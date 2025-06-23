"use client";

import React from 'react';
import { Layout } from 'antd';
import { ModernHeader } from './ModernHeader';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout className="min-h-screen bg-gray-50">
      <ModernHeader />
      <Content className="flex-1">
        {children}
      </Content>
    </Layout>
  );
};
