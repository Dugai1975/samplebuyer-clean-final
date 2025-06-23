"use client";

import React, { useState, useEffect } from 'react';
import { Card, Statistic, Progress, Alert, Button, Slider, Tag, Spin, Row, Col } from 'antd';
import { 
  ThunderboltOutlined, TeamOutlined, DollarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, WarningOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import type { FeasibilityData } from '@project-types';
import { apiService } from '@/services/api';

interface FeasibilityEngineProps {
  projectData: {
    country: string;
    completes: number;
    incidence_rate: number;
    loi_minutes: number;
    demographics?: any;
  };
  onFeasibilityUpdate: (data: FeasibilityData) => void;
}

export const FeasibilityEngine: React.FC<FeasibilityEngineProps> = ({
  projectData,
  onFeasibilityUpdate
}) => {
  const [feasibility, setFeasibility] = useState<FeasibilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [completesSlider, setCompletesSlider] = useState(projectData.completes);
  const [lastCalculation, setLastCalculation] = useState<Date | null>(null);

  // Calculate feasibility with debouncing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (completesSlider && projectData.country && projectData.incidence_rate) {
        setLoading(true);
        try {
          const criteria = {
            ...projectData,
            completes: completesSlider,
            incidence_rate: projectData.incidence_rate
          };
          
          // MOCK DATA START
          const startTime = Date.now();
          const result = {
            available_respondents: 260,
            estimated_cpi: 4.5,
            estimated_timeline_days: 3,
            confidence_level: 92,
            supplier_breakdown: [
              { supplier_name: 'Supplier A', available: 120, cpi: 4.5, quality_rating: 95 },
              { supplier_name: 'Supplier B', available: 80, cpi: 4.8, quality_rating: 90 },
              { supplier_name: 'Supplier C', available: 60, cpi: 5.0, quality_rating: 88 }
            ],
            recommendations: [
              'Increase incidence rate for faster results.',
              'Consider adding more suppliers for better reach.'
            ]
          };
          const calculationTime = Date.now() - startTime;
          
          setFeasibility(result);
          onFeasibilityUpdate(result);
          setLastCalculation(new Date());
          
          // Track A-Ha moment if calculation was fast
          if (calculationTime < 2000) {
            console.log('⚡ A-Ha Moment: Instant feasibility in', calculationTime, 'ms');
          }
          // MOCK DATA END
        } catch (error) {
          console.error('Feasibility calculation failed:', error);
        } finally {
          setLoading(false);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [completesSlider, projectData, onFeasibilityUpdate]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return '#52c41a';
    if (confidence >= 70) return '#1890ff';
    if (confidence >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const getTimelineRecommendation = (days: number) => {
    if (days <= 1) return { text: 'Same day delivery', color: 'green', icon: '🚀' };
    if (days <= 3) return { text: 'Fast delivery', color: 'blue', icon: '⚡' };
    if (days <= 7) return { text: 'Standard delivery', color: 'orange', icon: '📋' };
    return { text: 'Extended timeline', color: 'red', icon: '⏰' };
  };

  if (!feasibility && !loading) {
    return (
      <Card className="text-center py-8">
        <ThunderboltOutlined className="text-4xl text-gray-400 mb-4" />
        <h3 className="text-lg text-gray-600">Calculating Feasibility...</h3>
        <p className="text-gray-500">Please wait while we analyze your requirements</p>
      </Card>
    );
  }

  const timelineRec = feasibility ? getTimelineRecommendation(feasibility.estimated_timeline_days) : null;
  const totalCost = feasibility ? completesSlider * feasibility.estimated_cpi : 0;

  return (
    <div className="space-y-6">
      {/* Real-time Quote Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-200">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <ThunderboltOutlined className="text-green-500 text-2xl mr-2" />
            <h3 className="text-xl font-bold text-gray-800">Instant Feasibility Check</h3>
          </div>
          {lastCalculation && (
            <p className="text-sm text-gray-600">
              Last updated: {lastCalculation.toLocaleTimeString()}
            </p>
          )}
        </div>
      </Card>

      {/* Interactive Completes Slider */}
      <Card title="Adjust Target Completes" className="shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Target Completes: <span className="text-xl font-bold text-blue-600">{completesSlider}</span>
          </label>
          <Slider
            min={10}
            max={1000}
            value={completesSlider}
            onChange={setCompletesSlider}
            marks={{
              10: '10',
              50: '50',
              100: '100',
              250: '250',
              500: '500',
              1000: '1000'
            }}
            tooltip={{ formatter: (value) => `${value} completes` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Button 
            size="small" 
            onClick={() => setCompletesSlider(50)}
            type={completesSlider === 50 ? 'primary' : 'default'}
          >
            50 Completes
          </Button>
          <Button 
            size="small" 
            onClick={() => setCompletesSlider(100)}
            type={completesSlider === 100 ? 'primary' : 'default'}
          >
            100 Completes
          </Button>
          <Button 
            size="small" 
            onClick={() => setCompletesSlider(250)}
            type={completesSlider === 250 ? 'primary' : 'default'}
          >
            250 Completes
          </Button>
        </div>
      </Card>

      {/* Main Feasibility Results */}
      {loading ? (
        <Card className="text-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Calculating optimal pricing and timeline...</p>
        </Card>
      ) : feasibility && (
        <Row gutter={[16, 16]}>
          {/* Key Metrics */}
          <Col xs={24} md={12}>
            <Card title="Availability & Pricing" className="h-full">
              <div className="space-y-4">
                <Statistic
                  title="Available Respondents"
                  value={feasibility.available_respondents.toLocaleString()}
                  prefix={<TeamOutlined className="text-green-500" />}
                  suffix={
                    <Tag color="green" className="ml-2">
                      {feasibility.confidence_level}% confidence
                    </Tag>
                  }
                />
                
                <Statistic
                  title="Estimated CPI"
                  value={feasibility.estimated_cpi}
                  prefix={<DollarOutlined className="text-blue-500" />}
                  precision={2}
                />
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Total Project Cost</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {completesSlider} completes × ${feasibility.estimated_cpi} CPI
                  </p>
                </div>
              </div>
            </Card>
          </Col>

          {/* Timeline & Confidence */}
          <Col xs={24} md={12}>
            <Card title="Timeline & Quality" className="h-full">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Estimated Timeline</span>
                    <div className="flex items-center space-x-2">
                      <span>{timelineRec?.icon}</span>
                      <span className="text-lg font-bold">
                        {feasibility.estimated_timeline_days} day{feasibility.estimated_timeline_days !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <Tag color={timelineRec?.color}>{timelineRec?.text}</Tag>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Confidence Level</span>
                    <span className="font-bold">{feasibility.confidence_level}%</span>
                  </div>
                  <Progress 
                    percent={feasibility.confidence_level}
                    strokeColor={getConfidenceColor(feasibility.confidence_level)}
                    showInfo={false}
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <InfoCircleOutlined className="text-blue-500 mr-2" />
                    <span className="text-sm font-medium">Quality Assurance</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    AI-powered fraud detection and quality scoring included
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Supplier Breakdown */}
      {feasibility && feasibility.supplier_breakdown && (
        <Card title="Supplier Availability" className="shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feasibility.supplier_breakdown.map((supplier, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{supplier.supplier_name}</h4>
                  <Tag color="blue">{supplier.quality_rating}% quality</Tag>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span className="font-medium">{supplier.available.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPI:</span>
                    <span className="font-medium">${supplier.cpi.toFixed(2)}</span>
                  </div>
                </div>
                <Progress 
                  percent={Math.min((supplier.available / completesSlider) * 100, 100)}
                  size="small"
                  className="mt-2"
                  strokeColor={supplier.available >= completesSlider ? '#52c41a' : '#faad14'}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {feasibility && feasibility.recommendations && feasibility.recommendations.length > 0 && (
        <Card title="AI Recommendations" className="shadow-md">
          <div className="space-y-2">
            {feasibility.recommendations.map((rec, index) => (
              <Alert
                key={index}
                message={rec}
                type="info"
                showIcon
                icon={<CheckCircleOutlined />}
                className="text-sm"
              />
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button size="large" onClick={() => setCompletesSlider(projectData.completes)}>
          Reset to Original
        </Button>
        <Button 
          type="primary" 
          size="large"
          disabled={!feasibility || loading}
          className="bg-green-500 hover:bg-green-600 border-green-500"
        >
          Looks Good - Continue
        </Button>
      </div>
    </div>
  );
};
