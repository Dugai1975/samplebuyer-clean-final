'use client';

import React from 'react';
import { Card, Button, Row, Col, Tag, Progress, Statistic } from 'antd';
import { 
  ThunderboltOutlined, TeamOutlined, DollarOutlined, TrophyOutlined,
  SettingOutlined, BulbOutlined, FileTextOutlined, CheckOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { usePersona } from './PersonaAdapter';
import { PersonaFeature, PersonaComplexity, PersonaTooltip } from './PersonaFeatures';

interface PersonaDashboardProps {
  projects: any[];
  onCreateProject: () => void;
}

export const PersonaDashboard: React.FC<PersonaDashboardProps> = ({
  projects,
  onCreateProject
}) => {
  const { userRole, complexity, preferences } = usePersona();

  const getRoleGreeting = () => {
    switch (userRole) {
      case 'internal':
        return {
          title: 'Internal Admin Dashboard',
          subtitle: 'Platform management & advanced controls',
          color: '#722ed1'
        };
      case 'client':
        return {
          title: 'Audience',
          subtitle: 'Professional sample sourcing platform',
          color: '#1890ff'
        };
      default:
        return {
          title: 'Audience',
          subtitle: 'Professional sample sourcing platform',
          color: '#1890ff'
        };
    }
  };

  const greeting = getRoleGreeting();

  const getQuickActions = () => {
    const baseActions = [
      {
        key: 'create',
        title: 'New Project',
        icon: <ThunderboltOutlined />,
        onClick: onCreateProject,
        color: 'green'
      }
    ];

    const roleActions = {
      internal: [
        {
          key: 'platform_analytics',
          title: 'Platform Analytics',
          icon: <BarChartOutlined />,
          onClick: () => console.log('Platform analytics'),
          color: 'purple'
        },
        {
          key: 'supplier_management',
          title: 'Supplier Management',
          icon: <TeamOutlined />,
          onClick: () => console.log('Supplier management'),
          color: 'blue'
        },
        {
          key: 'compliance',
          title: 'Compliance Dashboard',
          icon: <CheckOutlined />,
          onClick: () => console.log('Compliance dashboard'),
          color: 'orange'
        },
        {
          key: 'api_console',
          title: 'API Console',
          icon: <SettingOutlined />,
          onClick: () => console.log('API console'),
          color: 'red'
        }
      ],
      client: [
        {
          key: 'clone',
          title: 'Clone Project',
          icon: <BulbOutlined />,
          onClick: () => console.log('Clone project'),
          color: 'blue'
        },
        {
          key: 'template',
          title: 'Use Template',
          icon: <FileTextOutlined />,
          onClick: () => console.log('Use template'),
          color: 'green'
        },
        {
          key: 'bulk_actions',
          title: 'Bulk Actions',
          icon: <SettingOutlined />,
          onClick: () => console.log('Bulk actions'),
          color: 'purple'
        }
      ]
    };

    return [...baseActions, ...(roleActions[userRole] || [])];
  };

  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Persona Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: greeting.color }}>
              {greeting.title}
            </h1>
            <p className="text-gray-600">{greeting.subtitle}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Tag color={greeting.color} className="capitalize">
                {userRole === 'internal' ? 'Internal' : 'Client'} Mode
              </Tag>
              <Tag color="default">
                {complexity} Interface
              </Tag>
              {preferences.compactMode && (
                <Tag color="green">Compact View</Tag>
              )}
            </div>
          </div>
          
          <PersonaFeature feature="efficiency_metrics">
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">+23%</div>
              <div className="text-sm text-gray-600">Efficiency Gain</div>
            </div>
          </PersonaFeature>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="shadow-md">
        <Row gutter={[16, 16]}>
          {quickActions.map(action => (
            <Col xs={12} sm={8} md={6} key={action.key}>
              <PersonaTooltip
                title={action.title}
                content={`Click to ${action.title.toLowerCase()}`}
              >
                <Button
                  type="dashed"
                  size="large"
                  icon={action.icon}
                  onClick={action.onClick}
                  className="w-full h-20 flex flex-col items-center justify-center"
                  style={{ borderColor: action.color }}
                >
                  <div className="text-sm mt-1">{action.title}</div>
                </Button>
              </PersonaTooltip>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Persona-Specific Widgets */}
      <Row gutter={[24, 24]}>
        {/* Agency: Margin Tracking */}
        <PersonaFeature feature="margin_tracking">
          <Col xs={24} lg={8}>
            <Card title="Margin Analysis" className="shadow-md">
              <Statistic
                title="Average Margin"
                value={34.5}
                suffix="%"
                prefix={<DollarOutlined className="text-green-500" />}
                valueStyle={{ color: '#52c41a' }}
              />
              <Progress percent={85} strokeColor="#52c41a" className="mt-2" />
              <div className="text-xs text-gray-500 mt-2">
                Target: 30% | Current: 34.5%
              </div>
            </Card>
          </Col>
        </PersonaFeature>

        {/* Corporate: Compliance Status */}
        <PersonaFeature feature="compliance_tracking">
          <Col xs={24} lg={8}>
            <Card title="Compliance Status" className="shadow-md">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>GDPR Compliance</span>
                  <Tag color="green">✓ Compliant</Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>Data Retention</span>
                  <Tag color="green">✓ Compliant</Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>Audit Trail</span>
                  <Tag color="blue">Active</Tag>
                </div>
              </div>
            </Card>
          </Col>
        </PersonaFeature>

        {/* Junior: Learning Progress */}
        <PersonaFeature feature="tutorial_mode">
          <Col xs={24} lg={8}>
            <Card title="Learning Progress" className="shadow-md">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Platform Basics</span>
                    <span className="text-sm font-medium">100%</span>
                  </div>
                  <Progress percent={100} size="small" strokeColor="#52c41a" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Project Creation</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <Progress percent={75} size="small" strokeColor="#1890ff" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Quality Management</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <Progress percent={25} size="small" strokeColor="#faad14" />
                </div>
              </div>
            </Card>
          </Col>
        </PersonaFeature>

        {/* Senior: API Usage */}
        <PersonaFeature feature="api_access">
          <Col xs={24} lg={8}>
            <Card title="API Usage" className="shadow-md">
              <Statistic
                title="API Calls Today"
                value={1247}
                prefix={<SettingOutlined className="text-purple-500" />}
              />
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rate Limit</span>
                  <span>5000/day</span>
                </div>
                <Progress 
                  percent={(1247/5000) * 100} 
                  size="small" 
                  strokeColor="#722ed1" 
                />
              </div>
            </Card>
          </Col>
        </PersonaFeature>
      </Row>

      {/* Advanced Options Toggle */}
      <PersonaComplexity level="advanced">
        <Card title="Advanced Options" className="shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PersonaFeature feature="custom_fields">
              <Button type="dashed" block>Custom Fields</Button>
            </PersonaFeature>
            <PersonaFeature feature="advanced_filters">
              <Button type="dashed" block>Advanced Filters</Button>
            </PersonaFeature>
            <PersonaFeature feature="integration_tools">
              <Button type="dashed" block>Integrations</Button>
            </PersonaFeature>
            <PersonaFeature feature="custom_dashboards">
              <Button type="dashed" block>Custom Dashboard</Button>
            </PersonaFeature>
          </div>
        </Card>
      </PersonaComplexity>
    </div>
  );
};
