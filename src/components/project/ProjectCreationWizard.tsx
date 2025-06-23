"use client";

import React, { useState, useEffect } from 'react';
import { Steps, Card, Button, Form, Input, Select, InputNumber, Row, Col, Alert, Typography, message } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, SaveOutlined } from '@ant-design/icons';
import { ProjectCreationData, FeasibilityData, QuotaProgress, AIPromptAnalysis } from '@/types/enhanced';
import { analytics } from '@/services/analytics';
import { FeasibilityEngine } from './FeasibilityEngine';
import { DemographicsBuilder } from './DemographicsBuilder';
import { QuotaVisualizer } from '../shared/QuotaVisualizer';
import { CleanProjectLaunch } from './ProjectReviewLaunch';
import { AIPromptInput } from './AIPromptInput';

// We'll use the AIPromptAnalysis interface from enhanced.ts

const { Step } = Steps;
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ProjectCreationWizardProps {
  onCancel: () => void;
  onComplete: (data: ProjectCreationData) => void;
}

export const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({
  onCancel,
  onComplete
}) => {
  // Define steps array for the wizard
  const steps = [
    {
      title: 'AI Setup',
      description: 'Describe your project'
    },
    {
      title: 'Basic Info',
      description: 'Project details'
    },
    {
      title: 'Feasibility',
      description: 'Instant pricing'
    },
    {
      title: 'Demographics',
      description: 'Target audience'
    },
    {
      title: 'Review',
      description: 'Final launch'
    }
  ];
  
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [projectData, setProjectData] = useState<Partial<ProjectCreationData>>({
    country: 'US',
    language: 'en',
    completes: 100,
    loi_minutes: 15,
    incidence_rate: 30,
    demographics: {},
    priority_level: 'standard'
  });
  
  // AI analysis state with updated interface
  const [aiAnalysis, setAiAnalysis] = useState<AIPromptAnalysis | null>(null);
  const [skipAI, setSkipAI] = useState(false);
  
  // Use effect to pre-populate form with AI analysis
  useEffect(() => {
    if (aiAnalysis) {
      // Pre-populate form with AI analysis
      form.setFieldsValue({
        name: aiAnalysis.projectName,
        country: aiAnalysis.country,
        completes: aiAnalysis.completes,
        loi_minutes: aiAnalysis.loi,
        incidence_rate: aiAnalysis.incidenceRate,
      });
      
      // Track AI prompt usage
      analytics.trackAIPromptUsage(true, aiAnalysis.confidence);
    }
  }, [aiAnalysis, form]);

const [feasibilityData, setFeasibilityData] = useState<FeasibilityData | null>(null);
const [quotaData, setQuotaData] = useState<QuotaProgress[]>([]);

// Redirect links state
const [redirectLinks, setRedirectLinks] = useState<Record<string, string>>({});
const [redirectLinksValid, setRedirectLinksValid] = useState(false);

// Helper function to convert ProjectCreationData demographics to Record<string, string[]>
const convertDemographicsToStringArrays = (demographics: any): Record<string, string[]> => {
  if (!demographics) return {};
  
  const result: Record<string, string[]> = {};
  
  // Convert gender (already string[])
  if (demographics.gender && Array.isArray(demographics.gender)) {
    result.gender = demographics.gender;
  }
  
  // Convert age_ranges to string representation
  if (demographics.age_ranges && Array.isArray(demographics.age_ranges)) {
    result.age = demographics.age_ranges.map((range: {min: number, max: number}) => `${range.min}-${range.max}`);
  }
  
  // Convert income (already string[])
  if (demographics.income && Array.isArray(demographics.income)) {
    result.income = demographics.income;
  }
  
  // Convert employment (already string[])
  if (demographics.employment && Array.isArray(demographics.employment)) {
    result.employment = demographics.employment;
  }
  
  return result;
};

// Helper function to convert Record<string, string[]> back to ProjectCreationData demographics
const convertStringArraysToDemographics = (demographics: Record<string, string[]>): any => {
  const result: any = {};
  
  // Convert gender (keep as string[])
  if (demographics.gender && Array.isArray(demographics.gender)) {
    result.gender = demographics.gender;
  }
  
  // Convert age strings back to range objects
  if (demographics.age && Array.isArray(demographics.age)) {
    result.age_ranges = demographics.age.map(ageRange => {
      const [min, max] = ageRange.split('-').map(Number);
      return { min, max };
    });
  }
  
  // Convert income (keep as string[])
  if (demographics.income && Array.isArray(demographics.income)) {
    result.income = demographics.income;
  }
  
  // Convert employment (keep as string[])
  if (demographics.employment && Array.isArray(demographics.employment)) {
    result.employment = demographics.employment;
  }
  
  return result;
};

// Helper function to generate quotas from demographics
const generateQuotasFromDemographics = (demographics: Record<string, string[]>, totalCompletes: number): QuotaProgress[] => {
  const quotas: QuotaProgress[] = [];
  
  // Generate gender quotas if specified
  if (demographics.gender && demographics.gender.length > 0) {
    const genderQuotas = demographics.gender.map(gender => ({
      id: `gender-${gender}`,
      name: gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Other',
      category: 'Gender',
      target: Math.floor(totalCompletes / demographics.gender.length),
      current: 0,
      percentage: 0, // Add percentage field
      status: 'active' as const
    }));
    quotas.push(...genderQuotas);
  }
  
  // Generate age quotas if specified
  if (demographics.age && demographics.age.length > 0) {
    const ageQuotas = demographics.age.map(age => ({
      id: `age-${age}`,
      name: `Age ${age}`,
      category: 'Age',
      target: Math.floor(totalCompletes / demographics.age.length),
      current: 0,
      percentage: 0, // Add percentage field
      status: 'active' as const
    }));
    quotas.push(...ageQuotas);
  }
  
  return quotas;
};

// Steps array is already defined at the top of the component

  const handleNext = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      setProjectData(prev => ({ ...prev, ...values }));
      setCurrentStep(prev => prev + 1);
    } catch (error: any) {
      if (error && error.errorFields && Array.isArray(error.errorFields) && error.errorFields.length > 0) {
        // Show the first validation error message
        const firstError = error.errorFields[0];
        if (firstError && firstError.errors && firstError.errors.length > 0) {
          message.error(firstError.errors[0]);
        } else {
          message.error('Please fix the highlighted fields.');
        }
      } else {
        message.error('Validation failed. Please check your input.');
      }
      console.error('Validation failed:', error);
    }
  };


  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSaveDraft = async () => {
    const values = form.getFieldsValue();
    const draftData = { ...projectData, ...values };
    console.log('Save draft:', draftData);
    // TODO: Save to drafts
  };

  const renderBasicInfoStep = () => (
    <div className="max-w-2xl mx-auto">
      <Title level={3} className="mb-6 text-center">Project Information</Title>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={projectData}
        className="space-y-4"
      >
        <Alert
          message="Quick Setup"
          description="Fill in the basic details to get started. You can modify everything later."
          type="info"
          showIcon
          className="mb-6"
        />

        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, message: 'Please enter a project name' }]}
        >
          <Input 
            placeholder="e.g., Brand Awareness Study Q1 2025"
            size="large"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="country"
              label="Target Country"
              rules={[{ required: true, message: 'Please select a country' }]}
            >
              <Select size="large" placeholder="Select country">
                <Option value="US">United States</Option>
                <Option value="UK">United Kingdom</Option>
                <Option value="CA">Canada</Option>
                <Option value="AU">Australia</Option>
                <Option value="DE">Germany</Option>
                <Option value="FR">France</Option>
                <Option value="BR">Brazil</Option>
                <Option value="MX">Mexico</Option>
                <Option value="JP">Japan</Option>
                <Option value="IN">India</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="language"
              label="Survey Language"
              rules={[{ required: true, message: 'Please select a language' }]}
            >
              <Select size="large" placeholder="Select language">
                <Option value="en">English</Option>
                <Option value="es">Spanish</Option>
                <Option value="fr">French</Option>
                <Option value="de">German</Option>
                <Option value="pt">Portuguese</Option>
                <Option value="ja">Japanese</Option>
                <Option value="zh">Chinese</Option>
                <Option value="hi">Hindi</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="completes"
              label="Target Completes"
              rules={[
                { required: true, message: 'Please enter target completes' },
                { type: 'number', min: 10, max: 10000, message: 'Must be between 10-10,000' }
              ]}
            >
              <InputNumber
                size="large"
                style={{ width: '100%' }}
                placeholder="100"
                min={10}
                max={10000}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="loi_minutes"
              label="Survey Length (minutes)"
              rules={[
                { required: true, message: 'Please enter survey length' },
                { type: 'number', min: 1, max: 60, message: 'Must be between 1-60 minutes' }
              ]}
            >
              <InputNumber
                size="large"
                style={{ width: '100%' }}
                placeholder="15"
                min={1}
                max={60}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="incidence_rate"
              label="Expected Incidence (%)"
              rules={[
                { required: true, message: 'Please enter incidence rate' },
                { type: 'number', min: 1, max: 100, message: 'Must be between 1-100%' }
              ]}
            >
              <InputNumber
                size="large"
                style={{ width: '100%' }}
                placeholder="30"
                min={1}
                max={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="survey_url"
          label="Survey URL (Optional)"
          rules={[
            { type: 'url', message: 'Please enter a valid URL' }
          ]}
        >
          <Input
            size="large"
            placeholder="https://yoursurvey.qualtrics.com/..."
            addonBefore="🔗"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Project Description (Optional)"
        >
          <TextArea
            rows={3}
            placeholder="Brief description of your research objectives..."
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="field_days"
              label="Field Period (Days)"
            >
              <Select size="large" placeholder="Auto-calculate">
                <Option value={1}>1 Day (Rush)</Option>
                <Option value={3}>3 Days</Option>
                <Option value={7}>1 Week</Option>
                <Option value={14}>2 Weeks</Option>
                <Option value={30}>1 Month</Option>
                <Option value={null}>Auto-Calculate</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="priority_level"
              label="Priority Level"
            >
              <Select size="large">
                <Option value="economy">Economy (Lower cost, longer time)</Option>
                <Option value="standard">Standard (Balanced)</Option>
                <Option value="rush">Rush (Higher cost, faster delivery)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );

  const renderFeasibilityStep = () => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-6">
      <Title level={3}>Instant Feasibility & Pricing</Title>
      <p className="text-gray-600">
        Get real-time availability and pricing for your target audience
      </p>
    </div>
    
    <FeasibilityEngine
      projectData={{
        country: projectData.country || 'US',
        completes: projectData.completes || 100,
        incidence_rate: projectData.incidence_rate || 30,
        loi_minutes: projectData.loi_minutes || 15,
        demographics: projectData.demographics
      }}
      onFeasibilityUpdate={(data: FeasibilityData) => {
        setFeasibilityData(data);
        setProjectData(prev => ({
          ...prev,
          estimated_cpi: data.estimated_cpi,
          estimated_timeline: data.estimated_timeline_days
        }));
      }}
    />
  </div>
);

const renderDemographicsStep = () => (
  <div className="max-w-5xl mx-auto">
    <div className="text-center mb-6">
      <Title level={3}>Demographics & Quotas</Title>
      <p className="text-gray-600">
        Define your target audience and set up sample quotas
      </p>
    </div>
    
    <DemographicsBuilder
      initialDemographics={convertDemographicsToStringArrays(projectData.demographics)}
      onUpdate={(demographics: Record<string, string[]>) => {
        // Convert back to the ProjectCreationData demographics format
        const projectDemographics = convertStringArraysToDemographics(demographics);
        setProjectData(prev => ({ ...prev, demographics: projectDemographics }));
        // Generate quotas based on demographics
        const newQuotas = generateQuotasFromDemographics(demographics, projectData.completes || 100);
        setQuotaData(newQuotas);
      }}
      disabled={false}
    />
  </div>
);

const renderReviewStep = () => (
  <CleanProjectLaunch
    projectData={projectData as ProjectCreationData}
    feasibilityData={feasibilityData}
    quotaData={quotaData}
    onEdit={(step: number) => setCurrentStep(step)}
    onLaunch={async (launchType: 'soft' | 'full', config?: any) => {
      const finalData = { ...projectData, ...form.getFieldsValue() };
      return onComplete(finalData as ProjectCreationData);
    }}
    onSaveDraft={handleSaveDraft}
    redirectLinks={redirectLinks}
    setRedirectLinks={setRedirectLinks}
    redirectLinksValid={redirectLinksValid}
  />
);

// Add new render function for AI prompt step
const renderAIPromptStep = () => (
  <AIPromptInput
    onPromptAnalyzed={(analysis) => {
      setAiAnalysis(analysis);
      // Form population moved to useEffect
      // Track project setup progress
      analytics.trackProjectSetupProgress('ai_prompt', 20);
      setProjectData(prev => ({
        ...prev,
        name: analysis.projectName,
        country: analysis.country,
        completes: analysis.completes,
        loi_minutes: analysis.loi,
        incidence_rate: analysis.incidenceRate,
        demographics: {
          gender: analysis.audience.gender,
          age_ranges: [{ min: analysis.audience.ageRange[0], max: analysis.audience.ageRange[1] }],
          income: analysis.audience.income ? [analysis.audience.income] : undefined,
          interests: analysis.audience.interests
        }
      }));
      
      // Generate quotas based on demographics
      const demographicsForQuotas = convertDemographicsToStringArrays({
        gender: analysis.audience.gender,
        age_ranges: [{ min: analysis.audience.ageRange[0], max: analysis.audience.ageRange[1] }],
        income: analysis.audience.income ? [analysis.audience.income] : undefined,
        interests: analysis.audience.interests
      });
      const newQuotas = generateQuotasFromDemographics(demographicsForQuotas, analysis.completes || 100);
      setQuotaData(newQuotas);
      
      setCurrentStep(1); // Move to basic info step
    }}
    onSkip={() => {
      setSkipAI(true);
      setCurrentStep(1); // Skip to basic info
    }}
  />
);

// Main render logic
const renderCurrentStep = () => {
  switch (currentStep) {
    case 0:
      return renderAIPromptStep();
    case 1:
      return renderBasicInfoStep();
    case 2:
      return renderFeasibilityStep();
    case 3:
      return renderDemographicsStep();
    case 4:
      return renderReviewStep();
    default:
      return renderAIPromptStep();
  }
};

  return (
  <div className="max-w-6xl mx-auto p-6">
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onCancel} 
          size="large"
        >
          Back to Dashboard
        </Button>
        <div>
          <Title level={2} className="mb-0">Create New Project</Title>
          <p className="text-gray-600">Set up your sample collection in minutes</p>
        </div>
      </div>
      <Button 
        icon={<SaveOutlined />} 
        onClick={handleSaveDraft} 
        size="large"
      >
        Save Draft
      </Button>
    </div>

      {/* Progress Steps */}
      <Card className="mb-6">
        <Steps current={currentStep} className="mb-8">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
            />
          ))}
        </Steps>
      </Card>

      {/* Step Content */}
      <Card className="mb-6">
        {renderCurrentStep()}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        {currentStep < steps.length - 1 && (
          <>
            <Button
              size="large"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleNext}
              icon={<ArrowRightOutlined />}
            >
              Next Step
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

