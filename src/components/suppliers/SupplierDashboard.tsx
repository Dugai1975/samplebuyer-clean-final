"use client";

import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Progress, Switch, Modal, Form, InputNumber, Select, Row, Col, Statistic, Alert } from 'antd';
import { 
  PlayCircleOutlined, PauseCircleOutlined, CopyOutlined, SettingOutlined,
  TrophyOutlined, DollarOutlined, TeamOutlined, ThunderboltOutlined,
  WarningOutlined, CheckCircleOutlined, EyeOutlined
} from '@ant-design/icons';
import { SupplierPerformance } from '@/types/enhanced';

const { Option } = Select;

interface SupplierDashboardProps {
  projectId: string;
  suppliers: SupplierPerformance[];
  onSupplierUpdate: (supplierId: string, updates: Partial<SupplierPerformance>) => void;
  onCloneTraffic: (supplierId: string) => void;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({
  projectId,
  suppliers,
  onSupplierUpdate,
  onCloneTraffic
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierPerformance | null>(null);
  const [cloneModalVisible, setCloneModalVisible] = useState(false);
  const [optimizeModalVisible, setOptimizeModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 75) return '#1890ff';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'orange';
      case 'blocked': return 'red';
      default: return 'gray';
    }
  };

  const calculateOverallPerformance = (supplier: SupplierPerformance) => {
    const qualityWeight = 0.4;
    const reliabilityWeight = 0.3;
    const responseTimeWeight = 0.3;
    
    const responseTimeScore = Math.max(0, 100 - (supplier.response_time * 10));
    
    return Math.round(
      supplier.quality_score * qualityWeight +
      supplier.reliability_score * reliabilityWeight +
      responseTimeScore * responseTimeWeight
    );
  };

  const handleCloneTraffic = (supplier: SupplierPerformance) => {
    setSelectedSupplier(supplier);
    setCloneModalVisible(true);
  };

  const handleOptimizeSupplier = (supplier: SupplierPerformance) => {
    setSelectedSupplier(supplier);
    form.setFieldsValue({
      cpi_adjustment: 0,
      priority_level: 'normal',
      capacity_limit: 100
    });
    setOptimizeModalVisible(true);
  };

  const confirmCloneTraffic = () => {
    if (selectedSupplier) {
      onCloneTraffic(selectedSupplier.id);
      setCloneModalVisible(false);
      setSelectedSupplier(null);
    }
  };

  const confirmOptimization = () => {
    if (selectedSupplier) {
      const values = form.getFieldsValue();
      onSupplierUpdate(selectedSupplier.id, {
        current_cpi: selectedSupplier.current_cpi + values.cpi_adjustment
      });
      setOptimizeModalVisible(false);
      setSelectedSupplier(null);
    }
  };

  const columns = [
    {
      title: 'Supplier',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: SupplierPerformance) => (
        <div>
          <div className="font-medium">{name}</div>
          <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
        </div>
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: any, record: SupplierPerformance) => {
        const overallScore = calculateOverallPerformance(record);
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Overall</span>
              <span className="font-bold">{overallScore}</span>
            </div>
            <Progress 
              percent={overallScore}
              strokeColor={getPerformanceColor(overallScore)}
              size="small"
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'Completes',
      dataIndex: 'completes',
      key: 'completes',
      render: (completes: number) => (
        <Statistic 
          value={completes} 
          prefix={<TeamOutlined className="text-blue-500" />}
          valueStyle={{ fontSize: '16px' }}
        />
      ),
    },
    {
      title: 'Quality',
      dataIndex: 'quality_score',
      key: 'quality_score',
      render: (score: number) => (
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: getPerformanceColor(score) }}>
            {score}%
          </div>
          <div className="text-xs text-gray-500">Quality</div>
        </div>
      ),
    },
    {
      title: 'CPI',
      dataIndex: 'current_cpi',
      key: 'current_cpi',
      render: (cpi: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            ${cpi.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">Current</div>
        </div>
      ),
    },
    {
      title: 'Response Time',
      dataIndex: 'response_time',
      key: 'response_time',
      render: (time: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">
            {time.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500">Avg Response</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SupplierPerformance) => (
        <div className="flex space-x-1">
          <Button
            type="text"
            icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            size="small"
            onClick={() => onSupplierUpdate(record.id, { 
              status: record.status === 'active' ? 'paused' : 'active' 
            })}
          />
          <Button
            type="text"
            icon={<CopyOutlined />}
            size="small"
            onClick={() => handleCloneTraffic(record)}
            disabled={record.status !== 'active' || record.quality_score < 80}
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            size="small"
            onClick={() => handleOptimizeSupplier(record)}
          />
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => console.log('View details:', record.id)}
          />
        </div>
      ),
    },
  ];

  const topPerformer = suppliers.reduce((best, current) => {
    const currentScore = calculateOverallPerformance(current);
    const bestScore = calculateOverallPerformance(best);
    return currentScore > bestScore ? current : best;
  }, suppliers[0]);

  const totalCompletes = suppliers.reduce((sum, supplier) => sum + supplier.completes, 0);
  const avgQuality = suppliers.reduce((sum, supplier) => sum + supplier.quality_score, 0) / suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Supplier Overview Stats */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Suppliers"
              value={activeSuppliers}
              suffix={`/ ${suppliers.length}`}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Completes"
              value={totalCompletes}
              prefix={<TrophyOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Quality"
              value={avgQuality}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined className="text-purple-500" />}
              valueStyle={{ color: getPerformanceColor(avgQuality) }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Top Performer"
              value={topPerformer?.name || 'N/A'}
              prefix={<TrophyOutlined className="text-yellow-500" />}
              valueStyle={{ fontSize: '14px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Alerts */}
      {suppliers.some(s => s.quality_score < 80) && (
        <Alert
          message="Quality Alert"
          description="Some suppliers have quality scores below 80%. Consider pausing or optimizing their traffic."
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary">
              Auto-Optimize
            </Button>
          }
        />
      )}

      {/* Supplier Table */}
      <Card 
        title="Supplier Performance" 
        extra={
          <div className="space-x-2">
            <Button icon={<ThunderboltOutlined />} type="primary" size="small">
              AI Optimize All
            </Button>
            <Button icon={<SettingOutlined />} size="small">
              Manage Suppliers
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Traffic Clone Modal */}
      <Modal
        title="Clone Supplier Traffic"
        open={cloneModalVisible}
        onCancel={() => setCloneModalVisible(false)}
        onOk={confirmCloneTraffic}
        okText="Clone Traffic"
        okButtonProps={{ type: 'primary' }}
      >
        {selectedSupplier && (
          <div className="space-y-4">
            <Alert
              message="Clone High-Performing Traffic"
              description={`Clone traffic settings from ${selectedSupplier.name} to scale successful performance across other suppliers.`}
              type="info"
              showIcon
            />
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Source Supplier Performance:</h4>
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{selectedSupplier.quality_score}%</div>
                    <div className="text-sm text-gray-600">Quality Score</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{selectedSupplier.completes}</div>
                    <div className="text-sm text-gray-600">Completes</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">${selectedSupplier.current_cpi}</div>
                    <div className="text-sm text-gray-600">CPI</div>
                  </div>
                </Col>
              </Row>
            </div>

            <p className="text-sm text-gray-600">
              This will apply the same targeting criteria, CPI settings, and quality filters to other active suppliers.
            </p>
          </div>
        )}
      </Modal>

      {/* Optimization Modal */}
      <Modal
        title="Optimize Supplier Settings"
        open={optimizeModalVisible}
        onCancel={() => setOptimizeModalVisible(false)}
        onOk={confirmOptimization}
        okText="Apply Optimization"
        okButtonProps={{ type: 'primary' }}
      >
        {selectedSupplier && (
          <Form form={form} layout="vertical">
            <Alert
              message={`Optimizing: ${selectedSupplier.name}`}
              description="Adjust supplier settings to improve performance and cost efficiency."
              type="info"
              className="mb-4"
            />

            <Form.Item
              label="CPI Adjustment"
              name="cpi_adjustment"
              help="Positive values increase CPI, negative values decrease it"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={-5}
                max={5}
                step={0.25}
                prefix="$"
              />
            </Form.Item>

            <Form.Item
              label="Priority Level"
              name="priority_level"
            >
              <Select>
                <Option value="low">Low Priority</Option>
                <Option value="normal">Normal Priority</Option>
                <Option value="high">High Priority</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Capacity Limit (%)"
              name="capacity_limit"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={200}
                suffix="%"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};
