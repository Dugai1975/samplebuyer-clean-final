"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Row, Col, Statistic, Progress, Tag, Tabs, Alert, Typography } from 'antd';
import { 
  ArrowLeftOutlined, PlayCircleOutlined, PauseCircleOutlined, SettingOutlined,
  TeamOutlined, DollarOutlined, ClockCircleOutlined, CheckOutlined,
  TrophyOutlined, WarningOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useProjectLiveData } from '@/hooks/useRealTimeUpdates';
import { FieldMapper } from '@/utils/fieldMapping';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { QualityGuardian } from '@/components/monitor/QualityGuardian';
import { SupplierDashboard } from '@/components/suppliers/SupplierDashboard';
import { SupplierOptimizationPanel } from '@/components/monitor/SupplierOptimizationPanel';

const { Title } = Typography;

export default function ProjectMonitorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const userContext = undefined; // If user context is needed, get from elsewhere or set to undefined
  const { liveData, loading, error } = useProjectLiveData(projectId);

  // Add mapping for original system compatibility
  const mappedLiveData = React.useMemo(() => {
    if (!liveData) return null;
    return {
      ...liveData,
      project: {
        ...liveData.project,
        total_available: liveData.project.goal,
        count_complete: liveData.project.fielded,
        cpi_buyer: liveData.project.current_cpi ? Math.round(liveData.project.current_cpi * 100) : 0
      }
    };
  }, [liveData]);
  
  // All useState hooks must be called unconditionally before any conditional logic
  const [activeTab, setActiveTab] = useState('overview');
  
  // Move useFeatureFlag hooks to the top level to ensure consistent order
  const useRealTime = useFeatureFlag('real_time_updates', userContext);
  // Pre-declare any other feature flags that might be used conditionally later
  const aiQualityFeatures = useFeatureFlag('ai_quality_features', userContext);

  if (loading) {
    return (
      <div className="p-6">
        <Card loading style={{ minHeight: '400px' }} />
      </div>
    );
  }

  if (error || !mappedLiveData) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <WarningOutlined className="text-4xl text-red-500 mb-4" />
            <p className="text-red-500">Error loading project data</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { project, quotas, suppliers, recent_activity } = mappedLiveData;
  const completionRate = project.fielded && project.goal 
    ? (project.fielded / project.goal) * 100 
    : 0;
  const isCompleted = completionRate >= 100;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/')}
            size="large"
          >
            Back to Dashboard
          </Button>
          <div>
            <Title level={2} className="mb-0">{project.name}</Title>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">#{project.code}</span>
              <Tag color={project.state === 'live' ? 'green' : 'orange'} className="capitalize">
                {project.state}
              </Tag>
              {useRealTime && project.state === 'live' && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full pulse-animation" />
                  <span className="text-xs text-green-600 font-medium">LIVE</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button icon={<ReloadOutlined />} size="large">
            Refresh
          </Button>
          {project.state === 'live' ? (
            <Button 
              icon={<PauseCircleOutlined />} 
              size="large"
              type="primary"
              danger
            >
              Pause
            </Button>
          ) : (
            <Button 
              icon={<PlayCircleOutlined />} 
              size="large"
              type="primary"
              className="bg-green-500 hover:bg-green-600 border-green-500"
            >
              Resume
            </Button>
          )}
          <Button icon={<SettingOutlined />} size="large">
            Settings
          </Button>
        </div>
      </div>

      {/* Project Completion Alert */}
      {isCompleted && (
        <Alert
          message="🎉 Project Completed!"
          description={`Congratulations! You've collected ${project.fielded} responses with a ${project.quality_score}% quality score.`}
          type="success"
          showIcon
          className="mb-6"
          action={
            <Button type="primary" size="small">
              Download Data
            </Button>
          }
        />
      )}

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Completion Progress"
              value={project.fielded}
              suffix={`/ ${project.goal}`}
              prefix={<TeamOutlined className="text-blue-500" />}
            />
            <Progress 
              percent={Math.min(completionRate, 100)}
              strokeColor={isCompleted ? '#52c41a' : '#1890ff'}
              className="mt-2"
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Quality Score"
              value={project.quality_score}
              suffix="%"
              prefix={<CheckOutlined 
                className={
                  project.quality_score > 90 ? 'text-green-500' :
                  project.quality_score > 80 ? 'text-orange-500' : 'text-red-500'
                }
              />}
              valueStyle={{ 
                color: project.quality_score > 90 ? '#52c41a' : 
                       project.quality_score > 80 ? '#faad14' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Current CPI"
              value={project.current_cpi}
              prefix={<DollarOutlined className="text-green-500" />}
              precision={2}
            />
            <div className="text-xs text-gray-500 mt-1">
              Budget: ${project.budget_used?.toFixed(2)} / ${project.budget_total?.toFixed(2)}
            </div>
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Time Remaining"
              value={project.time_remaining || 'Unknown'}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
            />
            <div className="text-xs text-gray-500 mt-1">
              Health: {project.health_status}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        size="large"
        items={[
          {
            key: 'overview',
            label: 'Live Overview',
            children: (
              <Row gutter={[24, 24]}>
                {/* Quota Progress */}
                <Col xs={24} lg={12}>
                  <Card 
                    title="Quota Progress" 
                    extra={
                      <Button type="link" size="small">
                        Add Quota
                      </Button>
                    }
                    className="h-96"
                  >
                    <div className="space-y-4 overflow-y-auto max-h-80">
                      {quotas.map((quota: any) => (
                        <div key={quota.id} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{quota.name}</span>
                            <div className="flex items-center space-x-2">
                              <Tag color={
                                quota.status === 'completed' ? 'green' :
                                quota.status === 'active' ? 'blue' : 'gray'
                              }>
                                {quota.status}
                              </Tag>
                              <span className="text-sm font-bold">
                                {quota.current}/{quota.target}
                              </span>
                            </div>
                          </div>
                          <Progress 
                            percent={quota.percentage}
                            strokeColor={
                              quota.percentage >= 100 ? '#52c41a' :
                              quota.percentage >= 75 ? '#1890ff' :
                              quota.percentage >= 50 ? '#faad14' : '#ff4d4f'
                            }
                            size="small"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>

                {/* Supplier Performance */}
                <Col xs={24} lg={12}>
                  <Card 
                    title="Supplier Performance" 
                    extra={
                      <Button type="link" size="small">
                        View All
                      </Button>
                    }
                    className="h-96"
                  >
                    <div className="space-y-4 overflow-y-auto max-h-80">
                      {suppliers.map((supplier: any) => (
                        <div key={supplier.id} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{supplier.name}</span>
                            <Tag color={
                              supplier.status === 'active' ? 'green' : 'orange'
                            }>
                              {supplier.status}
                            </Tag>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{supplier.completes}</div>
                              <div className="text-gray-500">Completes</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600">{supplier.quality_score}%</div>
                              <div className="text-gray-500">Quality</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-orange-600">${supplier.current_cpi}</div>
                              <div className="text-gray-500">CPI</div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Button type="primary" size="small" block>
                              Clone Traffic
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>

                {/* Quality Guardian */}
                <Col xs={24} lg={12}>
                  <QualityGuardian 
                    projectId={projectId}
                    enabled={aiQualityFeatures}
                  />
                </Col>
              </Row>
            )
          },
          {
            key: 'suppliers',
            label: 'Suppliers',
            children: suppliers && (
              <SupplierOptimizationPanel suppliers={suppliers} projectId={project.uuid} />
            )
          },
          {
            key: 'activity',
            label: 'Recent Activity',
            children: (
              <Card className="h-96">
                <div className="space-y-3 overflow-y-auto max-h-80">
                  {recent_activity.map((activity: any) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'complete' && <TrophyOutlined className="text-green-500" />}
                        {activity.type === 'quality_issue' && <WarningOutlined className="text-orange-500" />}
                        {activity.type === 'optimization' && <TeamOutlined className="text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </span>
                          {activity.automated && (
                            <Tag color="purple">AI Auto</Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          },
          {
            key: 'export',
            label: 'Data Export',
            children: (
              <Card>
                <div className="text-center py-8">
                  <TrophyOutlined className="text-4xl text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Data Export Options</h3>
                  <p className="text-gray-600 mb-6">
                    Export your collected data in various formats
                  </p>
                  <div className="space-x-4">
                    <Button type="primary" size="large">
                      Download CSV
                    </Button>
                    <Button size="large">
                      Download Excel
                    </Button>
                    <Button size="large">
                      API Export
                    </Button>
                  </div>
                </div>
              </Card>
            )
          },
          {
            key: 'settings',
            label: 'Settings',
            children: (
              <Card>
                <div className="text-center py-8">
                  <SettingOutlined className="text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Project Settings</h3>
                  <p className="text-gray-600">
                    Modify project parameters and configurations
                  </p>
                </div>
              </Card>
            )
          }
        ]}
      />
    </div>
  );
}
