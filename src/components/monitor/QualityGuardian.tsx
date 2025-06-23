'use client';

// Update quality calculations to use original system fields
const calculateQualityMetrics = (projectData: any) => {
  const total = (projectData.count_complete || 0) + 
                (projectData.count_reject || 0) + 
                (projectData.count_terminate || 0);
  
  if (total === 0) return { quality_score: 100, fraud_rate: 0, completion_rate: 0 };
  
  return {
    quality_score: Math.round(((projectData.count_complete || 0) / total) * 100),
    fraud_rate: Math.round(((projectData.count_terminate || 0) / total) * 100),
    completion_rate: Math.round(((projectData.count_complete || 0) / (projectData.total_available || 1)) * 100)
  };
};

import React, { useState, useEffect } from 'react';

// Helper: get buyer action links
const getBuyerActionLinks = (buyer?: any) => {
  if (!buyer) return {};
  return {
    quality: buyer.quality_link || null,
    terminate: buyer.terminate_link || null
  };
};
import { Card, Alert, Progress, Tag, Button, Modal, List, Avatar, Statistic, Row, Col } from 'antd';
import { 
  CheckCircleOutlined, WarningOutlined, 
  RobotOutlined, EyeOutlined, SettingOutlined 
} from '@ant-design/icons';
import { aiQualityService } from '@/services/aiQuality';

interface QualityGuardianProps {
  projectId: string;
  enabled?: boolean;
}

interface QualityStats {
  total_alerts: number;
  auto_resolved: number;
  fraud_detected: number;
  auto_resolution_rate: number;
  fraud_rate: number;
  quality_score: number;
  buyer?: any;
}

export const QualityGuardian: React.FC<QualityGuardianProps> = ({
  projectId,
  enabled = true
}) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  // Track quality score trend
  const [qualityTrends, setQualityTrends] = useState<number[]>([]);

  useEffect(() => {
    if (!enabled || !projectId) return;

    // Start quality monitoring
    setIsMonitoring(true);
    const stopMonitoring = aiQualityService.startQualityMonitoring(projectId);

    // Update alerts and stats periodically
    const updateInterval = setInterval(() => {
      const projectAlerts = aiQualityService.getQualityAlerts(projectId);
      const projectStats = aiQualityService.getQualityStats(projectId);
      setAlerts(projectAlerts.slice(0, 10)); // Show last 10 alerts
      setStats(projectStats);
      // Track quality score trend for recommendations
      if (projectStats && typeof projectStats.quality_score === 'number') {
        setQualityTrends(prev => {
          const next = [...prev, projectStats.quality_score];
          return next.length > 20 ? next.slice(-20) : next;
        });
      }
    }, 2000);

    return () => {
      stopMonitoring();
      clearInterval(updateInterval);
      setIsMonitoring(false);
    };
  }, [projectId, enabled]);

  if (!enabled) {
    return (
      <Card title="AI Quality Guardian" className="shadow-md">
        <div className="text-center py-8">
          <RobotOutlined className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg text-gray-600 mb-2">Quality Guardian Disabled</h3>
          <p className="text-gray-500 mb-4">
            Enable AI-powered quality monitoring to automatically detect and handle fraud
          </p>
          <Button type="primary">Enable Quality Guardian</Button>
        </div>
      </Card>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fraud_detected': return <WarningOutlined className="text-red-500" />;
      case 'auto_replacement': return <CheckCircleOutlined className="text-green-500" />;
      default: return <WarningOutlined className="text-orange-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getStatusColor = (autoResolved: boolean) => {
    return autoResolved ? 'green' : 'orange';
  };

  // Recommendation based on quality trend
  const qualityRecommendation = (() => {
    if (qualityTrends.length < 5) return null;
    const last = qualityTrends[qualityTrends.length - 1];
    const prev = qualityTrends[qualityTrends.length - 5];
    if (last < 80 && last < prev) {
      return 'Quality score is dropping. Consider pausing the project or using the quality replacement link.';
    }
    if (last > prev) {
      return 'Quality is improving. Keep monitoring.';
    }
    return null;
  })();

  const detailsModal = (
    <Modal
      title="AI Quality Guardian Details"
      open={detailsVisible}
      onCancel={() => setDetailsVisible(false)}
      footer={null}
      width={700}
    >
      <div className="space-y-6">
        {stats && (
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Total Alerts"
                value={stats.total_alerts}
                prefix={<WarningOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Auto Resolved"
                value={stats.auto_resolved}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Fraud Detected"
                value={stats.fraud_detected}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Resolution Rate"
                value={stats.auto_resolution_rate}
                suffix="%"
                precision={1}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>
        )}

        <div>
          <h4 className="font-semibold mb-3">Recent Quality Alerts</h4>
          {qualityRecommendation && (
            <Alert
              message="Recommendation"
              description={qualityRecommendation}
              type="info"
              showIcon
              className="mb-4"
            />
          )}
          <List
            dataSource={alerts}
            renderItem={(alert) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={getAlertIcon(alert.type)} />}
                  title={
                    <div className="flex items-center justify-between">
                      <span>{alert.description}</span>
                      <Tag color={getStatusColor(alert.auto_resolved)}>
                        {alert.auto_resolved ? 'Auto-resolved' : 'Manual review'}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{alert.action_taken}</p>
                      <div className="flex items-center space-x-2">
                        <Tag 
                          color={alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'orange' : 'green'}
                        >
                          {alert.severity}
                        </Tag>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    </Modal>
  );

  return (
    <>
      <Card 
        title={
          <div className="flex items-center space-x-2">
            <CheckCircleOutlined className="text-blue-500" />
            <span>AI Quality Guardian</span>
            {isMonitoring && (
              <Tag color="green" className="ml-2">ACTIVE</Tag>
            )}
          </div>
        }
        extra={
          <div className="flex space-x-2">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              size="small"
              onClick={() => setDetailsVisible(true)}
            >
              Details
            </Button>
            <Button 
              type="link" 
              icon={<SettingOutlined />}
              size="small"
            >
              Settings
            </Button>
          </div>
        }
        className="shadow-md"
      >
        {/* Guardian Status */}
        <div className="mb-4">
          <Alert
            message="AI Guardian Active"
            description="Automatically monitoring response quality and detecting fraud in real-time"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="bg-green-50 border-green-200"
          />
        </div>

        {/* Quality Stats */}
        {stats && (
          <Row gutter={16} className="mb-4">
            <Col span={8}>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_alerts}</div>
                <div className="text-sm text-gray-600">Total Alerts</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.auto_resolved}</div>
                <div className="text-sm text-gray-600">Auto-Resolved</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.fraud_detected}</div>
                <div className="text-sm text-gray-600">Fraud Blocked</div>
              </div>
            </Col>
          </Row>
        )}

        {/* Auto-Resolution Rate */}
        {stats && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Auto-Resolution Rate</span>
              <span className="text-sm font-bold">{stats.auto_resolution_rate.toFixed(1)}%</span>
            </div>
            <Progress 
              percent={stats.auto_resolution_rate}
              strokeColor="#52c41a"
              showInfo={false}
            />
          </div>
        )}

        {/* Recent Alerts */}
        <div>
          <h4 className="font-semibold mb-3">Recent Activity</h4>
          {alerts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <CheckCircleOutlined className="text-2xl mb-2" />
              <p className="text-sm">No quality issues detected</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alerts.slice(0, 5).map(alert => {
                // Assume alert.buyer is available or get from stats/projectData if needed
                const buyer = stats?.buyer || alert.buyer;
                const links = getBuyerActionLinks(buyer);
                return (
                  <div 
                    key={alert.id}
                    className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{alert.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Tag 
                          color={getAlertColor(alert.severity)}
                        >
                          {alert.severity}
                        </Tag>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                        {links.quality && (
                          <Button size="small" type="link" href={links.quality} target="_blank">Quality Action</Button>
                        )}
                        {links.terminate && (
                          <Button size="small" type="link" danger href={links.terminate} target="_blank">Terminate</Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {detailsModal}
    </>
  );
};
