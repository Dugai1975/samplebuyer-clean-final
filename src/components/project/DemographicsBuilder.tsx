"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Form, Select, Row, Col, Tag, Space, Tooltip, Collapse } from 'antd';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;

// Core demographic options (4 basic)
const coreDemographicOptions = {
  gender: {
    name: 'Gender',
    tooltip: 'Target specific genders',
    options: [
      { value: 'male', label: '👨 Male', census: 49.2, multiplier: 1.0 },
      { value: 'female', label: '👩 Female', census: 50.8, multiplier: 1.0 },
      { value: 'non-binary', label: '🏳️‍⚧️ Non-binary', census: 0.6, multiplier: 2.5 }
    ]
  },
  age_ranges: {
    name: 'Age',
    tooltip: 'Target specific age groups',
    options: [
      { value: '18-24', label: '👶 18-24', census: 9.3, multiplier: 1.15 },
      { value: '25-34', label: '🧑 25-34', census: 13.8, multiplier: 1.0 },
      { value: '35-44', label: '👩‍💼 35-44', census: 12.6, multiplier: 1.05 },
      { value: '45-54', label: '👨‍💼 45-54', census: 12.4, multiplier: 1.1 },
      { value: '55-64', label: '👵 55-64', census: 12.8, multiplier: 1.3 },
      { value: '65+', label: '👴 65+', census: 16.5, multiplier: 1.8 }
    ]
  },
  income: {
    name: 'Income',
    tooltip: 'Target by household income levels',
    options: [
      { value: 'under-25k', label: '💵 Under $25K', census: 11.7, multiplier: 0.8 },
      { value: '25k-50k', label: '💰 $25K-$50K', census: 20.2, multiplier: 0.9 },
      { value: '50k-75k', label: '💰 $50K-$75K', census: 16.8, multiplier: 1.0 },
      { value: '75k-100k', label: '💰 $75K-$100K', census: 13.8, multiplier: 1.2 },
      { value: 'over-100k', label: '💰 Over $100K', census: 27.5, multiplier: 1.5 }
    ]
  },
  employment: {
    name: 'Employment',
    tooltip: 'Target by employment status',
    options: [
      { value: 'full-time', label: '💼 Full-time', census: 52.3, multiplier: 1.0 },
      { value: 'part-time', label: '⏰ Part-time', census: 13.2, multiplier: 1.1 },
      { value: 'self-employed', label: '🏢 Self-employed', census: 10.1, multiplier: 1.3 },
      { value: 'unemployed', label: '🔍 Unemployed', census: 6.4, multiplier: 0.7 },
      { value: 'retired', label: '🏖️ Retired', census: 12.8, multiplier: 1.4 },
      { value: 'student', label: '🎓 Student', census: 5.2, multiplier: 0.9 }
    ]
  }
};

// Advanced demographic options (6 additional)
const advancedDemographicOptions = {
  education: {
    name: 'Education',
    tooltip: 'Target by education level',
    options: [
      { value: 'high-school', label: '🎓 High School', census: 28.1, multiplier: 0.9 },
      { value: 'some-college', label: '🎓 Some College', census: 20.4, multiplier: 1.0 },
      { value: 'bachelors', label: '🎓 Bachelor\'s', census: 21.9, multiplier: 1.2 },
      { value: 'masters', label: '🎓 Master\'s', census: 13.1, multiplier: 1.4 },
      { value: 'doctorate', label: '🎓 Doctorate', census: 2.1, multiplier: 2.0 }
    ]
  },
  marital_status: {
    name: 'Marital Status',
    tooltip: 'Target by relationship status',
    options: [
      { value: 'single', label: '💍 Single', census: 35.4, multiplier: 1.0 },
      { value: 'married', label: '💒 Married', census: 48.2, multiplier: 1.1 },
      { value: 'divorced', label: '💔 Divorced', census: 10.9, multiplier: 1.3 },
      { value: 'widowed', label: '🖤 Widowed', census: 5.5, multiplier: 1.5 }
    ]
  },
  children: {
    name: 'Children',
    tooltip: 'Target by household composition',
    options: [
      { value: 'no-children', label: '🚫👶 No Children', census: 56.3, multiplier: 1.0 },
      { value: 'children-under-6', label: '👶 Children Under 6', census: 18.2, multiplier: 1.2 },
      { value: 'children-6-17', label: '🧒 Children 6-17', census: 25.5, multiplier: 1.1 }
    ]
  },
  ethnicity: {
    name: 'Ethnicity',
    tooltip: 'Target by ethnic background',
    options: [
      { value: 'white', label: '🤍 White', census: 60.1, multiplier: 1.0 },
      { value: 'hispanic', label: '🌶️ Hispanic/Latino', census: 18.5, multiplier: 1.2 },
      { value: 'black', label: '🖤 Black/African American', census: 12.2, multiplier: 1.3 },
      { value: 'asian', label: '🥢 Asian', census: 5.9, multiplier: 1.4 },
      { value: 'other', label: '🌈 Other', census: 3.3, multiplier: 1.6 }
    ]
  },
  location_type: {
    name: 'Location',
    tooltip: 'Target by urban/rural setting',
    options: [
      { value: 'urban', label: '🏙️ Urban', census: 82.7, multiplier: 1.0 },
      { value: 'suburban', label: '🏘️ Suburban', census: 14.2, multiplier: 1.1 },
      { value: 'rural', label: '🌾 Rural', census: 3.1, multiplier: 1.5 }
    ]
  },
  device_preference: {
    name: 'Device',
    tooltip: 'Target by preferred device type',
    options: [
      { value: 'mobile', label: '📱 Mobile', census: 58.4, multiplier: 1.0 },
      { value: 'desktop', label: '💻 Desktop', census: 35.7, multiplier: 1.1 },
      { value: 'tablet', label: '📲 Tablet', census: 5.9, multiplier: 1.3 }
    ]
  }
};

interface DemographicsBuilderProps {
  initialDemographics?: Record<string, string[]>;
  onUpdate: (demographics: Record<string, string[]>) => void;
  disabled?: boolean;
}

export const DemographicsBuilder: React.FC<DemographicsBuilderProps> = ({
  initialDemographics = {},
  onUpdate,
  disabled = false
}) => {
  const [demographics, setDemographics] = useState<Record<string, string[]>>(initialDemographics);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Check if mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDemographicChange = useCallback((category: string, values: string[]) => {
    const updatedDemographics = { ...demographics, [category]: values };
    setDemographics(updatedDemographics);
    onUpdate(updatedDemographics);
  }, [demographics, onUpdate]);

  const renderDemographicSelect = (categoryId: string, options: any, isAdvanced: boolean = false) => {
    const category = options[categoryId];
    if (!category) return null;

    const currentValues = demographics[categoryId] || [];
    const colSpan = isMobile ? 24 : 12;

    return (
      <Col xs={24} sm={colSpan} lg={isAdvanced ? 8 : 12} key={categoryId}>
        <Form.Item 
          label={
            <Space>
              {category.name}
              <Tooltip title={category.tooltip}>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            </Space>
          }
          className="mb-4"
        >
          <Select
            mode="multiple"
            placeholder={`Select ${category.name.toLowerCase()} (optional)`}
            value={currentValues}
            onChange={(values) => handleDemographicChange(categoryId, values)}
            style={{ width: '100%' }}
            showSearch={!isMobile}
            optionFilterProp="children"
            allowClear
            size={isMobile ? 'large' : 'middle'}
            disabled={disabled}
          >
            {category.options.map((option: { value: string; label: string; census: number; multiplier: number }) => (
              <Option key={option.value} value={option.value}>
                <div className="flex justify-between items-center">
                  <span>{option.label}</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-500">{option.census}%</span>
                    <span className={
                      option.multiplier > 1.5 ? 'text-red-600 font-bold' :
                      option.multiplier > 1.2 ? 'text-red-600' : 
                      option.multiplier > 1.1 ? 'text-orange-600' : 
                      option.multiplier < 0.9 ? 'text-blue-600' :
                      'text-green-600'
                    }>
                      {option.multiplier}x
                    </span>
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    );
  };

  const hasAnyDemographics = Object.keys(demographics).some(key => demographics[key]?.length > 0);

  return (
    <div className="space-y-6">
      {/* Core Demographics */}
      <Row gutter={[16, 16]}>
        {Object.keys(coreDemographicOptions).map(categoryId => 
          renderDemographicSelect(categoryId, coreDemographicOptions)
        )}
      </Row>

      {/* Advanced Demographics */}
      <Collapse 
        ghost
        onChange={(keys) => setShowAdvanced(Array.isArray(keys) ? keys.length > 0 : keys !== '')}
        items={[{
          key: 'advanced',
          label: (
            <div className="flex items-center space-x-2">
              <span>Advanced Targeting Options</span>
              <Tag color="blue">6 additional filters</Tag>
            </div>
          ),
          children: (
            <Card size="small" className="border-purple-200">
              <Row gutter={[16, 16]}>
                {Object.keys(advancedDemographicOptions).map(categoryId => 
                  renderDemographicSelect(categoryId, advancedDemographicOptions, true)
                )}
              </Row>
            </Card>
          )
        }]}
      />

      {/* Current Targeting Summary */}
      
    </div>
  );
};

export default DemographicsBuilder;