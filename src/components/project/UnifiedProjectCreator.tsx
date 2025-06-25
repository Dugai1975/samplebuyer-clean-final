"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Typography, message, Form, Input, Select, Alert, Tooltip, InputNumber, Slider, Tag, Skeleton, Modal } from 'antd';
import MobileFallbackModal from './MobileFallbackModal';
import MobileFullScreenDialog from './MobileFullScreenDialog';
import MobileLaunchModal from './MobileLaunchModal';
import MobileLaunchConfirmationPage from './MobileLaunchConfirmationPage';
import { ArrowLeftOutlined, SaveOutlined, RocketOutlined, InfoCircleOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import type { FeasibilityData, QuotaProgress, ProjectCreationData } from '@/types';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileFeasibilityPanel from '@/components/mobile/MobileFeasibilityPanel';
import './UnifiedProjectCreator.mobile.css';
import './UnifiedProjectCreator.sticky.css';
import './UnifiedProjectCreator.sticky-actions.css';
import MobileModalWrapper from './MobileModalWrapper';
import { apiService } from '@/services/api';
import { DemographicsBuilder } from './DemographicsBuilder';
import QuotaBuilder from './QuotaBuilder';
import CustomAudienceRequestModal from './CustomAudienceRequestModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface UnifiedProjectCreatorProps {
  onCancel: () => void;
  onComplete: (data: any) => void;
  showNavigation?: boolean;
  onFeasibilityUpdate?: (data: FeasibilityData) => void;
  initialData?: Partial<ProjectCreationData>;
}

// Local modal for project save/launch confirmation
const ProjectSaveModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onConfirm: (name: string, description: string) => void;
  defaultName: string;
  defaultDescription: string;
  loading?: boolean;
  mode: 'draft' | 'launch';
  incidenceRateTouched?: boolean;
  incidenceRateValue?: number;
}> = ({ visible, onCancel, onConfirm, defaultName, defaultDescription, loading, mode, incidenceRateTouched, incidenceRateValue }) => {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      // More comprehensive mobile detection
      const isMobileScreen = window.innerWidth < 600;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileScreen || isMobileDevice);
    };

    // Initial check
    checkMobile();

    // Add resize listener with debouncing
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };

    window.addEventListener('resize', debouncedCheck);
    window.addEventListener('orientationchange', checkMobile);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheck);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  React.useEffect(() => {
    setName(defaultName);
    setDescription(defaultDescription);
  }, [defaultName, defaultDescription, visible]);

  // Create title component for both modal versions
  const titleComponent = (
    <div className="flex items-center gap-3 py-2">
      {mode === 'launch' ? (
        <RocketOutlined className="text-blue-500 text-2xl" />
      ) : (
        <SaveOutlined className="text-blue-500 text-2xl" />
      )}
      <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium text-gray-800 truncate`}>
        {mode === 'launch' ? 'Setup Project Details' : 'Save Project as Draft'}
      </span>
    </div>
  );
  
  // Create modal content component
  const modalContent = (
    <>
      {/* Warning for untouched default incidence rate */}
      {(!incidenceRateTouched && (incidenceRateValue === 30)) && (
        <div className="flex items-start bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mb-6">
          <span className="mt-0.5 mr-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#FDE68A"/><path d="M10 6v4m0 4h.01" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div className="text-sm text-yellow-800">
            <b>Incidence Rate:</b> You are using the <b>default value (30%)</b>. This can significantly affect your project's cost and feasibility. Please review and confirm this is correct for your study.
          </div>
        </div>
      )}
      <div className="mb-6 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
        <div className="text-base font-medium text-gray-700 mb-4 flex items-center gap-2">
          <InfoCircleOutlined className="text-blue-400 text-lg" />
          <span>Project Summary</span>
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-x-8 gap-y-3 text-base`}>
          <div className="flex items-center">
            <span className="text-gray-500 mr-3 min-w-[70px] sm:min-w-[80px]">Cost:</span>
            <span className="font-medium text-gray-800">
              {name.includes('US') ? '$350.00' : name.includes('UK') ? '£280.00' : '€320.00'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-3 min-w-[70px] sm:min-w-[80px]">Time:</span>
            <span className="font-medium text-gray-800">3-5 days</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-3 min-w-[70px] sm:min-w-[80px]">Country:</span>
            <span className="font-medium text-gray-800">
              {name.includes('US') ? 'US' : name.includes('UK') ? 'UK' : 'EU'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-3 min-w-[70px] sm:min-w-[80px]">Completes:</span>
            <span className="font-medium text-gray-800">100</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-3 min-w-[70px] sm:min-w-[80px]">LOI:</span>
            <span className="font-medium text-gray-800">15 min</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-3 min-w-[70px] sm:min-w-[80px]">IR:</span>
            <span className="font-medium text-gray-800">{incidenceRateValue}%</span>
          </div>
        </div>
      </div>
      
      <Form layout="vertical" className="mt-2">
        <div className="mb-1 flex items-center">
          <span className="text-red-500 mr-1">*</span>
          <span className="text-base text-gray-700 font-medium">Project Name</span>
          <div className="ml-auto">
            <Tag color="blue" className="text-xs border-0 bg-blue-100 text-blue-500 py-0.5 px-3 font-normal rounded-full">
              Auto-generated
            </Tag>
          </div>
        </div>
        <div className="mb-6">
          <Input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            maxLength={80} 
            size="large"
            className="w-full font-medium border-gray-200 hover:border-blue-400 focus:border-blue-500 rounded-md py-2 px-3"
          />
        </div>
        <div className="flex items-center mb-1">
          <span className="text-base text-gray-700 font-medium">Project Description</span>
          <div className="ml-auto">
            <Tag color="blue" className="text-xs border-0 bg-blue-100 text-blue-500 py-0.5 px-3 font-normal rounded-full">
              Auto-generated
            </Tag>
          </div>
        </div>
        <div>
          <Input.TextArea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={3} 
            maxLength={200} 
            className="w-full text-sm border-gray-200 hover:border-blue-400 focus:border-blue-500 rounded-md"
            placeholder="Brief description of your research project"
          />
        </div>
      </Form>
    </>
  );
  
  // Render different modal based on device type
  return isMobile ? (
    <MobileFullScreenDialog
      visible={visible}
      title={titleComponent}
      onCancel={onCancel}
      onConfirm={() => onConfirm(name, description)}
      confirmText={mode === 'launch' ? 'Finalize & Launch' : 'Save Draft'}
      cancelText="Cancel"
      confirmLoading={loading}
    >
      {modalContent}
    </MobileFullScreenDialog>
  ) : (
    <Modal
      open={visible}
      title={titleComponent}
      onCancel={onCancel}
      onOk={() => onConfirm(name, description)}
      okText={mode === 'launch' ? 'Create Project' : 'Save Draft'}
      okButtonProps={{
        className: 'bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600 text-white font-medium w-full md:w-auto',
        size: 'large'
      }}
      cancelButtonProps={{
        size: 'large',
        className: 'border-gray-300 hover:border-gray-400 font-medium w-full md:w-auto'
      }}
      confirmLoading={loading}
      destroyOnHidden
      width={560}
      centered
      className="project-save-modal"
      styles={{
        body: { padding: '32px 24px' },
        content: { maxWidth: 560 },
        mask: { zIndex: 1050 },
        wrapper: { zIndex: 1051 }
      }}
      closeIcon={<CloseOutlined className="text-gray-500" />}
    >
      {modalContent}
    </Modal>
  );
};

export const UnifiedProjectCreator: React.FC<UnifiedProjectCreatorProps> = ({
  onCancel,
  onComplete,
  showNavigation = true,
  onFeasibilityUpdate,
  initialData
}) => {
  // State for Custom Audience Request Modal
  const [showCustomAudienceModal, setShowCustomAudienceModal] = useState(false);
  const [customAudienceSubmitting, setCustomAudienceSubmitting] = useState(false);

  // Project data state, hydrated from initialData if provided
  const [projectData, setProjectData] = useState<ProjectCreationData>(() => {
    // Use initialData if provided, otherwise default values
    return {
      country: initialData?.country ?? 'US',
      completes: initialData?.completes ?? 100,
      incidence_rate: initialData?.incidence_rate ?? 25,
      loi_minutes: initialData?.loi_minutes ?? 10,
      demographics: initialData?.demographics ?? {},
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      language: initialData?.language ?? 'en',
      languages: initialData?.languages ?? [],
      quotas: initialData?.quotas ?? [],
      ...initialData // allow extra/unknown props
    };
  });

  useEffect(() => {
    if (initialData) {
      setProjectData(prev => ({
        ...prev,
        ...initialData,
        country: initialData.country ?? prev.country,
        completes: initialData.completes ?? prev.completes,
        incidence_rate: initialData.incidence_rate ?? prev.incidence_rate,
        loi_minutes: initialData.loi_minutes ?? prev.loi_minutes,
        demographics: initialData.demographics ?? prev.demographics,
        name: initialData.name ?? prev.name,
        description: initialData.description ?? prev.description,
        language: initialData.language ?? prev.language,
        languages: initialData.languages ?? prev.languages,
        quotas: initialData.quotas ?? prev.quotas
      }));
    }
    // Only run on mount or when initialData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Handler for custom audience request submission
  const handleCustomAudienceSubmit = async (description: string) => {
    setCustomAudienceSubmitting(true);
    try {
      // TODO: Replace with real API call
      await new Promise(res => setTimeout(res, 800));
      // Optionally log or send to backend here
    } finally {
      setCustomAudienceSubmitting(false);
    }
  };

  const isMobile = useMediaQuery('(max-width: 899px)');
  const [form] = Form.useForm();
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showQuotas, setShowQuotas] = useState(false);
  // Modal state for save/launch
  const [saveModalVisible, setSaveModalVisible] = useState<false | 'draft' | 'launch'>(false);
  const [pendingSave, setPendingSave] = useState<null | 'draft' | 'launch'>(null);
  
  // State for mobile launch confirmation page
  const [showMobileLaunchConfirmation, setShowMobileLaunchConfirmation] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalDescription, setModalDescription] = useState("");



  const [feasibilityData, setFeasibilityData] = useState<FeasibilityData | null>(null);
  // Track if incidence rate was touched
  const [incidenceRateTouched, setIncidenceRateTouched] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quotaData, setQuotaData] = useState<QuotaProgress[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [launching, setLaunching] = useState(false);

  const [redirectLinks, setRedirectLinks] = useState<Record<string, string>>({});
  const [redirectLinksValid, setRedirectLinksValid] = useState(false);

  // Helper for margin of error
  function calculateMarginOfError(sampleSize: number): number {
    return Math.round((1.96 * Math.sqrt(0.5 * 0.5 / sampleSize)) * 1000) / 10;
  }

  function generateSmartProjectName() {
    const country = projectData.country || 'US';
    const month = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    let generatedName = `${country} Study`;
    if (projectData.demographics) {
      const gender = projectData.demographics.gender;
      const ageInfo = projectData.demographics.age_ranges;
      if (gender && gender.length === 1) {
        generatedName = `${country} ${gender[0] === 'M' ? 'Male' : 'Female'} Study`;
      }
      if (ageInfo && ageInfo.length > 0) {
        generatedName += ` (${ageInfo[0]})`;
      }
    }
    return `${generatedName} - ${month}`;
  }

  function generateSmartDescription() {
    const { country, demographics, completes, loi_minutes, incidence_rate } = projectData;
    let desc = `A survey targeting `;
    if (demographics?.gender?.length === 1) desc += demographics.gender[0] === 'M' ? 'men' : 'women';
    else desc += 'adults';
    if (demographics?.age_ranges?.length) desc += ` aged ${demographics.age_ranges.join(', ')}`;
    desc += ` in ${country || 'the US'}`;
    if (completes) desc += ` (n=${completes})`;
    if (loi_minutes) desc += `, ${loi_minutes} min`;
    if (incidence_rate) desc += `, IR ${incidence_rate}%`;
    desc += '.';
    return desc;
  }

  function handleSaveDraft() {
    setModalName(generateSmartProjectName());
    setModalDescription(generateSmartDescription());
    setSaveModalVisible('draft');
    setPendingSave('draft');
  }

  function handleLaunch() {
    setModalName(generateSmartProjectName());
    setModalDescription(generateSmartDescription());
    
    // For mobile view, show the full-page confirmation
    if (isMobile) {
      setShowMobileLaunchConfirmation(true);
      setSaveModalVisible(false);
    } else {
      // For desktop view, show the modal
      setSaveModalVisible('launch');
      setPendingSave('launch');
      setShowMobileLaunchConfirmation(false);
    }
  }

  
  // Project summary data for the mobile launch modal
  const projectSummaryData = {
    cost: projectData.country === 'US' ? '$350.00' : projectData.country === 'UK' ? '£280.00' : '€320.00',
    time: '3-5 days',
    country: projectData.country || 'US',
    completes: projectData.completes || 100,
    loi: `${projectData.loi_minutes || 15} min`,
    ir: projectData.incidence_rate || 30
  };
  
  // Debug function to help troubleshoot visibility issues
  useEffect(() => {
    if (saveModalVisible || showMobileLaunchConfirmation) {
      console.log('Modal visible:', saveModalVisible);
      console.log('Mobile confirmation page visible:', showMobileLaunchConfirmation);
      console.log('Is mobile device:', isMobile);
    }
  }, [saveModalVisible, showMobileLaunchConfirmation, isMobile]);
  
  // Handle responsive state changes when switching between desktop and mobile views
  useEffect(() => {
    // When viewport size changes between mobile and desktop
    if (isMobile && saveModalVisible) {
      // If we're on mobile but the desktop modal is showing, switch to mobile confirmation
      setSaveModalVisible(false);
      setShowMobileLaunchConfirmation(true);
    } else if (!isMobile && showMobileLaunchConfirmation) {
      // If we're on desktop but the mobile confirmation is showing, switch to desktop modal
      setShowMobileLaunchConfirmation(false);
      setSaveModalVisible('launch');
      setPendingSave('launch');
    }
  }, [isMobile]);

  async function handleModalConfirm(name: string, description: string) {
    setModalLoading(true);
    const saveData = { ...projectData, name, description };
    if (pendingSave === 'draft') {
      const drafts = JSON.parse(localStorage.getItem('projectDrafts') || '[]');
      const newDraft = { ...saveData, status: 'draft', uuid: Date.now().toString() };
      localStorage.setItem('projectDrafts', JSON.stringify([newDraft, ...drafts]));
      message.success('Draft saved!');
      setModalLoading(false);
      setSaveModalVisible(false);
      onCancel();
    } else if (pendingSave === 'launch') {
      const launched = JSON.parse(localStorage.getItem('projects') || '[]');
      const newProject = { ...saveData, status: 'active', uuid: Date.now().toString() };
      localStorage.setItem('projects', JSON.stringify([newProject, ...launched]));
      message.success('Project launched!');
      setModalLoading(false);
      setSaveModalVisible(false);
      setShowMobileLaunchConfirmation(false);
      onComplete(newProject);
    }
  }

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
        }
      }, 500);
    }
  }, [projectData]);

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

  // If mobile launch confirmation is showing, render only that (regardless of device)
  if (showMobileLaunchConfirmation) {
    return (
      <MobileLaunchConfirmationPage
        defaultName={modalName}
        defaultDescription={modalDescription}
        onCancel={() => {
          setShowMobileLaunchConfirmation(false);
        }}
        onConfirm={handleModalConfirm}
        loading={modalLoading}
        incidenceRateTouched={incidenceRateTouched}
        incidenceRateValue={projectData.incidence_rate}
        projectSummary={projectSummaryData}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 project-creator-container" style={isMobile ? { paddingBottom: '180px' } : {}}>


      <Row gutter={[24, 24]}>
        {/* Main content */}
        <Col xs={24} lg={15}>
          {/* Essential Fields - Always visible first */}
          <Card title="Step 1: Define Study Parameters" className="mb-6">
            <Form
              form={form}
              layout="vertical"
              initialValues={projectData}
              onValuesChange={(changedValues, allValues) => setProjectData(allValues)}
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
                    <div className="flex items-center space-x-2">
                      <div className="flex-grow pr-2" style={{ width: 'calc(100% - 110px)' }}>
                        <Slider
                          min={100}
                          max={1000}
                          step={50}
                          value={projectData.completes}
                          marks={{
                            100: '100',
                            400: '400',
                            700: '700',
                            1000: '1000'
                          }}
                          tooltip={{ formatter: (value) => `${value} completes` }}
                          onChange={(value) => {
                            form.setFieldsValue({ completes: value });
                            setProjectData(prev => ({ ...prev, completes: value as number }));
                          }}
                        />
                      </div>
                      <div style={{ width: '100px', flexShrink: 0 }}>
                        <InputNumber
                          style={{ width: '100%' }}
                          min={50}
                          max={10000}
                          step={50}
                          size="large"
                          value={projectData.completes}
                          onChange={(value) => setProjectData(prev => ({ ...prev, completes: value as number }))}
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    </div>
                  </Form.Item>
                  <div className="flex items-center mb-3">
                    <InfoCircleOutlined className="text-gray-400 mr-1.5" />
                    <span className="text-xs text-gray-500">
                      Current margin of error: <span className="font-medium">±{calculateMarginOfError(projectData.completes || 100)}%</span> at 95% confidence level
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Tooltip title="n=100 (±9.8%) - Quick insights and general trends">
                      <Button 
                        type={projectData.completes === 100 ? "primary" : "default"}
                        className={projectData.completes === 100 ? "bg-orange-500 hover:bg-orange-600 border-orange-500" : "border-orange-400 text-orange-500"}
                        size="small"
                        onClick={() => {
                          form.setFieldsValue({ completes: 100 });
                          setProjectData(prev => ({ ...prev, completes: 100 }));
                        }}
                      >
                        <span className="font-medium">Directional</span>
                        <span className="ml-1 opacity-80">n=100</span>
                      </Button>
                    </Tooltip>
                    <Tooltip title="n=400 (±4.9%) - Analyze 2-3 subgroups">
                      <Button 
                        type={projectData.completes === 400 ? "primary" : "default"}
                        className={projectData.completes === 400 ? "bg-blue-500 hover:bg-blue-600 border-blue-500" : "border-blue-400 text-blue-500"}
                        size="small"
                        onClick={() => {
                          form.setFieldsValue({ completes: 400 });
                          setProjectData(prev => ({ ...prev, completes: 400 }));
                        }}
                      >
                        <span className="font-medium">Base</span>
                        <span className="ml-1 opacity-80">n=400</span>
                      </Button>
                    </Tooltip>
                    <Tooltip title="n=1000 (±3.1%) - Multiple segments analysis">
                      <Button 
                        type={projectData.completes === 1000 ? "primary" : "default"}
                        className={projectData.completes === 1000 ? "bg-green-500 hover:bg-green-600 border-green-500" : "border-green-400 text-green-500"}
                        size="small"
                        onClick={() => {
                          form.setFieldsValue({ completes: 1000 });
                          setProjectData(prev => ({ ...prev, completes: 1000 }));
                        }}
                      >
                        <span className="font-medium">Advanced</span>
                        <span className="ml-1 opacity-80">n=1000</span>
                      </Button>
                    </Tooltip>
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
                          min={10}
                          max={100}
                          step={1}
                          value={projectData.incidence_rate}
                          onChange={val => {
                            setProjectData(prev => ({ ...prev, incidence_rate: val }));
                            setIncidenceRateTouched(true);
                          }}
                          onFocus={() => setIncidenceRateTouched(true)}
                          marks={{ 10: '10%', 30: '30%', 50: '50%', 70: '70%', 100: '100%' }}
                          tooltip={{ formatter: (value) => `${value}%` }}
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
                          onChange={(value) => setProjectData(prev => ({ ...prev, incidence_rate: value as number }))}
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
                            setProjectData(prev => ({ ...prev, loi_minutes: value as number }));
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
                          onChange={(value) => setProjectData(prev => ({ ...prev, loi_minutes: value as number }))}
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
          
          {/* Demographics Builder */}
          <Card title="Step 2: Define Audience & Check Feasibility" className="mb-6">
            <DemographicsBuilder
              initialDemographics={projectData.demographics || {}}
              onUpdate={(demographics) => setProjectData(prev => ({ ...prev, demographics }))}
            />
          </Card>
          
          {/* Quotas Builder - Collapsible */}
          <Card 
            title={
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowQuotas(!showQuotas)}>
                <span>Step 3: Set Quotas & Distribution (optional)</span>
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
                  setProjectData(prev => ({ ...prev, quotas }));
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
          <Col md={9} lg={9} xl={8} className="hidden md:block">
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
                  {/* Custom Audience Request Callout after failed/low feasibility */}
                  {!feasibilityData?.feasible && (
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mt-4 flex items-start">
                      <SendOutlined className="mr-2 text-blue-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800 text-sm mb-1">Can’t find your audience?</div>
                        <div className="text-xs text-blue-700 mb-2">Submit a request and our team will help you reach even the hardest-to-find respondents.</div>
                        <Button size="small" type="primary" ghost onClick={() => setShowCustomAudienceModal(true)}>
                          Request Custom Audience
                        </Button>
                      </div>
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

                {/* Project Save/Launch Modal */}
                {/* Standard Project Save Modal - Used for desktop or draft scenarios */}
                {saveModalVisible && (
                  <ProjectSaveModal
                    visible={true}
                    onCancel={() => {
                      setSaveModalVisible(false);
                      setPendingSave(null);
                    }}
                    onConfirm={handleModalConfirm}
                    defaultName={modalName}
                    defaultDescription={modalDescription}
                    loading={modalLoading}
                    mode={saveModalVisible}
                    incidenceRateTouched={incidenceRateTouched}
                    incidenceRateValue={projectData.incidence_rate}
                  />
                )}
                
                {/* Mobile Launch Confirmation Page is now rendered at the top level */}

                {/* Custom Audience Request Modal */}
                <CustomAudienceRequestModal
                  visible={showCustomAudienceModal}
                  onCancel={() => setShowCustomAudienceModal(false)}
                  onSubmit={handleCustomAudienceSubmit}
                />
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

      {/* Desktop Sticky Bottom Panel for Action Buttons */}
      {!isMobile && (
        <div className="desktop-bottom-panel">
          <div className="desktop-bottom-panel-inner">
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <button
                className="return-dashboard-link"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: '13px',
                  padding: 0,
                  marginRight: 'auto',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  lineHeight: 1.2
                }}
                onClick={onCancel}
              >
                &larr; Return to Dashboard
              </button>
            </div>
            <Button 
              icon={<SaveOutlined />} 
              onClick={handleSaveDraft} 
              size="large"
              loading={isCalculating}
              className="min-w-[120px]"
            >
              Save Draft
            </Button>
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
                    Create & Setup Project
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
                Create & Setup Project
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedProjectCreator;
