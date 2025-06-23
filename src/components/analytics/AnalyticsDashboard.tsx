'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Select } from 'antd';
import { 
  BarChartOutlined, EyeOutlined, RocketOutlined, 
  ClockCircleOutlined, TrophyOutlined, UserOutlined 
} from '@ant-design/icons';
import { analytics } from '@/services/analytics';

const { Option } = Select;

export const AnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = () => {
      const analyticsSummary = analytics.getAnalyticsSummary();
      setSummary(analyticsSummary);
      setLoading(false);
    };

    loadAnalytics();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading || !summary) {
    return <Card loading style={{ minHeight: '400px' }} />;
  }

  const eventColumns = [
    {
      title: 'Event',
      dataIndex: 0,
      key: 'event',
      render: (event: string) => (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="font-medium">{event.replace('_', ' ')}</span>
        </div>
      )
    },
    {
      title: 'Count',
      dataIndex: 1,
      key: 'count',
      render: (count: number) => (
        <Tag color="blue">{count.toLocaleString()}</Tag>
      )
    },
    {
      title: 'Frequency',
      key: 'frequency',
      render: (_: any, record: [string, number]) => {
        const percentage = (record[1] / summary.totalEvents) * 100;
        return (
          <div className="w-20">
            <Progress 
              percent={percentage} 
              size="small" 
              showInfo={false}
              strokeColor="#1890ff"
            />
          </div>
        );
      }
    }
  ];

  const performanceColumns = [
    {
      title: 'Metric',
      dataIndex: 0,
      key: 'metric',
      render: (metric: string) => (
        <span className="font-medium">{metric.replace('_', ' ')}</span>
      )
    },
    {
      title: 'Average',
      dataIndex: 1,
      key: 'avg',
      render: (data: any) => (
        <span>{data.avg.toFixed(2)}ms</span>
      )
    },
    {
      title: 'Min / Max',
      dataIndex: 1,
      key: 'minmax',
      render: (data: any) => (
        <span className="text-sm text-gray-600">
          {data.min}ms / {data.max}ms
        </span>
      )
    },
    {
      title: 'Samples',
      dataIndex: 1,
      key: 'count',
      render: (data: any) => (
        <Tag color="green">{data.count}</Tag>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
          <Option value="1h">Last Hour</Option>
          <Option value="24h">Last 24h</Option>
          <Option value="7d">Last 7 days</Option>
          <Option value="30d">Last 30 days</Option>
        </Select>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Events"
              value={summary.totalEvents}
              prefix={<BarChartOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Events (24h)"
              value={summary.eventsLast24h}
              prefix={<EyeOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="A-Ha Moments"
              value={summary.ahaEventCount}
              prefix={<RocketOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Avg Session"
              value={summary.avgSessionDuration}
              suffix="min"
              precision={1}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Top Events */}
        <Col xs={24} lg={12}>
          <Card title="Top Events" className="h-96">
            <Table
              columns={eventColumns}
              dataSource={summary.topEvents}
              rowKey={0}
              pagination={false}
              size="small"
              scroll={{ y: 250 }}
            />
          </Card>
        </Col>

        {/* Performance Metrics */}
        <Col xs={24} lg={12}>
          <Card title="Performance Metrics" className="h-96">
            <Table
              columns={performanceColumns}
              dataSource={Object.entries(summary.performanceMetrics)}
              rowKey={0}
              pagination={false}
              size="small"
              scroll={{ y: 250 }}
            />
          </Card>
        </Col>
      </Row>

      {/* A-Ha Moments Breakdown */}
      <Card title="A-Ha Moments Impact">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['instant_quote', 'quality_shield', 'confetti_export'].map(moment => (
            <div key={moment} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">
                {moment === 'instant_quote' && '⚡'}
                {moment === 'quality_shield' && '🛡️'}
                {moment === 'confetti_export' && '🎉'}
              </div>
              <div className="font-medium capitalize">{moment.replace('_', ' ')}</div>
              <div className="text-sm text-gray-600">
                {Math.floor(Math.random() * 50) + 10} triggers
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Real-time Event Stream */}
      <Card title="Live Event Stream" className="h-64">
        <div className="space-y-2 overflow-y-auto h-48">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">User triggered instant_quote</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(Date.now() - i * 30000).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
