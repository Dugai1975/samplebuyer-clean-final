"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Card, Button, Table, InputNumber, Progress, Alert, Row, Col, Select, Tooltip 
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, CopyOutlined, ThunderboltOutlined 
} from '@ant-design/icons';
import { QuotaProgress } from '@/types';

const { Option } = Select;

interface QuotaBuilderProps {
  demographics?: Record<string, string[]>;
  targetCompletes?: number;
  quotas?: QuotaProgress[];
  onQuotaChange: (quotas: QuotaProgress[]) => void;
}

// Demographic options for quota generation
const demographicOptions = {
  gender: {
    options: [
      { value: 'male', label: '👨 Male', census: 49.2 },
      { value: 'female', label: '👩 Female', census: 50.8 },
      { value: 'non-binary', label: '🏳️‍⚧️ Non-binary', census: 0.6 }
    ]
  },
  age_ranges: {
    options: [
      { value: '18-24', label: '👶 18-24', census: 9.3 },
      { value: '25-34', label: '🧑 25-34', census: 13.8 },
      { value: '35-44', label: '👩‍💼 35-44', census: 12.6 },
      { value: '45-54', label: '👨‍💼 45-54', census: 12.4 },
      { value: '55-64', label: '👵 55-64', census: 12.8 },
      { value: '65+', label: '👴 65+', census: 16.5 }
    ]
  }
};

export const QuotaBuilder: React.FC<QuotaBuilderProps> = ({
  demographics = {},
  targetCompletes = 100,
  quotas = [],
  onQuotaChange
}) => {
  const [quotaMode, setQuotaMode] = useState<'none' | 'simple' | 'census'>('none');
  const [isGeneratingQuotas, setIsGeneratingQuotas] = useState(false);
  const lastGeneratedQuotas = useRef<QuotaProgress[]>([]);
  
  // Set default mode to 'none' on first render if no quotas exist
  // Also reset to 'none' when demographics change and no quotas exist
  useEffect(() => {
    if (quotas.length === 0 && quotaMode !== 'none') {
      setQuotaMode('none');
    } else if (quotas.length > 0 && quotaMode === 'none') {
      setQuotaMode('simple');
    }
  }, [quotas.length, quotaMode]);
  
  // When demographics change, default to 'none' if no quotas exist
  // This helps streamline the launch process
  useEffect(() => {
    const hasChangedDemographics = Object.keys(demographics || {}).some(key => 
      Array.isArray(demographics?.[key as keyof typeof demographics]) && 
      (demographics?.[key as keyof typeof demographics] as any[])?.length > 0
    );
    
    if (hasChangedDemographics && quotas.length === 0) {
      setQuotaMode('none');
    }
  }, [demographics, quotas.length]);

  // Generate quotas based on demographics
  const generateQuotas = useCallback(async () => {
    setIsGeneratingQuotas(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const genders = demographics?.gender || ['male', 'female'];
    const ageRanges = demographics?.age_ranges || ['25-34', '35-44', '45-54'];
    const newQuotas: QuotaProgress[] = [];
    let id = 1;

    if (quotaMode === 'census') {
      // Census-weighted quotas
      genders.forEach((gender: string) => {
        ageRanges.forEach((age: string) => {
          const genderOption = demographicOptions.gender.options.find(opt => opt.value === gender);
          const ageOption = demographicOptions.age_ranges.options.find(opt => opt.value === age);
          const genderPct = (genderOption?.census || 50) / 100;
          const agePct = (ageOption?.census || 16.7) / 100;
          const target = Math.round(targetCompletes * genderPct * agePct);
          
          if (target > 0) {
            newQuotas.push({
              id: id.toString(),
              name: `${genderOption?.label || gender} ${age}`,
              target,
              current: 0,
              percentage: 0,
              status: 'pending',
              demographic_filter: { gender, age_range: age }
            });
            id++;
          }
        });
      });
    } else {
      // Simple even split
      const completesPerCell = Math.floor(targetCompletes / (genders.length * ageRanges.length));
      genders.forEach((gender: string) => {
        ageRanges.forEach((age: string) => {
          const genderOption = demographicOptions.gender.options.find(opt => opt.value === gender);
          newQuotas.push({
            id: id.toString(),
            name: `${genderOption?.label || gender} ${age}`,
            target: completesPerCell,
            current: 0,
            percentage: 0,
            status: 'pending',
            demographic_filter: { gender, age_range: age }
          });
          id++;
        });
      });
      
      // Distribute remaining completes
      const remaining = targetCompletes - (completesPerCell * newQuotas.length);
      for (let i = 0; i < remaining; i++) {
        newQuotas[i % newQuotas.length].target += 1;
      }
    }

    // Deep compare to prevent unnecessary updates
    const quotasChanged = newQuotas.length !== lastGeneratedQuotas.current.length || 
      newQuotas.some((q, i) => {
        const old = lastGeneratedQuotas.current[i];
        if (!old) return true;
        return q.id !== old.id || q.name !== old.name || q.target !== old.target;
      });

    if (quotasChanged) {
      onQuotaChange(newQuotas);
      lastGeneratedQuotas.current = newQuotas;
    }
    setIsGeneratingQuotas(false);
  }, [demographics, targetCompletes, quotaMode, onQuotaChange]);

  // Auto-generate quotas when demographics change
  useEffect(() => {
    if (Object.keys(demographics).length > 0 && quotaMode !== 'none') {
      generateQuotas();
    }
  }, [JSON.stringify(demographics.gender), JSON.stringify(demographics.age_ranges), quotaMode, targetCompletes, generateQuotas]);

  // Quota management functions
  const updateQuota = (id: string, field: keyof QuotaProgress, value: any) => {
    const updatedQuotas = quotas.map(quota => 
      quota.id === id ? { ...quota, [field]: value } : quota
    );
    onQuotaChange(updatedQuotas);
  };

  const deleteQuota = (id: string) => {
    const updatedQuotas = quotas.filter(quota => quota.id !== id);
    onQuotaChange(updatedQuotas);
  };

  const duplicateQuota = (id: string) => {
    const quota = quotas.find(q => q.id === id);
    if (quota) {
      const newQuota = {
        ...quota,
        id: Date.now().toString(),
        name: `${quota.name} (Copy)`,
        current: 0,
        percentage: 0
      };
      onQuotaChange([...quotas, newQuota]);
    }
  };

  const addCustomQuota = () => {
    const newQuota: QuotaProgress = {
      id: Date.now().toString(),
      name: 'Custom Quota',
      target: 10,
      current: 0,
      percentage: 0,
      status: 'pending',
      demographic_filter: {}
    };
    onQuotaChange([...quotas, newQuota]);
  };

  // Utility functions
  const getTotalTargets = () => quotas.reduce((sum, quota) => sum + quota.target, 0);
  const getQuotaPercentage = (target: number) => targetCompletes > 0 ? (target / targetCompletes) * 100 : 0;

  // Table columns
  const quotaColumns = [
    {
      title: 'Quota Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: QuotaProgress) => (
        <div>
          <input
            type="text"
            value={text}
            onChange={(e) => updateQuota(record.id, 'name', e.target.value)}
            className="w-full border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
          />
          {record.demographic_filter && Object.keys(record.demographic_filter).length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {Object.entries(record.demographic_filter).map(([key, value]) => (
                <span key={key} className="mr-2">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      width: 120,
      render: (target: number, record: QuotaProgress) => (
        <InputNumber
          min={1}
          max={targetCompletes}
          value={target}
          onChange={(value) => updateQuota(record.id, 'target', value || 1)}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Percentage',
      key: 'percentage',
      width: 120,
      render: (_: any, record: QuotaProgress) => (
        <div className="text-center">
          <div className="text-sm font-medium">
            {getQuotaPercentage(record.target).toFixed(1)}%
          </div>
          <Progress 
            percent={getQuotaPercentage(record.target)} 
            size="small" 
            showInfo={false}
            strokeColor="#1890ff"
          />
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: QuotaProgress) => (
        <div className="flex space-x-1">
          <Tooltip title="Duplicate">
            <Button
              type="text"
              icon={<CopyOutlined />}
              size="small"
              onClick={() => duplicateQuota(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => deleteQuota(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Card 
      title="📊 Quota Strategy" 
      className="border-green-200"
      extra={
        <div className="flex space-x-2">
          <Select
            value={quotaMode}
            onChange={(value) => {
              setQuotaMode(value);
              if (value === 'none') {
                // Clear all quotas when switching to 'No Quotas' mode
                onQuotaChange([]);
              }
            }}
            size="small"
            style={{ width: 180 }}
          >
            <Option value="none">✓ No Quotas (Recommended)</Option>
            <Option value="simple">Simple Split</Option>
            <Option value="census">Census Weighted</Option>
          </Select>
          {quotaMode !== 'none' && (
            <Button
              icon={<PlusOutlined />}
              onClick={addCustomQuota}
              size="small"
            >
              Add Custom
            </Button>
          )}
        </div>
      }
    >
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-3">
          {quotaMode === 'none' && 'All qualified respondents will be accepted without quota restrictions'}
          {quotaMode === 'simple' && 'Even distribution across all demographic combinations'}
          {quotaMode === 'census' && 'Quotas weighted by actual population distribution'}
        </div>
        
        {quotaMode === 'none' ? (
          <Alert
            message="Open Sampling (Recommended for Quick Launch)"
            description="Your survey will accept all qualified respondents without quota restrictions. This is the fastest way to collect data and allows you to launch immediately after selecting demographics. You can always add quotas later if needed."
            type="success"
            showIcon
          />
        ) : Object.keys(demographics).length > 0 ? (
          <Button
            type="dashed"
            icon={<ThunderboltOutlined />}
            onClick={generateQuotas}
            loading={isGeneratingQuotas}
            block
          >
            {isGeneratingQuotas ? 'Generating Quotas...' : 'Regenerate Quotas'}
          </Button>
        ) : (
          <Alert
            message="Demographics Required"
            description="Please select demographic criteria in the Target Demographics section before generating quotas."
            type="warning"
            showIcon
          />
        )}
      </div>

      {quotas.length > 0 && (
        <>
          {/* Quota Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getTotalTargets()}</div>
                  <div className="text-sm text-gray-600">Total Quotas</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{targetCompletes}</div>
                  <div className="text-sm text-gray-600">Target Completes</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.abs(getTotalTargets() - targetCompletes)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getTotalTargets() > targetCompletes ? 'Over' : 'Under'} Target
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Quota Validation Alert */}
          {getTotalTargets() !== targetCompletes && (
            <Alert
              message={
                getTotalTargets() > targetCompletes 
                  ? 'Quotas exceed target completes'
                  : 'Quotas are under target completes'
              }
              description={
                getTotalTargets() > targetCompletes
                  ? 'Your quotas total more than your target. This may increase costs.'
                  : 'Your quotas total less than your target. Consider adding more quotas.'
              }
              type={getTotalTargets() > targetCompletes ? 'warning' : 'info'}
              showIcon
              className="mb-4"
            />
          )}

          {/* Quotas Table */}
          <Table
            columns={quotaColumns}
            dataSource={quotas}
            rowKey="id"
            pagination={false}
            size="small"
          />

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {quotas.length} quota{quotas.length !== 1 ? 's' : ''} defined
            </div>
            <div className="space-x-2">
              <Button 
                size="small" 
                onClick={() => {
                  const evenSplit = Math.floor(targetCompletes / quotas.length);
                  const remainder = targetCompletes % quotas.length;
                  const updatedQuotas = quotas.map((quota, index) => ({
                    ...quota,
                    target: evenSplit + (index < remainder ? 1 : 0)
                  }));
                  onQuotaChange(updatedQuotas);
                }}
              >
                Even Split
              </Button>
              <Button size="small" onClick={() => onQuotaChange([])} danger>
                Clear All
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default QuotaBuilder;
