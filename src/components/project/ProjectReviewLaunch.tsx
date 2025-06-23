"use client";

import React, { useState, useMemo } from 'react';
import { 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Progress, 
  Space, 
  Input, 
  Divider, 
  Statistic, 
  Form, 
  Radio, 
  Collapse, 
  Alert, 
  Steps, 
  Tabs, 
  Tag, 
  Descriptions, 
  Timeline, 
  Select, 
  Checkbox, 
  Modal,
  Switch
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  InfoCircleOutlined, 
  RocketOutlined,
  EditOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ArrowLeftOutlined, 
  LinkOutlined, 
  CheckOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import type { FeasibilityData, Quota } from '@project-types';
import type { ProjectCreationData } from '@/types/enhanced';
import { RedirectLinksConfig } from './RedirectLinksConfig';
import { SmartLinkConfig } from './SmartLinkConfig';

const { Title, Text } = Typography;
const { Option } = Select;

interface ProjectReviewLaunchProps {
  projectData: ProjectCreationData;
  feasibilityData: FeasibilityData | null;
  quotaData: QuotaProgress[];
  onEdit: (step: number) => void;
  onLaunch: (launchType: 'soft' | 'full', config?: any) => Promise<void>;
  onSaveDraft: () => void;
  redirectLinks: Record<string, string>;
  setRedirectLinks: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  redirectLinksValid: boolean;
}

/**
 * Clean, structured launch interface with clear steps and actions
 */
export const CleanProjectLaunch: React.FC<ProjectReviewLaunchProps> = ({
  projectData,
  feasibilityData,
  quotaData,
  onLaunch,
  onEdit,
  redirectLinks,
  setRedirectLinks,
  redirectLinksValid
}) => {
  const [launchType, setLaunchType] = useState<'soft' | 'full'>('soft');
  const [surveyValid, setSurveyValid] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('1'); // For tab navigation
  const [localRedirectLinksValid, setLocalRedirectLinksValid] = useState(redirectLinksValid || false);
  
  // Launch modal state
  const [launchModalVisible, setLaunchModalVisible] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  
  // Soft launch configuration
  const [softLaunchConfig, setSoftLaunchConfig] = useState({
    testLimit: 10,
    testLimitType: 'percent',
    autoPause: true
  });
  
  // Calculate readiness score and essential requirements
  const { readinessScore, canLaunch } = useMemo(() => {
    let score = 0;
    // Track individual components for score
    if (projectData.name) score += 25;
    if (feasibilityData) score += 25;
    if (surveyValid) score += 25;
    if (redirectLinksValid) score += 25;
    
    // Essential requirements: only need demographics and feasibility to proceed
    // This makes the process smoother while still showing overall completion
    const canLaunch = !!feasibilityData;
    
    return { readinessScore: score, canLaunch };
  }, [projectData.name, feasibilityData, surveyValid, redirectLinksValid]);

  const totalCost = (projectData.completes || 0) * (feasibilityData?.estimated_cpi || 0);
  const testCost = launchType === 'soft' ? totalCost * 0.1 : totalCost;

  // Handle tab changes
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  
  // Navigation between steps with proper event type
  const handleStepNavigation = (e: React.MouseEvent<HTMLElement>, step: string) => {
    setActiveTab(step);
  };
  
  // Launch with confirmation modal
  const handleLaunchModal = (type: 'soft' | 'full') => {
    if (!canLaunch) return;
    setLaunchType(type);
    setLaunchModalVisible(true);
    setAgreementChecked(false);
    setLaunchError(null);
  };

  // Helper function for toggling switch
  const toggleSwitch = (checked: boolean) => {
    setShowAdvancedSettings(checked);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
        <div>
          <Title level={3} style={{ margin: 0 }}>{projectData.name || 'Launch Your Project'}</Title>
          <Text type="secondary">Complete these steps to launch your project</Text>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            type="default" 
            icon={<EditOutlined />} 
            onClick={() => onEdit && onEdit(0)}
          >
            Edit Project
          </Button>
          <Button 
            type="primary" 
            icon={<RocketOutlined />} 
            onClick={() => setActiveTab('4')} 
            disabled={!canLaunch}
            className={canLaunch ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {launchType === 'soft' ? 'Soft Launch' : 'Full Launch'}
          </Button>
        </div>
      </div>

      {/* Launch Readiness Indicator */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-blue-100 shadow-sm mb-6">
        <div className="flex items-center space-x-4">
          <Progress 
            type="circle" 
            percent={readinessScore} 
            size={60}
            strokeColor={readinessScore === 100 ? '#52c41a' : readinessScore > 75 ? '#1890ff' : '#faad14'}
          />
          <div>
            <div className="font-medium text-lg">{readinessScore === 100 ? 'Ready to Launch!' : `${readinessScore}% Complete`}</div>
            <div className="text-sm text-gray-500">
              {canLaunch ? 
                'You can launch now! Optional items can be completed later.' : 
                'Complete required items to enable launch'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <ChecklistItem 
            checked={!!projectData.name} 
            label="Project Name"
            required={true}
          />
          <ChecklistItem 
            checked={!!feasibilityData} 
            label="Feasibility Data"
            required={true}
          />
          <ChecklistItem 
            checked={surveyValid} 
            label="Survey URL"
            required={false}
          />
          <ChecklistItem 
            checked={redirectLinksValid} 
            label="Redirect Links"
            required={false}
          />
        </div>
      </div>

      {/* Tabbed Interface for Launch Process */}
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        type="card"
        className="launch-tabs"
        items={[
          {
            key: '1',
            label: (
              <span>
                <CheckOutlined /> Project Summary
              </span>
            ),
            children: (
              <Card className="tab-content-card">
                <Row gutter={24}>
                  <Col span={12}>
                    <Statistic 
                      title="Project Name" 
                      value={projectData.name || 'Unnamed Project'} 
                      valueStyle={{ fontSize: 18, fontWeight: 'bold' }} 
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Country" 
                      value={projectData.country || 'Not set'} 
                      valueStyle={{ fontSize: 18 }} 
                    />
                  </Col>
                </Row>
                
                <Divider style={{ margin: '16px 0' }} />
                
                <Row gutter={24}>
                  <Col span={8}>
                    <Statistic 
                      title="Completes" 
                      value={projectData.completes || 0} 
                      valueStyle={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }} 
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="Est. CPI" 
                      value={feasibilityData?.estimated_cpi || 0}
                      prefix="$"
                      precision={2}
                      valueStyle={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }} 
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="Total Cost" 
                      value={totalCost}
                      prefix="$"
                      precision={0}
                      valueStyle={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }} 
                    />
                  </Col>
                </Row>
                
                <div className="mt-6 text-right">
                  <Button 
                    type="primary" 
                    onClick={() => handleTabChange('2')}
                  >
                    Next: Configure Survey Links
                  </Button>
                </div>
              </Card>
            ),
          },
          {
            key: '2',
            label: (
              <span>
                <LinkOutlined /> Survey Links
              </span>
            ),
            children: (
              <Card className="tab-content-card">
                <Alert
                  message="Survey Link Required"
                  description="Please add your survey link to continue. This is where respondents will be directed to take your survey."
                  type="info"
                  showIcon
                  className="mb-4"
                />
                
                <Form layout="vertical">
                  <Form.Item label="Survey URL" required>
                    <Input 
                      placeholder="https://your-survey-platform.com/your-survey-id" 
                      addonBefore={<LinkOutlined />}
                      onChange={(e) => {
                        // Validate URL and update surveyValid state
                        const url = e.target.value;
                        const isValid = url.startsWith('http') && url.length > 10;
                        setSurveyValid(isValid);
                      }}
                    />
                  </Form.Item>
                  <div className="flex justify-between">
                    <Button onClick={(e) => handleStepNavigation(e, '1')}>
                      Back to Summary
                    </Button>
                    <Button 
                      type="primary" 
                      onClick={(e) => {
                        setSurveyValid(true);
                        handleStepNavigation(e, '3');
                      }}
                    >
                      Next: Configure Redirects
                    </Button>
                  </div>
                </Form>
              </Card>
            ),
          },
          {
            key: '3',
            label: (
              <span>
                <ArrowLeftOutlined /> Redirect Links
              </span>
            ),
            children: (
              <Card className="tab-content-card">
                <RedirectLinksConfig
                  projectData={projectData}
                  onChange={(links) => setRedirectLinks(links)}
                  onValidationChange={(isValid: boolean) => {
                    // Update the redirect links validity state
                    setLocalRedirectLinksValid(isValid);
                  }}
                />
                
                <div className="mt-6 flex justify-between">
                  <Button onClick={() => handleTabChange('2')}>
                    Back to Survey Links
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={() => handleTabChange('4')}
                  >
                    Next: Launch Options
                  </Button>
                </div>
              </Card>
            ),
          },
          {
            key: '4',
            label: (
              <span>
                <RocketOutlined /> Launch Options
              </span>
            ),
            children: (
              <Card className="tab-content-card">
                <Radio.Group 
                  value={launchType} 
                  onChange={(e) => setLaunchType(e.target.value as 'soft' | 'full')}
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    <Card className={`w-full ${launchType === 'soft' ? 'border-blue-500' : ''}`}>
                      <Radio value="soft">Soft Launch (10% of completes)</Radio>
                      <div className="ml-6 mt-2 text-gray-500">
                        Test your survey with a small batch of respondents before full launch.
                        <div className="mt-2">
                          <Tag color="blue">Estimated Cost: ${testCost.toFixed(2)}</Tag>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className={`w-full ${launchType === 'full' ? 'border-green-500' : ''}`}>
                      <Radio value="full">Full Launch (100% of completes)</Radio>
                      <div className="ml-6 mt-2 text-gray-500">
                        Launch your full project immediately.
                        <div className="mt-2">
                          <Tag color="green">Estimated Cost: ${totalCost.toFixed(2)}</Tag>
                        </div>
                      </div>
                    </Card>
                  </Space>
                </Radio.Group>
                
                <div className="mt-6 flex justify-between">
                  <Button onClick={() => handleTabChange('3')}>
                    Back to Redirect Links
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<RocketOutlined />} 
                    onClick={() => {
                      // Direct launch without modal
                      if (!canLaunch) return;
                      const launchConfig = {
                        testLimit: softLaunchConfig.testLimit,
                        testLimitType: softLaunchConfig.testLimitType,
                        autoPause: softLaunchConfig.autoPause
                      };
                      onLaunch(launchType, launchConfig);
                    }} 
                    disabled={!canLaunch}
                    size="large"
                    className={canLaunch ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {launchType === 'soft' ? 'Start Soft Launch' : 'Launch Project'}
                  </Button>
                </div>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

// Helper component for checklist items
const ChecklistItem: React.FC<{ checked: boolean; label: string; required?: boolean }> = ({ checked, label, required }) => (
  <div className="flex items-center space-x-2">
    {checked ? (
      <CheckCircleOutlined className="text-green-500" />
    ) : (
      <ExclamationCircleOutlined className={required ? "text-orange-500" : "text-gray-400"} />
    )}
    <span className={checked ? 'text-green-700' : (required ? 'text-orange-700' : 'text-gray-500')}>
      {label} {required && !checked && <span className="text-xs text-orange-600">(Required)</span>}
    </span>
  </div>
);

export const ProjectReviewLaunch: React.FC<ProjectReviewLaunchProps> = (props) => {
  const { projectData, feasibilityData, quotaData, onEdit, onLaunch, onSaveDraft, redirectLinks, setRedirectLinks, redirectLinksValid } = props;

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [launchModalVisible, setLaunchModalVisible] = useState(false);
  const [launchType, setLaunchType] = useState<'soft' | 'full'>('soft');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  
  // Local validation state for redirect links
  const [localRedirectLinksValid, setLocalRedirectLinksValid] = useState(redirectLinksValid);

  // Soft launch configuration
  const [softLaunchConfig, setSoftLaunchConfig] = useState({
    testLimit: Math.max(10, Math.ceil((projectData.completes || 100) * 0.1)),
    testLimitType: 'fixed' as 'fixed' | 'percentage',
    autoPause: true
  });

  // Calculations
  const safeCompletes = Math.max(1, projectData.completes || 0);
  const testLimit = Math.max(1, softLaunchConfig.testLimit || 1);
  const estimatedCPI = feasibilityData?.estimated_cpi || 0;
  const totalCost = safeCompletes * estimatedCPI;
  const testCost = testLimit * estimatedCPI;
  const remainingCost = (safeCompletes - testLimit) * estimatedCPI;

  const totalQuotas = quotaData.reduce((sum, quota) => sum + quota.target, 0);
  const quotaMatch = totalQuotas === projectData.completes;

  // Validation logic
  const canLaunch = feasibilityData !== null && 
                   projectData.name && 
                   projectData.country && 
                   localRedirectLinksValid;
  
  const hasQuotaMismatch = totalQuotas !== projectData.completes;
  const hasWarnings = hasQuotaMismatch;

  // Step configuration
  const setupSteps = [
    { 
      title: 'Review Configuration', 
      description: 'Project settings and targeting',
      icon: <CheckCircleOutlined />
    },
    { 
      title: 'Redirect URLs', 
      description: 'Configure respondent redirects',
      icon: <LinkOutlined />
    },
    { 
      title: 'Launch Options', 
      description: 'Choose launch strategy',
      icon: <RocketOutlined />
    }
  ];

  // Event handlers
  const handleNextStep = () => {
    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunchModal = (type: 'soft' | 'full') => {
    setLaunchType(type);
    setLaunchModalVisible(true);
    setAgreementChecked(false);
    setLaunchError(null);
  };

  const handleLaunchConfirm = async () => {
    setLaunching(true);
    setLaunchError(null);
    
    try {
      const launchPayload = {
        launch_type: launchType,
        project_config: {
          test_limit: softLaunchConfig.testLimit,
          test_limit_type: softLaunchConfig.testLimitType,
          auto_pause: softLaunchConfig.autoPause,
          buyer_links: redirectLinks
        }
      };
      
      await onLaunch(launchType, launchPayload);
      setLaunchModalVisible(false);
    } catch (error) {
      setLaunchError('Launch failed. Please try again or contact support.');
    } finally {
      setLaunching(false);
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 0) return true; // Review step
    if (currentStep === 1) return localRedirectLinksValid; // Redirect links step
    return true; // Launch step
  };

  // This function is handled by handleLaunchModal and handleLaunchConfirm

  const getTimelineSteps = () => [
    {
      title: 'Project Setup',
      description: 'Complete',
      status: 'completed',
      icon: <CheckCircleOutlined className="text-green-500" />
    },
    {
      title: 'Feasibility Check',
      description: feasibilityData ? 'Complete' : 'Pending',
      status: feasibilityData ? 'completed' : 'pending',
      icon: feasibilityData 
        ? <CheckCircleOutlined className="text-green-500" />
        : <ClockCircleOutlined className="text-orange-500" />
    },
    {
      title: 'Demographics Setup',
      description: quotaData.length > 0 ? 'Complete' : 'Pending',
      status: quotaData.length > 0 ? 'completed' : 'pending',
      icon: quotaData.length > 0
        ? <CheckCircleOutlined className="text-green-500" />
        : <ClockCircleOutlined className="text-orange-500" />
    },
    {
      title: 'Ready to Launch',
      description: 'Final review',
      status: 'current',
      icon: <RocketOutlined className="text-blue-500" />
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Project Review & Launch</h2>
        <p className="text-gray-600">Review your project details and launch your sample collection</p>
      </div>

      {/* Launch Timeline */}
      <Card title="Setup Progress" className="shadow-md">
        <Timeline
          items={getTimelineSteps().map(step => ({
            dot: step.icon,
            children: (
              <div>
                <div className="font-medium">{step.title}</div>
                <div className="text-sm text-gray-600">{step.description}</div>
              </div>
            )
          }))}
        />
      </Card>

      {/* Step 2: Redirect Links Config (only show on step 1) */}
      {currentStep === 1 && (
        <div className="mb-6">
          <SmartLinkConfig
            projectData={projectData}
            onLinksValidated={(links, isValid) => {
              setRedirectLinks(links);
              setLocalRedirectLinksValid(isValid);
            }}
            onContinue={() => setCurrentStep(2)}
          />
        </div>
      )}

      {/* Quota Warnings/Errors */}
      {hasQuotaMismatch && (
        <Alert
          message="Quota Mismatch"
          description={<div>Your quotas total {totalQuotas} but your target is {projectData.completes} completes. Please fix this before launching.</div>}
          type="error"
          showIcon
          className="mb-6"
          action={
            <Button size="small" onClick={() => onEdit(2)}>
              Fix Quotas
            </Button>
          }
        />
      )}
      {hasWarnings && !hasQuotaMismatch && (
        <Alert
          message="No Quotas Configured"
          description={<div>No quotas are set. Launching without quotas may affect targeting and delivery. Quotas are optional but recommended for precise sampling.</div>}
          type="warning"
          showIcon
          className="mb-6"
          action={
            <Button size="small" onClick={() => onEdit(2)}>
              Add Quotas
            </Button>
          }
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Project Summary */}
        <Col xs={24} lg={14}>
          <Card 
            title="Project Summary" 
            className="shadow-md"
            extra={
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => onEdit(0)}
              >
                Edit
              </Button>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Project Name">
                <span className="font-medium">{projectData.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Target Market">
                {projectData.country} • {projectData.language}
              </Descriptions.Item>
              <Descriptions.Item label="Sample Size">
                {projectData.completes} completes
              </Descriptions.Item>
              <Descriptions.Item label="Survey Length">
                {projectData.loi_minutes} minutes
              </Descriptions.Item>
              <Descriptions.Item label="Expected Incidence">
                {projectData.incidence_rate}%
              </Descriptions.Item>
              <Descriptions.Item label="Priority Level">
                <Tag color={
                  projectData.priority_level === 'rush' ? 'red' :
                  projectData.priority_level === 'standard' ? 'blue' : 'green'
                }>
                  {projectData.priority_level?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              {projectData.survey_url && (
                <Descriptions.Item label="Survey URL">
                  <a href={projectData.survey_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    {projectData.survey_url.length > 50 
                      ? projectData.survey_url.substring(0, 50) + '...'
                      : projectData.survey_url
                    }
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Demographics Summary */}
          <Card 
            title="Target Demographics" 
            className="shadow-md mt-6"
            extra={
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => onEdit(2)}
              >
                Edit
              </Button>
            }
          >
            <div className="space-y-3">
              {Object.entries(projectData.demographics || {}).map(([key, values]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                  <div className="inline-flex flex-wrap gap-1 mt-1">
                    {(values as string[]).map(value => (
                      <Tag key={value} color="blue">{value}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {quotaData.length > 0 && (
              <>
                <Divider />
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Quota Distribution</span>
                    <span className="text-sm text-gray-600">
                      {quotaData.length} quotas • {totalQuotas} total targets
                    </span>
                  </div>
                  <div className="space-y-2">
                    {quotaData.slice(0, 5).map(quota => (
                      <div key={quota.id} className="flex justify-between items-center text-sm">
                        <span>{quota.name}</span>
                        <span className="font-medium">{quota.target}</span>
                      </div>
                    ))}
                    {quotaData.length > 5 && (
                      <div className="text-sm text-gray-500">
                        ... and {quotaData.length - 5} more quotas
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Cost & Timeline */}
        <Col xs={24} lg={10}>
          <Card 
            title="Project Estimate" 
            className="shadow-md"
            extra={
              feasibilityData && (
                <Button 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => onEdit(1)}
                >
                  Recalculate
                </Button>
              )
            }
          >
            {feasibilityData ? (
              <div className="space-y-4">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Total Cost"
                      value={totalCost}
                      prefix={<DollarOutlined className="text-green-500" />}
                      precision={2}
                      valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Timeline"
                      value={feasibilityData.estimated_timeline_days}
                      suffix="days"
                      prefix={<ClockCircleOutlined className="text-blue-500" />}
                      valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                    />
                  </Col>
                </Row>

                <Divider />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cost per Interview (CPI)</span>
                    <span className="font-medium">${feasibilityData.estimated_cpi.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Completes</span>
                    <span className="font-medium">{projectData.completes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Respondents</span>
                    <span className="font-medium">{feasibilityData.available_respondents.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence Level</span>
                    <span className="font-medium">{feasibilityData.confidence_level}%</span>
                  </div>
                </div>

                <Divider />

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckOutlined className="text-blue-500 mr-2" />
                    <span className="font-medium text-blue-800">Quality Assurance</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    AI-powered fraud detection and quality scoring included at no extra cost.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <WarningOutlined className="text-4xl text-orange-500 mb-2" />
                <p className="text-gray-600">Feasibility data not available</p>
                <Button type="link" onClick={() => onEdit(1)}>
                  Calculate Feasibility
                </Button>
              </div>
            )}
          </Card>

          {/* Pre-launch Checklist */}
          <Card title="Pre-Launch Checklist" className="shadow-md mt-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircleOutlined className="text-green-500" />
                <span className="text-sm">Project details completed</span>
              </div>
              <div className="flex items-center space-x-2">
                {feasibilityData ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : (
                  <ClockCircleOutlined className="text-orange-500" />
                )}
                <span className="text-sm">Feasibility calculated</span>
              </div>
              <div className="flex items-center space-x-2">
                {quotaData.length > 0 ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : (
                  <ClockCircleOutlined className="text-orange-500" />
                )}
                <span className="text-sm">Demographics configured</span>
              </div>
              <div className="flex items-center space-x-2">
                {quotaMatch ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : (
                  <WarningOutlined className="text-orange-500" />
                )}
                <span className="text-sm">Quota targets match sample size</span>
              </div>
              <div className="flex items-center space-x-2">
                {projectData.survey_url ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : (
                  <InfoCircleOutlined className="text-gray-400" />
                )}
                <span className="text-sm">Survey URL provided (optional)</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Validation Alerts */}
      {!quotaMatch && (
        <Alert
          message="Quota Mismatch"
          description={`Your quotas total ${totalQuotas} but your target is ${projectData.completes} completes. Please adjust your quotas or sample size.`}
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => onEdit(2)}>
              Fix Quotas
            </Button>
          }
        />
      )}

      {!feasibilityData && (
        <Alert
          message="Missing Feasibility Data"
          description="Please calculate feasibility to get accurate pricing and timeline estimates."
          type="info"
          showIcon
          action={
            <Button size="small" onClick={() => onEdit(1)}>
              Calculate
            </Button>
          }
        />
      )}

      {/* Soft Launch Recommendation Preview */}
      <Card className="mb-4 border-blue-400 ring-2 ring-blue-200 bg-blue-50 shadow-sm">
        <div className="flex items-center mb-2">
          <ExperimentOutlined className="text-blue-500 text-xl mr-2" />
          <span className="font-semibold text-blue-700 text-lg">Soft Launch Recommended</span>
          <Tag color="blue" className="ml-3">Default</Tag>
        </div>
        <div className="text-gray-700 mb-2">
          <b>Why?</b> Soft launch reduces risk, validates targeting, and protects your budget by testing with a small sample before full spend.
        </div>
        <div className="flex flex-wrap gap-4 mb-2">
          <Statistic title="Test Sample" value={Math.max(10, Math.ceil((projectData.completes || 100) * 0.1))} suffix="respondents" className="mr-8" />
          <Statistic title="Test Cost" value={feasibilityData ? (Math.max(10, Math.ceil((projectData.completes || 100) * 0.1)) * feasibilityData.estimated_cpi).toFixed(2) : '--'} prefix="$" className="mr-8" />
          <Statistic title="Full Cost" value={feasibilityData ? (projectData.completes * feasibilityData.estimated_cpi).toFixed(2) : '--'} prefix="$" />
        </div>
        <div className="text-xs text-gray-600 mb-2">
          <InfoCircleOutlined className="mr-1" /> During soft launch, you'll collect a test sample (typically 10%) and review results before spending the full budget.
        </div>
        <div className="flex flex-wrap gap-2">
          <Tag color="geekblue">Auto-pause enabled</Tag>
          <Tag color="green">Quality monitored</Tag>
          <Tag color="purple">Review before launch</Tag>
        </div>
      </Card>

      {/* Stepper UI */}
      <Card className="mb-6">
        <div className="flex items-center mb-4">
          {setupSteps.map((step, idx) => (
            <React.Fragment key={step.title}>
              <div className={`flex flex-col items-center ${currentStep === idx ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${currentStep === idx ? 'border-blue-600' : 'border-gray-300'}`}>{idx + 1}</div>
                <span className="text-xs mt-1">{step.title}</span>
              </div>
              {idx < setupSteps.length - 1 && <div className="flex-1 border-t-2 mx-2" style={{ borderColor: currentStep > idx ? '#2563eb' : '#d1d5db' }} />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-4">
          {currentStep === 0 && (
            <div>
              <Descriptions title="Project Overview" bordered column={1} size="small">
                <Descriptions.Item label="Name">{projectData.name}</Descriptions.Item>
                <Descriptions.Item label="Country">{projectData.country}</Descriptions.Item>
                <Descriptions.Item label="Completes">{projectData.completes}</Descriptions.Item>
                <Descriptions.Item label="LOI (min)">{projectData.loi_minutes}</Descriptions.Item>
                <Descriptions.Item label="Incidence Rate">{projectData.incidence_rate}%</Descriptions.Item>
              </Descriptions>
              <Divider />
              <Button icon={<EditOutlined />} onClick={() => onEdit(0)} className="mr-2">Edit Project</Button>
              <Button type="primary" onClick={() => setCurrentStep(1)} disabled={!canLaunch}>
                Next: Redirect URLs
              </Button>
              {!canLaunch && (
                <Alert message="Complete all required fields and valid redirect URLs to proceed." type="warning" showIcon className="mt-2" />
              )}
            </div>
          )}
          {currentStep === 1 && (
            <div>
              <RedirectLinksConfig
                projectData={projectData}
                onChange={setRedirectLinks}
                onValidationChange={setLocalRedirectLinksValid}
              />
              <div className="flex justify-between mt-4">
                <Button onClick={() => setCurrentStep(0)}>Back</Button>
                <Button type="primary" onClick={() => setCurrentStep(2)} disabled={!redirectLinksValid}>
                  Next: Launch Options
                </Button>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <Card className="mb-4">
                <h4 className="font-medium mb-2">Soft Launch Configuration</h4>
                <Row gutter={16} align="middle">
                  <Col span={8}>
                    <label>Test Sample Size</label>
                    <Input
                      type="number"
                      min={1}
                      max={projectData.completes}
                      value={softLaunchConfig.testLimit}
                      onChange={e => setSoftLaunchConfig({ ...softLaunchConfig, testLimit: Number(e.target.value) })}
                    />
                  </Col>
                  <Col span={8}>
                    <label>Test Limit Type</label>
                    <Select
                      value={softLaunchConfig.testLimitType}
                      onChange={val => setSoftLaunchConfig({ ...softLaunchConfig, testLimitType: val })}
                      style={{ width: '100%' }}
                    >
                      <Select.Option value="fixed">Fixed</Select.Option>
                      <Select.Option value="percentage">Percentage</Select.Option>
                    </Select>
                  </Col>
                  <Col span={8}>
                    <label>Auto-pause</label>
                    <Switch
                      checked={softLaunchConfig.autoPause}
                      onChange={checked => setSoftLaunchConfig({ ...softLaunchConfig, autoPause: checked })}
                    />
                  </Col>
                </Row>
              </Card>
              <Alert
                message={hasWarnings ? "Quota mismatch: Quotas do not match completes. You can still launch, but review quotas." : "All set! Ready to launch."}
                type={hasWarnings ? "warning" : "success"}
                showIcon
                className="mb-4"
              />
              <div className="flex justify-between">
                <Button onClick={() => setCurrentStep(1)}>Back</Button>
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  disabled={!canLaunch}
                  onClick={(e) => handleLaunchModal(softLaunchConfig.testLimit > 0 ? 'soft' : 'full')}
                >
                  Finalize & Launch
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Launch Confirmation Modal */}
      <Modal
        title={`${launchType === 'soft' ? 'Soft Launch' : 'Full Launch'} Confirmation`}
        open={launchModalVisible}
        footer={null}
      >
        <div className="space-y-4">
          {launchType === 'soft' ? (
            <>
              <Alert
                message="Starting Soft Launch"
                description={`Test with ${softLaunchConfig.testLimit} completes first, then review before full launch.`}
                type="info"
                showIcon
              />
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium mb-2">Soft Launch Configuration</h4>
                <ul className="text-sm space-y-1">
                  <li>• Test Sample: <b>{softLaunchConfig.testLimit} completes</b></li>
                  <li>• Auto-pause: <b>{softLaunchConfig.autoPause ? 'Enabled' : 'Disabled'}</b></li>
                  <li>• Quality monitoring: <b>Active</b></li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Cost Breakdown</h4>
                <ul className="text-sm space-y-1">
                  <li>• <b>Test Cost:</b> ${testCost.toFixed(2)}</li>
                  <li>• <b>Remaining Cost:</b> ${remainingCost.toFixed(2)}</li>
                  <li>• <b>Total Project Cost:</b> ${totalCost.toFixed(2)}</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Alert
                message="Full Launch Confirmation"
                description="Project will launch immediately at full scale. All costs will be incurred upfront."
                type="warning"
                showIcon
              />
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium mb-2">Full Launch Details</h4>
                <ul className="text-sm space-y-1">
                  <li>• Sample Size: <b>{projectData.completes} completes</b></li>
                  <li>• Total Cost: <b>${totalCost.toFixed(2)}</b></li>
                  <li>• No test phase - immediate full deployment</li>
                </ul>
              </div>
            </>
          )}

          {hasWarnings && (
            <Alert
              message="Proceeding with Warnings"
              description="Your project has configuration warnings but can still be launched."
              type="warning"
              showIcon
            />
          )}

          {launchError && (
            <Alert type="error" message={launchError} showIcon />
          )}

          <div className="space-y-3">
            <Checkbox
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
            >
              I understand the costs and configuration, and want to proceed with {launchType === 'soft' ? 'soft launch' : 'full launch'}
            </Checkbox>
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setLaunchModalVisible(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              loading={launching}
              disabled={!agreementChecked}
              onClick={handleLaunchConfirm}
              className="bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              {launching
                ? `Starting ${launchType === 'soft' ? 'Soft' : 'Full'} Launch...`
                : `Confirm ${launchType === 'soft' ? 'Soft' : 'Full'} Launch`
              }
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
