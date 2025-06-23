"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Typography, message, Form, Input, Select, Alert, Tooltip } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, RocketOutlined } from '@ant-design/icons';
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
    // Only check for completes and incidence rate, no need for project name
    if (!projectData.completes || !projectData.incidence_rate) {
      return;
    }

    setIsCalculating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock feasibility data
      const mockFeasibilityData: FeasibilityData = {
        is_feasible: true,
        estimated_cost: 350.00,
        estimated_time_days: "3-5",
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

  useEffect(() => {
    // Start calculating feasibility when any of the key criteria are set
    // No need to wait for project name and description
    const hasMinimumCriteria = 
      (projectData.completes ?? 0) > 0 && 
      (projectData.incidence_rate ?? 0) > 0 && 
      projectData.demographics && 
      Object.keys(projectData.demographics).some(key => {
        const value = projectData.demographics?.[key as keyof typeof projectData.demographics];
        return Array.isArray(value) && value.length > 0;
      });
    
    if (hasMinimumCriteria) {
      const timer = setTimeout(() => {
        calculateFeasibility();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [projectData.completes, projectData.incidence_rate, projectData.demographics, calculateFeasibility]);

  const handleSaveDraft = () => {
    message.success('Project draft saved successfully');
  };

  const handleLaunch = (e?: React.MouseEvent<HTMLElement>) => {
    if (e) e.preventDefault();
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
        launch_type: launchType,
        launch_config: launchConfig
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
          {/* Project Details */}
          <Card title="Project Details" className="mb-6">
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
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="country"
                    label="Country"
                    rules={[{ required: true, message: 'Please select a country' }]}
                  >
                    <Select placeholder="Select country">
                      <Option value="US">United States</Option>
                      <Option value="UK">United Kingdom</Option>
                      <Option value="CA">Canada</Option>
                      <Option value="AU">Australia</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="language"
                    label="Language"
                    rules={[{ required: true, message: 'Please select a language' }]}
                  >
                    <Select placeholder="Select language">
                      <Option value="en">English</Option>
                      <Option value="es">Spanish</Option>
                      <Option value="fr">French</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="completes"
                    label="Completes"
                    rules={[{ required: true, message: 'Please enter number of completes' }]}
                  >
                    <Input type="number" min={1} placeholder="100" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="loi_minutes"
                    label="LOI (minutes)"
                    rules={[{ required: true, message: 'Please enter LOI' }]}
                  >
                    <Input type="number" min={1} placeholder="15" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="incidence_rate"
                    label="Incidence Rate (%)"
                    rules={[{ required: true, message: 'Please enter incidence rate' }]}
                  >
                    <Input type="number" min={1} max={100} placeholder="30" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
          
          {/* Demographics Builder */}
          <Card title="Target Audience" className="mb-6">
            <DemographicsBuilder
              demographics={projectData.demographics || {}}
              onUpdate={(demographics) => handleDataChange({ demographics })}
            />
          </Card>
          
          {/* Quotas Builder */}
          <Card title="Quotas (Optional)" className="mb-6">
            <QuotaBuilder
              demographics={projectData.demographics || {}}
              targetCompletes={projectData.completes || 100}
              quotas={quotaData}
              onQuotaChange={(quotas) => {
                setQuotaData(quotas);
                handleDataChange({ quotas });
              }}
            />
          </Card>
        </Col>
        
        {/* Feasibility Sidebar - Only visible on desktop */}
        {!isMobile && (
          <Col lg={9}>
            <div className="sticky-sidebar-container">
              <div className="sticky-feasibility-panel">
                {/* Feasibility Panel - Desktop Only - Sticky */}
                <Card title="Feasibility" className="mb-6">
                  {isCalculating ? (
                    <div className="text-center py-4">
                      <div className="animate-pulse">Calculating feasibility...</div>
                      <div className="mt-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  ) : feasibilityData ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Text strong>Status:</Text>
                        <Text 
                          className={`font-medium ${feasibilityData.is_feasible ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {feasibilityData.is_feasible ? 'Feasible' : 'Not Feasible'}
                        </Text>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Text strong>Estimated Cost:</Text>
                        <Text className="font-medium">${feasibilityData.estimated_cost.toFixed(2)}</Text>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Text strong>Estimated Time:</Text>
                        <Text className="font-medium">{feasibilityData.estimated_time_days} days</Text>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Text strong>Available Suppliers:</Text>
                        <Text className="font-medium">{feasibilityData.available_suppliers}</Text>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Text strong>Recommended CPI:</Text>
                        <Text className="font-medium">${feasibilityData.recommended_cpi.toFixed(2)}</Text>
                      </div>
                      
                      <div className="mt-4">
                        <Alert
                          message="Recommendations"
                          description={
                            <ul className="list-disc pl-4 mt-2">
                              {feasibilityData.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          }
                          type="info"
                          showIcon
                        />
                      </div>
                      
                      {!feasibilityData.is_feasible && (
                        <div className="mt-4">
                          <Alert
                            message="Warning"
                            description="This project may not be feasible with the current criteria. Consider adjusting your targeting or timeline expectations."
                            type="warning"
                            showIcon
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <Alert
                      message="Enter project details"
                      description="Please fill in the project details to see feasibility estimates."
                      type="info"
                      showIcon
                    />
                  )}
                </Card>

                {/* Current Targeting Card */}
                {projectData.demographics && Object.keys(projectData.demographics).some(key => {
                  const value = projectData.demographics?.[key as keyof typeof projectData.demographics];
                  return Array.isArray(value) && value.length > 0;
                }) && (
                  <Card title="🎯 Current Targeting" size="small" className="border-green-200 mb-6">
                    <div className="space-y-2">
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
                          <div key={category} className="flex items-center space-x-2">
                            <span className="px-2 py-1 border rounded text-blue-600 border-blue-200 bg-blue-50 text-xs font-medium">
                              {categoryInfo?.name || category}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {(values as string[]).map((value) => (
                                <span key={value} className="px-2 py-1 border rounded bg-gray-50 text-xs font-medium flex items-center">
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
                  <Button 
                    icon={<SaveOutlined />} 
                    onClick={handleSaveDraft} 
                    size="large"
                    loading={isCalculating}
                  >
                    Save Draft
                  </Button>
                  {isComplete ? (
                    <div className="relative inline-block ml-3">
                      <div className="absolute -top-3 -right-3 w-5 h-5 bg-green-500 rounded-full animate-pulse"></div>
                      <Tooltip title="Ready to launch!" placement="top">
                        <Button 
                          type="primary"
                          size="large"
                          icon={<RocketOutlined />}
                          onClick={handleLaunch}
                          className="bg-green-500 hover:bg-green-600 border-green-500"
                        >
                          Finalize & Launch
                        </Button>
                      </Tooltip>
                    </div>
                  ) : null}
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
          isCalculating={isCalculating}
          isComplete={isComplete}
          onSaveDraft={handleSaveDraft}
          onCreateProject={handleLaunch}
          className="mobile-feasibility-panel"
        />
      )}
    </div>
  );
};

export default UnifiedProjectCreator;
