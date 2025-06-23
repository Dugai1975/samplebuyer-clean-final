"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Typography, message, Form, Input, Select, Alert, Tooltip, InputNumber, Slider, Tag, Skeleton } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, RocketOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { FeasibilityData, QuotaProgress, ProjectCreationData } from '@/types';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileFeasibilityPanel from '@/components/mobile/MobileFeasibilityPanel';
import './UnifiedProjectCreator.mobile.css';
import './UnifiedProjectCreator.sticky.css';
import { apiService } from '@/services/api';
import { DemographicsBuilder } from './DemographicsBuilder';
import QuotaBuilder from './QuotaBuilder';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface UnifiedProjectCreatorProps {
  onCancel: () => void;
  onComplete: (data: ProjectCreationData) => void;
}

export const UnifiedProjectCreator: React.FC<UnifiedProjectCreatorProps> = ({
  onCancel,
  onComplete
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [form] = Form.useForm();
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showQuotas, setShowQuotas] = useState(false);
  const [projectData, setProjectData] = useState<Partial<ProjectCreationData> & Record<string, any>>({
    country: 'US',
    language: 'en',
    languages: ['en'],
    completes: 100,
    loi_minutes: 15,
    incidence_rate: 30,
    survey_id: '',
    demographics: {},
    priority_level: 'standard'
  });

  const [feasibilityData, setFeasibilityData] = useState<FeasibilityData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quotaData, setQuotaData] = useState<QuotaProgress[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [launching, setLaunching] = useState(false);

  // Redirect links state
  const [redirectLinks, setRedirectLinks] = useState<Record<string, string>>({});
  const [redirectLinksValid, setRedirectLinksValid] = useState(false);

  // Calculate margin of error for a given sample size (95% confidence level)
  const calculateMarginOfError = (sampleSize: number): number => {
    // Formula: z * sqrt(p * (1-p) / n), where z=1.96 for 95% confidence level, p=0.5 for maximum variance
    return Math.round((1.96 * Math.sqrt(0.5 * 0.5 / sampleSize)) * 1000) / 10; // Round to 1 decimal place
  };

  const handleDataChange = useCallback((updates: Partial<ProjectCreationData>) => {
    setProjectData((prev) => {
      // For demographics updates, do a deep comparison to prevent unnecessary updates
      if (updates.demographics) {
        const prevDemographics = JSON.stringify(prev.demographics);
        const newDemographics = JSON.stringify(updates.demographics);
        // If demographics haven't changed, don't trigger an update
        if (prevDemographics === newDemographics) {
          return prev;
        }
        // Just treat all demographic fields as string arrays
        return { ...prev, ...updates, demographics: { ...updates.demographics } };
      }
      // Only update if there are actual changes
      return { ...prev, ...updates };
    });
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 800);
  }, []);

  // Check for stored audience description and project name from the dashboard
  useEffect(() => {
    // Check if we have stored audience description and project name from the dashboard
    const storedDescription = typeof window !== 'undefined' ? sessionStorage.getItem('audienceDescription') : null;
    const storedProjectName = typeof window !== 'undefined' ? sessionStorage.getItem('projectName') : null;
    
    if (storedDescription && storedProjectName) {
      // Update form and state with the stored values
      form.setFieldsValue({
        name: storedProjectName,
        description: storedDescription
      });
      
      handleDataChange({
        name: storedProjectName,
        description: storedDescription
      });
      
      // Clear the session storage to prevent reusing the same values
      sessionStorage.removeItem('audienceDescription');
      sessionStorage.removeItem('projectName');
    }
  }, [form, handleDataChange]);

  const calculateFeasibility = useCallback(async () => {
    // Only calculate if all required fields are present
    const hasMinimumProjectDetails = 
      (projectData.completes ?? 0) > 0 && 
      (projectData.incidence_rate ?? 0) > 0 && 
      (projectData.loi_minutes ?? 0) > 0;
    const hasTargetingCriteria = 
      projectData.demographics && 
      Object.keys(projectData.demographics).some(key => {
        const value = projectData.demographics?.[key as keyof typeof projectData.demographics];
        return Array.isArray(value) && value.length > 0;
      });
    if (!(hasMinimumProjectDetails && hasTargetingCriteria)) {
      return;
    }
    // Only set isCalculating to true, but keep previous feasibility data visible
    // This prevents flickering back to the initial state while recalculating
    setIsCalculating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock feasibility data
      const mockFeasibilityData: FeasibilityData = {
        feasible: true,
        estimated_cost: 350.00,
        estimated_time: "3-5 days",
        available_suppliers: 12,
        recommended_cpi: 3.50,
        recommendations: [
          "Consider adding quotas for better representation"
        ],
        warnings: []
      };
      
      setFeasibilityData(mockFeasibilityData);
    } catch (error) {
      message.error('Failed to calculate feasibility');
    } finally {
      setIsCalculating(false);
    }
  }, [projectData]);

  // Removed manual trigger functionality as it's not needed

  // Helper function to check if project has minimum details
  const checkHasMinimumProjectDetails = () => {
    return (projectData.completes ?? 0) > 0 && 
           (projectData.incidence_rate ?? 0) > 0 && 
           (projectData.loi_minutes ?? 0) > 0;
  };

  // Helper function to check if project has targeting criteria
  const checkHasTargetingCriteria = () => {
    return projectData.demographics && 
           Object.keys(projectData.demographics).some(key => {
             const value = projectData.demographics?.[key as keyof typeof projectData.demographics];
             return Array.isArray(value) && value.length > 0;
           });
  };

  useEffect(() => {
    // Only auto-calculate when all required data is present and significant changes have occurred
    const hasMinimumDetails = checkHasMinimumProjectDetails();
    const hasTargeting = checkHasTargetingCriteria();
    
    if (hasMinimumDetails && hasTargeting) {
      // Use a debounce to prevent too frequent calculations
      const timer = setTimeout(() => {
        calculateFeasibility();
        
        // Auto-generate project name and description if feasibility is good
        if (!projectData.name || projectData.name === '') {
          const demographics = projectData.demographics || {};
          const targetGroups = [];
          
          if (demographics.gender && demographics.gender.length > 0) {
            targetGroups.push(demographics.gender.join('/'));
          }
          
          if (demographics.age_ranges && demographics.age_ranges.length > 0) {
            targetGroups.push(demographics.age_ranges.join('-'));
          }
          
          const countryName = {
            'US': 'United States',
            'UK': 'United Kingdom',
            'CA': 'Canada',
            'AU': 'Australia'
          }[projectData.country as string] || projectData.country;
          
          const autoName = `${countryName} ${targetGroups.join(' ')} Survey`;
          const autoDescription = `A survey targeting ${targetGroups.join(', ')} respondents in ${countryName} with ${projectData.completes} completes and ${projectData.incidence_rate}% incidence rate.`;
          
          form.setFieldsValue({
            name: autoName,
            description: autoDescription
          });
          
          handleDataChange({ name: autoName, description: autoDescription });
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [projectData.completes, projectData.incidence_rate, projectData.loi_minutes, projectData.demographics, calculateFeasibility, form, projectData.country, projectData.name]);

  const handleSaveDraft = () => {
    // Show project details section if not already shown
    if (!showProjectDetails) {
      setShowProjectDetails(true);
    }
    message.success('Project draft saved successfully');
  };

  const handleLaunch = (e?: React.MouseEvent<HTMLElement>) => {
    if (e) e.preventDefault();
    // Show project details section if not already shown
    if (!showProjectDetails) {
      setShowProjectDetails(true);
    }
    setShowReview(true);
  };

  const handleReviewLaunch = (launchType: 'soft' | 'full', launchConfig: any) => {
    setLaunching(true);
    
    // Simulate API call to launch project
    setTimeout(() => {
      setLaunching(false);
      setShowReview(false);
      
      if (launchType === 'soft') {
        message.success('Project soft launched successfully!');
      } else {
        message.success('Project launched successfully!');
      }
      
      // Call the onComplete callback with the project data
      onComplete({
        ...projectData as ProjectCreationData,
        // Add launch info to the project data
        // TypeScript doesn't know about these properties as they're not in the interface
        // but they'll be added to the object at runtime
        ...({
          launch_type: launchType,
          launch_config: launchConfig
        } as any)
      });
    }, 1500);
  };

  // Determine if we have enough data to enable the launch button
  const isComplete = !!feasibilityData;

  return (
    <div className="max-w-7xl mx-auto p-6 project-creator-container" style={isMobile ? { paddingBottom: '120px' } : {}}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={onCancel}
            className="mr-2"
          />
          <Title level={4} className="m-0">Create New Project</Title>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main content */}
        <Col xs={24} lg={15}>
          {/* Essential Fields - Always visible first */}
          <Card title="Step 1: Tell us about your study" className="mb-6">
            <Form
              form={form}
              layout="vertical"
              initialValues={projectData}
              onValuesChange={(_, allValues) => handleDataChange(allValues)}
            >
              {/* Organize form fields in a more spacious layout for desktop */}
              <Row gutter={[24, 16]} className="mb-6">
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="country"
                    label={<>
                      Country
                      <Tooltip title="Country where respondents are located">
                        <InfoCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </>}
                    rules={[{ required: true, message: 'Please select a country' }]}
                  >
                    <Select placeholder="Select country" size="large">
                      <Option value="US">United States</Option>
                      <Option value="UK">United Kingdom</Option>
                      <Option value="CA">Canada</Option>
                      <Option value="AU">Australia</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="language"
                    label={<>
                      Language
                      <Tooltip title="Language for the survey">
                        <InfoCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </>}
                    rules={[{ required: true, message: 'Please select a language' }]}
                  >
                    <Select placeholder="Select language" size="large">
                      <Option value="en">English</Option>
                      <Option value="es">Spanish</Option>
                      <Option value="fr">French</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[24, 16]} className="mb-6">
                {/* Row 2: Completes */}
                <Col xs={24} className="mb-6">
                  <Form.Item
                    label="Sample Size (Completes)"
                    name="completes"
                    rules={[{ required: true, message: 'Please enter sample size' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={50}
                      max={10000}
                      step={50}
                      size="large"
                      onChange={(value) => handleDataChange({ completes: value as number })}
                      onFocus={(e) => e.target.select()}
                    />
                  </Form.Item>
                  <div className="text-xs text-gray-500">
                    <Tooltip title="Margin of error at 95% confidence level. Increasing sample size improves accuracy with diminishing returns">
                      <span className="cursor-help">
                        Current margin of error: ±{calculateMarginOfError(projectData.completes || 100)}%
                      </span>
                    </Tooltip>
                    <div className="mt-2 space-y-2">
                      <div className="cursor-pointer" onClick={() => {
                        form.setFieldsValue({ completes: 100 });
                        handleDataChange({ completes: 100 });
                      }}>
                        <Tag color="orange">Directional</Tag>
                        <span className="ml-1 hover:text-blue-600">n=100 (±{calculateMarginOfError(100)}%) - Quick insights and general trends</span>
                      </div>
                      <div className="cursor-pointer" onClick={() => {
                        form.setFieldsValue({ completes: 400 });
                        handleDataChange({ completes: 400 });
                      }}>
                        <Tag color="blue">Base</Tag>
                        <span className="ml-1 hover:text-blue-600">n=400 (±{calculateMarginOfError(400)}%) - Analyze 2-3 subgroups</span>
                      </div>
                      <div className="cursor-pointer" onClick={() => {
                        form.setFieldsValue({ completes: 1000 });
                        handleDataChange({ completes: 1000 });
                      }}>
                        <Tag color="green">Advanced</Tag>
                        <span className="ml-1 hover:text-blue-600">n=1000 (±{calculateMarginOfError(1000)}%) - Multiple segments analysis</span>
                      </div>
                    </div>
                  </div>
                </Col>
                
                {/* Row 3: Incidence Rate with Slider */}
                <Col xs={24} className="mb-6">
                  <Form.Item
                    label="Incidence Rate (%)"
                    name="incidence_rate"
                    rules={[{ required: true, message: 'Please enter incidence rate' }]}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex-grow pr-2" style={{ width: 'calc(100% - 110px)' }}>
                        <Slider
                          min={1}
                          max={100}
                          value={projectData.incidence_rate}
                          marks={{
                            10: '10%',
                            30: '30%',
                            50: '50%',
                            70: '70%',
                            90: '90%'
                          }}
                          tooltip={{ formatter: (value) => `${value}%` }}
                          onChange={(value) => {
                            form.setFieldsValue({ incidence_rate: value });
                            handleDataChange({ incidence_rate: value as number });
                          }}
                        />
                      </div>
                      <div style={{ width: '100px', flexShrink: 0 }}>
                        <InputNumber
                          style={{ width: '100%' }}
                          min={1}
                          max={100}
                          value={projectData.incidence_rate}
                          addonAfter="%"
                          size="large"
                          onChange={(value) => handleDataChange({ incidence_rate: value as number })}
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    </div>
                  </Form.Item>
                  <div className="text-xs text-gray-500">
                    <Tooltip title="Percentage of people who qualify for your survey based on screening criteria">
                      <span className="cursor-help">
                        <InfoCircleOutlined className="mr-1" />
                        Lower incidence rates increase cost and time
                      </span>
                    </Tooltip>
                  </div>
                </Col>
              </Row>
              
              <Row gutter={[24, 16]} className="mb-6">
                <Col xs={24} className="mb-6">
                  <Form.Item
                    label="Survey Length"
                    name="loi_minutes"
                    rules={[{ required: true, message: 'Please enter survey length' }]}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex-grow pr-2" style={{ width: 'calc(100% - 110px)' }}>
                        <Slider
                          min={1}
                          max={30}
                          value={projectData.loi_minutes}
                          marks={{
                            5: '5 min',
                            10: '10 min',
                            15: '15 min',
                            20: '20 min',
                            25: '25 min'
                          }}
                          tooltip={{ formatter: (value) => `${value} minutes` }}
                          onChange={(value) => {
                            form.setFieldsValue({ loi_minutes: value });
                            handleDataChange({ loi_minutes: value as number });
                          }}
                        />
                      </div>
                      <div style={{ width: '100px', flexShrink: 0 }}>
                        <InputNumber
                          style={{ width: '100%' }}
                          min={1}
                          max={30}
                          value={projectData.loi_minutes}
                          addonAfter="min"
                          size="large"
                          onChange={(value) => handleDataChange({ loi_minutes: value as number })}
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    </div>
                  </Form.Item>
                  <div className="text-xs text-gray-500">
                    <Tooltip title="Shorter surveys typically have higher completion rates and lower costs">
                      <span className="cursor-help">
                        <InfoCircleOutlined className="mr-1" />
                        Shorter surveys have higher completion rates
                      </span>
                    </Tooltip>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card>
          
          {/* Project Details - Only shown when needed */}
          {showProjectDetails && (
            <Card title="Name your project" className="mb-6">
              <Form
                form={form}
                layout="vertical"
                initialValues={projectData}
                onValuesChange={(_, allValues) => handleDataChange(allValues)}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="name"
                      label="Project Name"
                      rules={[{ required: true, message: 'Please enter a project name' }]}
                    >
                      <Input placeholder="Enter project name" />
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="description"
                      label="Project Description"
                      rules={[{ required: true, message: 'Please enter a project description' }]}
                    >
                      <TextArea 
                        placeholder="Describe your project and target audience" 
                        rows={4}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          )}
          
          {/* Demographics Builder */}
          <Card title="Step 2: Select your target audience" className="mb-6">
            <DemographicsBuilder
              initialDemographics={projectData.demographics || {}}
              onUpdate={(demographics) => handleDataChange({ demographics })}
            />
          </Card>
          
          {/* Quotas Builder - Collapsible */}
          <Card 
            title={
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowQuotas(!showQuotas)}>
                <span>Step 3: Fine-tune demographic balance (optional)</span>
                <Button type="link" onClick={(e) => { e.stopPropagation(); setShowQuotas(!showQuotas); }}>
                  {showQuotas ? 'Hide' : 'Show'}
                </Button>
              </div>
            } 
            className="mb-6"
          >
            {showQuotas ? (
              <QuotaBuilder
                demographics={projectData.demographics || {}}
                targetCompletes={projectData.completes || 100}
                quotas={quotaData}
                onQuotaChange={(quotas) => {
                  setQuotaData(quotas);
                  handleDataChange({ quotas });
                }}
              />
            ) : (
              <div className="text-gray-500 py-2">
                <p>Control the precise demographic distribution of your respondents to ensure representative results.</p>
                <p className="mt-2">This advanced feature helps you maintain specific proportions across demographic segments.</p>
                <Button type="link" onClick={() => setShowQuotas(true)}>Fine-tune demographic balance</Button>
              </div>
            )}
          </Card>
        </Col>
        
        {/* Feasibility Sidebar - Only visible on desktop */}
        {!isMobile && (
          <Col lg={9}>
            <div className="sticky-sidebar-container">
              <div className="sticky-feasibility-panel">
                {/* Feasibility Panel - Desktop Only - Sticky */}
                <Card 
                  title="Study Feasibility"
                  className="mb-6"
                >
                  {isCalculating && checkHasMinimumProjectDetails() && checkHasTargetingCriteria() ? (
                    <div className="py-4">
                      <Skeleton active paragraph={{ rows: 1 }} />
                      <div className="flex justify-between items-center mt-6 border-b border-gray-100 pb-4">
                        <Skeleton.Input active size="small" style={{ width: 120 }} />
                        <Skeleton.Input active size="small" style={{ width: 90 }} />
                      </div>
                      <div className="flex justify-between items-center mt-6 border-b border-gray-100 pb-4">
                        <Skeleton.Input active size="small" style={{ width: 120 }} />
                        <Skeleton.Input active size="small" style={{ width: 90 }} />
                      </div>
                      <div className="flex justify-between items-center mt-6 border-b border-gray-100 pb-4">
                        <Skeleton.Input active size="small" style={{ width: 140 }} />
                        <Skeleton.Input active size="small" style={{ width: 80 }} />
                      </div>
                      <div className="flex justify-between items-center mt-6 border-b border-gray-100 pb-4">
                        <Skeleton.Input active size="small" style={{ width: 130 }} />
                        <Skeleton.Input active size="small" style={{ width: 100 }} />
                      </div>
                      <div className="mt-8">
                        <Skeleton.Input active size="small" style={{ width: '100%', height: 24 }} />
                        <div className="mt-4">
                          <Skeleton active paragraph={{ rows: 2 }} title={false} />
                        </div>
                      </div>
                    </div>
                  ) : feasibilityData ? (
                    <div className="space-y-0">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <Text strong className="text-gray-700">Status:</Text>
                        <Tag 
                          color={feasibilityData.feasible ? 'success' : 'error'}
                          className="font-semibold text-sm px-3 py-0.5 rounded-md"
                        >
                          {feasibilityData.feasible ? 'Feasible' : 'Not Feasible'}
                        </Tag>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <Text strong className="text-gray-700">Estimated Cost:</Text>
                        <Text className="font-medium">${feasibilityData.estimated_cost.toFixed(2)}</Text>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <Text strong className="text-gray-700">Estimated Time:</Text>
                        <Text className="font-medium">{feasibilityData.estimated_time}</Text>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <Text strong className="text-gray-700">Available Suppliers:</Text>
                        <Text className="font-medium">{feasibilityData.available_suppliers}</Text>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <Text strong className="text-gray-700">Recommended CPI:</Text>
                        <Text className="font-medium">${feasibilityData.recommended_cpi.toFixed(2)}</Text>
                      </div>
                      
                      {/* Only show recommendations if at least one applies */}
                      {((projectData.incidence_rate !== undefined && projectData.incidence_rate <= 30) || 
                        (projectData.loi_minutes !== undefined && projectData.loi_minutes >= 20) || 
                        (projectData.demographics?.device_preference?.includes('Desktop') && 
                         !projectData.demographics?.device_preference?.includes('Mobile')) || 
                        (projectData.completes !== undefined && projectData.completes < 200) ||
                        (projectData.completes !== undefined && projectData.completes >= 400) ||
                        (feasibilityData.recommendations && feasibilityData.recommendations.length > 0)) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="mb-1">
                            <Text strong className="text-sm">Recommendations</Text>
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-xs">
                            {/* Generate data-driven recommendations based on project parameters */}
                            {projectData.incidence_rate !== undefined && projectData.incidence_rate <= 30 && (
                              <li className="text-gray-700">Consider broadening criteria - each 10% incidence increase reduces cost by ~25%</li>
                            )}
                            {projectData.loi_minutes !== undefined && projectData.loi_minutes >= 20 && (
                              <li className="text-gray-700">Split into shorter studies - improves completion rates and data quality</li>
                            )}
                            {projectData.demographics?.device_preference?.includes('Desktop') && 
                             !projectData.demographics?.device_preference?.includes('Mobile') && (
                              <li className="text-gray-700">Add mobile optimization for 10x broader reach (70% of potential audience)</li>
                            )}
                            {projectData.completes !== undefined && projectData.completes < 200 && (
                              <li className="text-gray-700">Add +200 completes for reliable subgroup analysis (~$700, major insights gain)</li>
                            )}
                            {projectData.completes !== undefined && projectData.completes >= 400 && (
                              <li className="text-gray-700">Consider adding quotas for better demographic distribution</li>
                            )}
                            {/* If no custom recommendations apply, show default ones */}
                            {!((projectData.incidence_rate !== undefined && projectData.incidence_rate <= 30) || 
                               (projectData.loi_minutes !== undefined && projectData.loi_minutes >= 20) || 
                               (projectData.demographics?.device_preference?.includes('Desktop') && 
                                !projectData.demographics?.device_preference?.includes('Mobile')) || 
                               (projectData.completes !== undefined && projectData.completes < 200) ||
                               (projectData.completes !== undefined && projectData.completes >= 400)) && 
                               feasibilityData.recommendations?.map((rec, index) => (
                                <li key={index} className="text-gray-700">{rec}</li>
                              ))}
                          </ul>
                        </div>
                      )}
                      
                      {!feasibilityData.feasible && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="mb-1">
                            <Text strong className="text-sm text-amber-600">Warning</Text>
                          </div>
                          <p className="text-xs text-gray-700">
                            This project may not be feasible with the current criteria. Consider adjusting your targeting or timeline expectations.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-2">
                      <Alert
                        message={<Text strong className="text-base">Enter project details</Text>}
                        description={
                          <div className="mt-2">
                            <p>Please fill in the project details and add at least one targeting criteria to see feasibility estimates.</p>
                            <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-600">
                              <li>Set sample size (number of completes)</li>
                              <li>Define incidence rate percentage</li>
                              <li>Specify survey length in minutes</li>
                              <li>Select at least one demographic targeting option</li>
                            </ul>
                          </div>
                        }
                        type="info"
                        showIcon
                        className="mb-4 bg-blue-50 border-blue-100"
                      />
                      {/* Removed redundant targeting criteria notification */}
                      {!checkHasMinimumProjectDetails() && checkHasTargetingCriteria() && (
                        <div className="text-amber-600 mb-4 p-3 bg-amber-50 border border-amber-100 rounded-md flex items-start">
                          <InfoCircleOutlined className="mr-2 mt-1 flex-shrink-0" />
                          <span>Missing project details. Please set sample size, incidence rate, and survey length to calculate feasibility.</span>
                        </div>
                      )}
                      {/* Manual calculation button removed as it's not needed */}
                    </div>
                  )}
                </Card>

                {/* Current Targeting Card */}
                {projectData.demographics && Object.keys(projectData.demographics).some(key => {
                  const value = projectData.demographics?.[key as keyof typeof projectData.demographics];
                  return Array.isArray(value) && value.length > 0;
                }) && (
                  <Card 
                    title={<div className="flex items-center"><span className="text-gray-700 font-medium">Current Targeting</span></div>} 
                    size="small" 
                    className="mb-4 border-0 shadow-sm"
                  >
                    <div className="space-y-1">
                      {Object.entries(projectData.demographics || {}).map(([category, values]) => {
                        if (!Array.isArray(values) || values.length === 0) return null;
                        // Merge core and advanced options for lookup
                        const coreDemographicOptions: Record<string, { name: string }> = {
                          gender: { name: 'Gender' },
                          age_ranges: { name: 'Age' },
                          income: { name: 'Income' },
                          employment: { name: 'Employment' }
                        };
                        const advancedDemographicOptions: Record<string, { name: string }> = {
                          education: { name: 'Education' },
                          marital_status: { name: 'Marital Status' },
                          children: { name: 'Children' },
                          ethnicity: { name: 'Ethnicity' },
                          location_type: { name: 'Location' },
                          device_preference: { name: 'Device' }
                        };
                        const allOptions: Record<string, { name: string }> = { ...coreDemographicOptions, ...advancedDemographicOptions };
                        const categoryInfo = allOptions[category];
                        return (
                          <div key={category} className="flex items-center py-1 border-b border-gray-100 last:border-0">
                            <span className="px-2 py-0.5 mr-2 rounded text-gray-700 bg-gray-100 text-xs font-medium min-w-[70px] text-center">
                              {categoryInfo?.name || category}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {(values as string[]).map((value) => (
                                <span key={value} className="px-2 py-0.5 text-xs font-medium flex items-center">
                                  {value}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Sticky Action Buttons - Desktop Only */}
                <div className="sticky-action-buttons">
                  <div>
                    <Button 
                      icon={<SaveOutlined />} 
                      onClick={handleSaveDraft} 
                      size="large"
                      loading={isCalculating}
                      className="min-w-[120px]"
                    >
                      Save Draft
                    </Button>
                  </div>
                  <div>
                    {isComplete ? (
                      <div className="relative inline-block">
                        <div className="absolute -top-3 -right-3 w-5 h-5 bg-green-500 rounded-full animate-pulse"></div>
                        <Tooltip title="Ready to launch!" placement="top">
                          <Button 
                            type="primary"
                            size="large"
                            icon={<RocketOutlined />}
                            onClick={handleLaunch}
                            className="bg-green-500 hover:bg-green-600 border-green-500 min-w-[160px]"
                          >
                            Finalize & Launch
                          </Button>
                        </Tooltip>
                      </div>
                    ) : (
                      <Button 
                        type="primary"
                        size="large"
                        disabled
                        className="min-w-[160px] opacity-50"
                      >
                        Finalize & Launch
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        )}
      </Row>
      
      {/* Mobile Feasibility Panel */}
      {isMobile && (
        <MobileFeasibilityPanel
          feasibilityData={feasibilityData}
          isCalculating={!!(isCalculating && checkHasMinimumProjectDetails() && checkHasTargetingCriteria())}
          isComplete={isComplete}
          onSaveDraft={handleSaveDraft}
          onCreateProject={handleLaunch}
          className="mobile-feasibility-panel"
          demographics={projectData.demographics}
        />
      )}
    </div>
  );
};

export default UnifiedProjectCreator;
