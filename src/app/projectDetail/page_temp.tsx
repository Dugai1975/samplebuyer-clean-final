// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Tag,
  Typography,
  Select,
  Card,
  Divider,
  Dropdown,
  Menu,
  theme,
  List,
  Empty,
  Spin,
  Modal,
  Input,
  Tabs,
  Statistic,
  Progress,
  Tooltip,
  DatePicker,
  Radio,
  Space,
  Badge,
  message,
  Row,
  Col,
  Alert,
  Collapse,
  Switch,
  InputNumber,
  Steps,
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  CopyOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  SettingOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DownOutlined,
  MenuOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  LoadingOutlined,
  RightOutlined,
  LeftOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  PauseCircleOutlined,
  RocketOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  UpOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  FilterOutlined,
  ShareAltOutlined,
  BellOutlined,
  StarOutlined,
  StarFilled,
  DashboardOutlined,
  LockOutlined,
  UnlockOutlined,
  WarningOutlined,
  AppstoreAddOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Doughnut, Line } from 'react-chartjs-2';
import StableChartContainer from '../../components/projectDetail/StableChartContainer';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js';
import DonutChart from '../../components/projectDetail/DonutChart';

// Suppress Ant Design React version compatibility warning
import { ConfigProvider } from 'antd';
ConfigProvider.config({
  theme: {
    // Your theme configuration
  },
  warning: false, // Disable compatibility warnings
});

// Register Chart.js elements and scales
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
ChartJS.register(ArcElement, ChartTooltip, Legend);

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;

// --- ORIGINAL DATA STRUCTURE (preserved) ---
const mockProject = {
  uuid: 'mock-project',
  name: 'Mock Project Name',
  description: 'Project description goes here.',
  total_available: 150,
  count_complete: 30,
  count_accept: 5,
  count_reject: 2,
  count_terminate: 10,
  count_over_quota: 1,
  cpi_buyer: 200,
  state: 'active',
  buyer: {
    name: 'Mock Buyer',
    complete_link: 'https://live.com/complete',
    terminate_link: 'https://live.com/terminate',
    quota_link: 'https://live.com/quota',
    duplicate_link: 'https://live.com/duplicate',
    quality_link: 'https://live.com/quality',
    screenout_link: 'https://live.com/screenout',
    timeout_link: 'https://live.com/timeout',
    redirect_url: 'https://router.com/test?pid=mock-project'
  }
};



const mockQuotasData = [
  {
    uuid: 'q1',
    name: 'Ukrsibbank users in UA',
    code: 'UA-001',
    description: 'Ukrsibbank users in UA',
    cpi: 1.00,
    target: 50,
    complete: 0,
    failure: 3,
    live_link: 'https://sample-router.sayasdf.com/router/live?t=92d5c0f0-5210-436f-bd7e-eaa4daad8441&rid={RID}',
    check_link: 'https://sample-router.sayasdf.com/router/live-check?t=92d5c0f0-5210-436f-bd7e-eaa4daad8441&rid={RID}'
  },
  {
    uuid: 'q2',
    name: 'Ukrsibbank users in UA',
    code: 'UA-002',
    description: 'Ukrsibbank users in UA',
    cpi: 1.11,
    target: 61,
    complete: 9,
    failure: 406,
    live_link: 'https://sample-router.sayasdf.com/router/live?t=6679df8c-8fe9-4f22-9708-bc5ada9b864e&rid={RID}',
    check_link: 'https://sample-router.sayasdf.com/router/live-check?t=6679df8c-8fe9-4f22-9708-bc5ada9b864e&rid={RID}'
  }
];

const mockSessions = [
  { uuid: 's1', target_code: 'UA-001', respondent_id: 'RID001', status_detail: 'complete - return', created_at: '2025-06-10T10:00:00' },
  { uuid: 's2', target_code: 'UA-002', respondent_id: 'RID002', status_detail: 'terminate - screenout', created_at: '2025-06-11T11:30:00' }
];

const calcPercent = (value, total) => total ? Math.round((value / total) * 100) : 0;

const mockReturnUrls = [
  { type: 'Complete', url: mockProject.buyer.complete_link, provider: mockProject.buyer.name },
  { type: 'Terminate', url: mockProject.buyer.terminate_link, provider: mockProject.buyer.name },
  { type: 'Over Quota', url: mockProject.buyer.quota_link, provider: mockProject.buyer.name },
  { type: 'Duplicate', url: mockProject.buyer.duplicate_link, provider: mockProject.buyer.name },
  { type: 'Quality Termination', url: mockProject.buyer.quality_link, provider: mockProject.buyer.name },
  { type: 'Screenout', url: mockProject.buyer.screenout_link, provider: mockProject.buyer.name },
  { type: 'Timeout', url: mockProject.buyer.timeout_link, provider: mockProject.buyer.name }
];

// Empty state components
const EmptyProjectState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="bg-gray-100 rounded-full p-6 mb-4">
      <BarChartOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />
    </div>
    <Typography.Title level={4}>No Project Data Available</Typography.Title>
    <Typography.Paragraph className="text-gray-500 max-w-md mb-6">
      This project hasn't been configured yet. Add project details and audiences from the feasibility tool to get started.
    </Typography.Paragraph>
    <Button type="primary" icon={<PlusOutlined />} onClick={() => window.location.href = '/create'}>
      Create Project Details
    </Button>
  </div>
);

const EmptySourcesState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="bg-gray-100 rounded-full p-6 mb-4">
      <TeamOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />
    </div>
    <Typography.Title level={4}>No Audience Sources Added</Typography.Title>
    <Typography.Paragraph className="text-gray-500 max-w-md mb-6">
      This project doesn't have any audience sources yet. Add sources to start collecting responses.
    </Typography.Paragraph>
    <Button type="primary" icon={<PlusOutlined />} onClick={() => window.dispatchEvent(new CustomEvent('openAddSourceModal'))}>
      Add Audience Source
    </Button>
  </div>
);

const EmptySourceDetailState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="bg-gray-100 rounded-full p-6 mb-4">
      <BarChartOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />
    </div>
    <Typography.Title level={4}>No Source Data Available</Typography.Title>
    <Typography.Paragraph className="text-gray-500 max-w-md mb-6">
      This source hasn't been launched yet. Once the source is active, you'll see performance metrics and response data here.
    </Typography.Paragraph>
    <div className="flex gap-3">
      <Button type="primary" icon={<PlusOutlined />}>
        Launch Source
      </Button>
      <Button icon={<EyeOutlined />}>
        View Survey Links
      </Button>
    </div>
  </div>
);

// --- Modern Add Source Modal Component with Tabs ---
const AddSourceModal = ({ visible, onCancel, onAddSource, project }) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('riwi');
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock saved audiences data
  const savedAudiences = [
    { id: 'aud1', name: 'United States', description: 'English, Male, Age: 18-35', size: 45000000, feasibility: 'High', criteria: { country: 'US', language: 'English', gender: 'Male', age: '18-35' } },
    { id: 'aud2', name: 'Germany', description: 'German, Income: 50K-80K', size: 12000000, feasibility: 'Medium', criteria: { country: 'DE', language: 'German', income: '50K-80K' } },
    { id: 'aud3', name: 'Japan', description: 'Japanese, Age: 25-45, Gender: Female', size: 8500000, feasibility: 'High', criteria: { country: 'JP', language: 'Japanese', gender: 'Female', age: '25-45' } },
    { id: 'aud4', name: 'Brazil', description: 'Portuguese, Income: 20K-50K, Education: College', size: 15000000, feasibility: 'Medium', criteria: { country: 'BR', language: 'Portuguese', income: '20K-50K', education: 'College' } },
  ];

  // Mock external sources
  const externalSources = [
    { id: 'ext1', name: 'Cint', description: 'Global panel provider with 150M+ respondents', regions: ['North America', 'Europe', 'Asia', 'Australia'], costPerInterview: '$3.50' },
    { id: 'ext2', name: 'Purespectrum', description: 'Quality-focused sample provider', regions: ['North America', 'Europe'], costPerInterview: '$4.25' },
    { id: 'ext3', name: 'Dynata', description: 'Large global panel with specialty audiences', regions: ['Global'], costPerInterview: '$5.00' },
    { id: 'ext4', name: 'Lucid', description: 'Marketplace with multiple panel sources', regions: ['North America', 'Europe', 'Asia Pacific'], costPerInterview: '$3.75' },
  ];

  // Navigate to feasibility portal with project context
  const goToFeasibilityPortal = () => {
    let url = '/feasibility';
    if (project && project.uuid) {
      // Make sure we're passing the projectId and projectName correctly
      url += `?projectId=${project.uuid}&projectName=${encodeURIComponent(project.name || 'Project')}`;
      console.log('[DEBUG] Navigating to feasibility with URL:', url);
    } else {
      console.log('[DEBUG] No project data available for navigation');
    }
    router.push(url);
    onCancel(); // Close the modal
  };

  // Handle search for new audiences
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    // Simulate API search delay
    setTimeout(() => {
      // Filter saved audiences that match the search query
      const results = savedAudiences.filter(audience => 
        audience.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audience.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  // Handle adding the selected audience as a source
  const handleAddSource = () => {
    if (selectedAudience) {
      onAddSource(selectedAudience);
      onCancel();
    }
  };

  // Get feasibility color
  const getFeasibilityColor = (feasibility) => {
    switch (feasibility) {
      case 'High': return 'success';
      case 'Medium': return 'processing';
      case 'Low': return 'warning';
      default: return 'default';
    }
  };

  // Render audience card
  const renderAudienceCard = (audience) => (
    <div 
      key={audience.id}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedAudience?.id === audience.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
      onClick={() => setSelectedAudience(audience)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium text-base">{audience.name}</div>
        <Tag color={getFeasibilityColor(audience.feasibility)}>
          {audience.feasibility}
        </Tag>
      </div>
      <div className="text-gray-600 text-sm mb-2">{audience.description}</div>
      <div className="text-gray-500 text-xs mb-3">
        {audience.size.toLocaleString()} respondents
      </div>
      <div className="flex justify-between items-center mt-2">
        <Button 
          size="small" 
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            // Use the correct URL for the feasibility interface
            let url = `/feasibility?criteria=${encodeURIComponent(JSON.stringify(audience.criteria))}`;
            if (project && project.uuid) {
              // Make sure projectId and projectName are correctly passed
              url += `&projectId=${project.uuid}&projectName=${encodeURIComponent(project.name || 'Project')}`;
              console.log('[DEBUG] Edit button - URL:', url);
              console.log('[DEBUG] Edit button - Project:', project.uuid, project.name);
            } else {
              console.log('[DEBUG] Edit button - No project data available');
            }
            router.push(url);
          }}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          type={selectedAudience?.id === audience.id ? 'primary' : 'default'}
          icon={<PlusOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAudience(audience);
          }}
        >
          {selectedAudience?.id === audience.id ? 'Selected' : 'Select'}
        </Button>
      </div>
    </div>
  );

  // Render external source card
  const renderExternalSourceCard = (source) => (
    <div 
      key={source.id}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedAudience?.id === source.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
      onClick={() => setSelectedAudience(source)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium text-base">{source.name}</div>
        <Tag color="blue">External</Tag>
      </div>
      <div className="text-gray-600 text-sm mb-2">{source.description}</div>
      <div className="text-gray-500 text-xs mb-3">
        <div>Regions: {source.regions.join(', ')}</div>
        <div>Average CPI: {source.costPerInterview}</div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <Button 
          size="small" 
          icon={<InfoCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            // Show details modal or info
          }}
        >
          Details
        </Button>
        <Button 
          size="small" 
          type={selectedAudience?.id === source.id ? 'primary' : 'default'}
          icon={<PlusOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAudience(source);
          }}
        >
          {selectedAudience?.id === source.id ? 'Selected' : 'Select'}
        </Button>
      </div>
    </div>
  );

  // Modal title with icon
  const modalTitle = (
    <div className="flex items-center">
      <TeamOutlined className="mr-2 text-blue-500" />
      <span>Select an Audience</span>
    </div>
  );

  // Display audiences based on search or all
  const displayAudiences = searchQuery.trim() ? searchResults : savedAudiences;

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        <Button 
          key="add" 
          type="primary" 
          disabled={!selectedAudience} 
          onClick={handleAddSource}
          icon={<PlusOutlined />}
        >
          {selectedTab === 'riwi' ? 'Add to Project' : 'Connect Source'}
        </Button>
      ]}
      width={isMobile ? '95%' : 800}
      centered
      styles={{ 
        body: { maxHeight: '70vh', overflowY: 'auto', padding: '16px' },
        header: { borderBottom: '1px solid #f0f0f0' },
        footer: { borderTop: '1px solid #f0f0f0' }
      }}
    >
      <Tabs
        activeKey={selectedTab}
        onChange={setSelectedTab}
        className="mb-4"
        items={[
          {
            key: 'riwi',
            label: (
              <span className="flex items-center">
                <TeamOutlined className="mr-1" />
                RIWI Audience
              </span>
            ),
            children: (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-gray-700 font-medium">
                    {isSearching ? 'Searching...' : 
                      searchQuery.trim() ? 
                        `${displayAudiences.length} result${displayAudiences.length !== 1 ? 's' : ''}` : 
                        'Saved Audiences'}
                  </div>
                  <div className="flex gap-2">
                    <Input.Search
                      placeholder="Search audiences"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onSearch={handleSearch}
                      loading={isSearching}
                      allowClear
                      style={{ width: '220px' }}
                    />
                    <Button 
                      type="primary" 
                      icon={<AppstoreAddOutlined />} 
                      onClick={goToFeasibilityPortal}
                    >
                      Feasibility Portal
                    </Button>
                  </div>
                </div>

                {isSearching ? (
                  <div className="text-center py-8">
                    <Spin size="large" />
                    <div className="mt-4 text-gray-500">Searching for audiences...</div>
                  </div>
                ) : displayAudiences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayAudiences.map(renderAudienceCard)}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Empty description="No saved audiences found" />
                    <div className="mt-4">
                      <Button type="primary" onClick={goToFeasibilityPortal}>
                        Create Audience
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'external',
            label: (
              <span className="flex items-center">
                <GlobalOutlined className="mr-1" />
                External Panels
              </span>
            ),
            children: (
              <div>
                <div className="mb-4">
                  <Alert
                    message="External Panel Sources"
                    description="Connect to third-party panel providers to access additional respondents and specialty audiences."
                    type="info"
                    showIcon
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {externalSources.map(renderExternalSourceCard)}
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

// --- MAIN COMPONENT ---
export default function ViewProjectMock() {
  // Initialize all state at the top level to avoid hooks order issues
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [project, setProject] = React.useState<any>(null);
  const [sources, setSources] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  // Load project first, then check for newSourceCriteria
  const [projectLoaded, setProjectLoaded] = React.useState(false);

  // On mount: check for newSourceCriteria in query params and add as new source if present
  // But only after project is loaded
  React.useEffect(() => {
    if (!projectLoaded || !project) {
      console.log('[DEBUG] Waiting for project to load before processing newSourceCriteria');
      return;
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const newSourceCriteria = params.get('newSourceCriteria');
      if (newSourceCriteria) {
        console.log('[DEBUG] Found newSourceCriteria in URL, processing...');
        try {
          // First try to safely decode the URI component
          let decodedCriteria;
          try {
            // Use a safer approach - first try without decoding
            decodedCriteria = newSourceCriteria;
            // Test if it's valid JSON as is
            JSON.parse(decodedCriteria);
          } catch (parseError) {
            // If not valid JSON, try decoding
            try {
              decodedCriteria = decodeURIComponent(newSourceCriteria);
            } catch (decodeError) {
              console.error('[ERROR] Failed to decode newSourceCriteria:', decodeError);
              message.error('Failed to decode audience data from URL');
              return; // Exit early
            }
          }
          
          // Now parse the JSON
          const criteria = JSON.parse(decodedCriteria);
          console.log('[DEBUG] Successfully parsed newSourceCriteria:', criteria);
          
          // Use criteria as the new audience for handleAddSource
          handleAddSource({
            id: Math.random().toString(36).slice(2, 10),
            name: criteria.name || 'Imported Audience',
            description: criteria.description || '',
            size: criteria.size || 0,
            feasibility: criteria.feasibility || 'Medium',
            criteria
          });
          
          // Remove newSourceCriteria from URL after adding
          params.delete('newSourceCriteria');
          window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
          
          // Show success message
          message.success('New audience source added successfully!');
        } catch (e) {
          console.error('[ERROR] Failed to process newSourceCriteria:', e);
          message.error('Failed to add new audience source');
        }
      }
    }
  }, [router.asPath, projectLoaded, project]); // Re-run when URL changes or project loads

  
  // Buyer survey links renderer - defined at the top to avoid initialization errors
  const renderBuyer = () => {
    if (!project || !project.buyer) {
      return <div className="text-gray-400">Loading buyer links...</div>;
    }
    return (
      <div>
        {mockQuotasData.map(q => {
          const url = `${project.buyer.redirect_url}&q=${q.uuid}`;
          return (
            <div key={q.uuid} className="mb-2">
              <label>Code: {q.code}</label>
              <Input 
                readOnly 
                value={url} 
                addonAfter={
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={() => navigator.clipboard.writeText(url)} 
                  />
                } 
              />
            </div>
          );
        })}
      </div>
    );
  };

  // On mount: load project from localStorage using id from URL
  React.useEffect(() => {
    console.log('[DEBUG] Loading project from localStorage');
    
    // --- DEMO PROJECT WITH MOCK SUPPLIERS (only if not present) ---
    const demoId = 'mock-suppliers-demo';
    const demoSources = [
      { uuid: 'sup-1', name: 'Test Mock Supplier', created: '06/30/2025, 08:47:38 AM', completes: 20, pace: 3, status: 'active' },
      { uuid: 'sup-2', name: 'Cint', created: '06/30/2025, 10:52:41 AM', completes: 15, pace: 2, status: 'paused' }
    ];
    let allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    if (!allProjects.find((p: any) => p.uuid === demoId)) {
      const demoProject = {
        uuid: demoId,
        name: 'Demo Project with Mock Suppliers',
        description: 'This is a demo project to showcase the Project Detail UI with mock suppliers.',
        created: '2025-07-09',
        sources: demoSources,
        status: 'active',
        buyer: {
          name: 'Demo Buyer',
          complete_link: 'https://live.com/complete',
          terminate_link: 'https://live.com/terminate',
          quota_link: 'https://live.com/quota',
          duplicate_link: 'https://live.com/duplicate',
          quality_link: 'https://live.com/quality',
          screenout_link: 'https://live.com/screenout',
          timeout_link: 'https://live.com/timeout',
          redirect_url: 'https://router.com/test?pid=mock-suppliers-demo'
        }
      };
      allProjects = [demoProject, ...allProjects];
      localStorage.setItem('projects', JSON.stringify(allProjects));
    }

    // --- NORMAL PROJECT LOADING ---
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    console.log('[DEBUG] Project ID from URL:', id);
    
    if (id) {
      allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const found = allProjects.find((p: any) => p.uuid === id);
      if (found) {
        console.log('[DEBUG] Project found in localStorage:', found.name);
        setProject(found);
        setSources(found.sources || []);
        // Set projectLoaded flag to true after project is loaded
        setProjectLoaded(true);
      } else {
        console.error('[ERROR] Project not found in localStorage with ID:', id);
        message.error('Project not found');
      }
    } else {
      console.warn('[WARN] No project ID provided in URL');
      message.warning('No project selected');
    }
    
    // Set loading to false after data is loaded (or attempted to load)
    setIsLoading(false);
  }, []);

  // Helper function for copying text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard:', text);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };
  
  // Set up timer for updating current time
  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  const { token: { colorBgContainer } } = theme.useToken();

  // Project state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [selectedSource, setSelectedSource] = useState(null);

  
  // Helper to check if selectedSource is valid
  const isValidSelectedSource = !!selectedSource && sources.some(s => s.uuid === selectedSource);

// Debug: Log selectedSource and sources on every render
useEffect(() => {
  console.log('[DEBUG] selectedSource:', selectedSource);
  console.log('[DEBUG] sources:', sources.map(s => ({ uuid: s.uuid, name: s.name, status: s.status })));
}, [selectedSource, sources]);
  const [isMobile, setIsMobile] = useState(false);

  // Survey links state (shared between project and source views)
  const [liveLink, setLiveLink] = useState('');
  const [testLink, setTestLink] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [activeSourceTab, setActiveSourceTab] = React.useState('overview');
  const [activeTab, setActiveTab] = React.useState('overview');
  const [launchModalVisible, setLaunchModalVisible] = React.useState(false);
  const [launchStep, setLaunchStep] = React.useState(0);
  const [launchMode, setLaunchMode] = React.useState('soft');
  const [verifiedLinks, setVerifiedLinks] = React.useState([]);
  const [addSourceModal, setAddSourceModal] = useState(false);
  // Use sources state for dynamic addition

  // Function to calculate total completes from all sources and sessions
  const getTotalCompletes = useCallback(() => {
    // Count completes from mockSessions
    const sessionCompletes = mockSessions.filter(session => 
      session.status_detail.includes('complete')
    ).length;
    
    // If we have session data, use that; otherwise fall back to source completes
    if (sessionCompletes > 0) {
      return sessionCompletes;
    } else {
      // Fall back to the source completes if no session data
      return sources.reduce((sum, source) => sum + (source.completes || 0), 0);
    }
  }, [sources]);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Touch gesture for sidebar close (mobile)
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;
    let startX = null;
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };
    const handleTouchMove = (e) => {
      if (startX !== null && e.touches[0].clientX - startX < -50) {
        setSidebarOpen(false);
        startX = null;
      }
    };
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, sidebarOpen]);


  const handleSupplierClick = (uuid) => {
    setFilterSupplier(uuid === filterSupplier ? null : uuid);
  };

  // Responsive detection and touch handling
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    // Touch handling for sidebar swipe
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    const handleTouchMove = (e) => {
      if (!isMobile) return;
      touchEndX = e.changedTouches[0].screenX;
      if (sidebarOpen && touchStartX - touchEndX > 50) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', checkMobile);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, sidebarOpen]);

  // Project-level survey links tab
  const renderProjectSurveyLinks = () => {
    // Function to test links
    const testSurveyLink = (linkType) => {
      // Get the correct link based on type
      const linkToTest = linkType === 'live' ? liveLink : testLink;
      
      setIsTestingLink(true);
      setTestResult(null);
      
      // Simulate testing the link
      setTimeout(() => {
        setIsTestingLink(false);
        // Simulate a successful test if the link contains 'sample-router'
        const isSuccess = linkToTest.includes('sample-router');
        setTestResult({
          type: linkType,
          success: isSuccess,
          message: isSuccess 
            ? `${linkType.charAt(0).toUpperCase() + linkType.slice(1)} link test successful! The survey endpoint is responding correctly.` 
            : `${linkType.charAt(0).toUpperCase() + linkType.slice(1)} link test failed. Please check the URL and try again.`
        });
      }, 1500);
    };
    
    const testLiveLink = () => testSurveyLink('live');
    const testTestLink = () => testSurveyLink('test');
    
    return (
      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Survey Links</Title>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag color="green" className="min-w-[50px] text-center">Live</Tag>
              <Input
                placeholder="Add your live survey link here (e.g., https://sample-router.example.com/router/live?t=...)"
                value={liveLink}
                onChange={(e) => setLiveLink(e.target.value)}
                className="flex-1"
                addonAfter={
                  <Button
                    type="primary"
                    size="small"
                    onClick={testLiveLink}
                    loading={isTestingLink && testResult?.type === 'live'}
                    disabled={!liveLink}
                  >
                    Test
                  </Button>
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Tag color="blue" className="min-w-[50px] text-center">Test</Tag>
              <Input
                placeholder="Add your test survey link here (e.g., https://sample-router.example.com/router/test?t=...)"
                value={testLink}
                onChange={(e) => setTestLink(e.target.value)}
                className="flex-1"
                addonAfter={
                  <Button
                    type="primary"
                    size="small"
                    onClick={testTestLink}
                    loading={isTestingLink && testResult?.type === 'test'}
                    disabled={!testLink}
                  >
                    Test
                  </Button>
                }
              />
            </div>
          </div>
          
          {testResult && (
            <Alert
              message={testResult.success ? "Test Successful" : "Test Failed"}
              description={testResult.message}
              type={testResult.success ? "success" : "error"}
              showIcon
              closable
              onClose={() => setTestResult(null)}
            />
          )}
          
          <div className="mt-4">
            <Text type="secondary">
              Add your survey links above. The {'{RID}'} placeholder in your links will be automatically 
              replaced with the respondent ID when the survey is launched.
            </Text>
          </div>
        </div>
      </div>
    );
  };

  // Source-specific rendering functions - Main implementation

  // Source-specific sample provider - delegated to main implementation

  // Source-specific rendering functions - delegated to main implementations

  // Source-specific quotas tab with audience table
  const renderSourceQuotas = () => {
    if (!isValidSelectedSource) return <EmptySourceDetailState />;
    const source = sources.find(s => s.uuid === selectedSource);
    if (!source) return <EmptySourceDetailState />;

    return (
      <div className="space-y-6">
        {/* Audience Performance for this Source */}
        <div>
          <Title level={5}>🎯 Audience Performance</Title>
          <Table
            dataSource={mockQuotasData}
            rowKey="uuid"
            pagination={false}
            columns={[
              { title: 'Audience', dataIndex: 'name', key: 'name' },
              { title: 'Code', dataIndex: 'code', key: 'code' },
              {
                title: 'Source CPI',
                dataIndex: 'cpi',
                key: 'cpi',
                render: v => `${(v * 0.9).toFixed(2)}` // Source-specific CPI
              },
              {
                title: 'Responses',
                key: 'complete',
                render: (_, r) => (
                  <div>
                    <div className="font-medium">{Math.floor(r.complete * 0.4)}/{Math.floor(r.target * 0.6)}</div>
                    <Progress percent={calcPercent(Math.floor(r.complete * 0.4), Math.floor(r.target * 0.6))} size="small" />
                  </div>
                )
              },
              {
                title: 'Terminates',
                key: 'terminate',
                render: (_, r) => (
                  <div>
                    <div className="text-sm">{Math.floor(r.failure * 0.3)}</div>
                    <Progress
                      percent={calcPercent(Math.floor(r.failure * 0.3), Math.floor(r.target * 0.6))}
                      strokeColor="#f5222d"
                      size="small"
                      showInfo={false}
                    />
                  </div>
                )
              },
              {
                title: 'Status',
                key: 'state',
                render: () => (
                  <Select defaultValue="active" style={{ width: 100 }}>
                    <Option value="active">Active</Option>
                    <Option value="paused">Paused</Option>
                  </Select>
                )
              }
            ]}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>
    );
  };

  // Source-specific survey links
  const renderSourceLinks = () => {
    if (!isValidSelectedSource) return <EmptySourceDetailState />;
    const source = sources.find(s => s.uuid === selectedSource);
    if (!source) return <EmptySourceDetailState />;
    
    return (
    <>
      <div className="space-y-3 mb-4">
        <Text strong>Source-specific Survey Links</Text>
        <Text type="secondary" className="block mb-4">
          These links are automatically generated from your project survey links with this source ID appended.
          To change the base links, go to the Survey Links tab in the project overview.
        </Text>
        
        <div className="flex items-center gap-2">
          <Tag color="green">Live</Tag>
          <Input
            readOnly
            placeholder="No project live link set yet"
            value={liveLink ? `${liveLink}&source=${source.uuid}` : ''}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Tag color="blue">Test</Tag>
          <Input
            readOnly
            placeholder="No project test link set yet"
            value={testLink ? `${testLink}&source=${source.uuid}` : ''}
            className="flex-1"
          />
        </div>
      </div>
      {renderSourceReturnURLs()}
    </>
  );
};

  // Source-specific respondents - delegated to main implementation

  // Navigation functions for sidebar
  const navigateToOverview = () => {
    setSelectedSource(null);
    setCurrentView('overview');
    if (isMobile) setSidebarOpen(false);
  };

  const navigateToSource = (sourceId) => {
    console.log('[DEBUG] Navigating to source:', sourceId);
    setSelectedSource(sourceId);
    setCurrentView('source');
    if (isMobile) setSidebarOpen(false);
  };

  const showDetailModal = (quota) => {
    setDetailQuota(quota);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  // Handler for adding a new source from the modal
  const handleAddSource = (audience) => {
    console.log('[DEBUG] handleAddSource called with:', audience);
    
    const uuid = Math.random().toString(36).slice(2, 10) + Date.now();
    const newSource = {
      uuid,
      name: audience.name || 'New Audience',
      created: new Date().toLocaleDateString(),
      status: 'active',
      completes: 0,
      attempts: 0,
      screenouts: 0,
      terminates: 0,
      quotafuls: 0,
      pace: '0.0',
      responses: 0,
      audience: {
        id: audience.id || uuid,
        size: audience.size || 100,
        feasibility: audience.feasibility || 'Medium',
        description: audience.description || ''
      }
    };
    
    console.log('[DEBUG] Created new source object:', newSource);
    
    // Update sources state with the new source
    setSources(prev => {
      // Check if source already exists to avoid duplicates
      const exists = prev.some(s => s.audience && s.audience.id === (audience.id || uuid));
      if (exists) {
        console.log('[DEBUG] Source already exists, not adding duplicate');
        return prev;
      }
      console.log('[DEBUG] Adding new source to sources state');
      return [...prev, newSource];
    });
    
    // Persist to localStorage project
    if (project && project.uuid) {
      try {
        let allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const idx = allProjects.findIndex((p) => p.uuid === project.uuid);
        
        if (idx !== -1) {
          // Make sure sources array exists
          if (!allProjects[idx].sources) {
            allProjects[idx].sources = [];
          }
          
          // Check for duplicates in localStorage
          const existsInStorage = allProjects[idx].sources.some(
            s => s.audience && s.audience.id === (audience.id || uuid)
          );
          
          if (!existsInStorage) {
            const updatedSources = [...allProjects[idx].sources, newSource];
            allProjects[idx].sources = updatedSources;
            localStorage.setItem('projects', JSON.stringify(allProjects));
            
            // Update local project state for immediate UI update
            const updatedProject = { ...allProjects[idx] };
            console.log('[DEBUG] Updating project with new source. Source count:', updatedProject.sources.length);
            setProject(updatedProject);
            
            // Show success message
            message.success(`Added audience "${newSource.name}" to project`);
          } else {
            console.log('[DEBUG] Source already exists in localStorage, not adding duplicate');
          }
        }
      } catch (error) {
        console.error('[ERROR] Failed to update localStorage:', error);
        message.error('Failed to save audience to project');
      }
    } else {
      console.error('[ERROR] No project found to add source to');
      message.error('No project found to add audience to');
    }
    
    // Close modal and update view
    setAddSourceModal(false);
    setCurrentView('overview');
    
    // Debug logging
    console.log('[DEBUG] Added new source:', newSource);
    console.log('[DEBUG] Current sources count:', sources.length + 1);
  };

  // Event listener for opening the modal from anywhere
  useEffect(() => {
    const handleOpenModal = () => setAddSourceModal(true);
    window.addEventListener('openAddSourceModal', handleOpenModal);
    // ... (rest of the code remains the same)
    
    return () => {
      window.removeEventListener('openAddSourceModal', handleOpenModal);
    };
  }, []);

  useEffect(() => {
    // Only reset if selectedSource is not null/undefined AND it's invalid
    if (selectedSource && !isValidSelectedSource) {
      console.warn('[DEBUG] Invalid selectedSource:', selectedSource, 'sources:', sources.map(s => s.uuid));
      setSelectedSource(null);
      setCurrentView('overview');
    } else if (selectedSource) {
      console.log('[DEBUG] Valid selectedSource:', selectedSource, 'currentView:', currentView);
      // Ensure currentView is 'source' when selectedSource is valid
      if (currentView !== 'source') {
        console.log('[DEBUG] Correcting currentView to source');
        setCurrentView('source');
      }
    }
  }, [sources, selectedSource, isValidSelectedSource]);

  // Chart config - moved inside a function to prevent null access
  const getChartData = () => {
    // For projects with no responses or pre-launch state
    if (!project || 
        typeof project.count_complete !== 'number' || 
        typeof project.count_accept !== 'number' || 
        typeof project.total_available !== 'number' ||
        (project.count_complete === 0 && project.count_accept === 0)) {
      return {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data: [0, 100],
          backgroundColor: ['#4ADE80', '#E2E8F0'],
          borderWidth: 0
        }]
      };
    }
  
    return {
      labels: ['Completed', 'Remaining'],
      datasets: [{
        data: [
          project.count_complete + project.count_accept,
          Math.max(project.total_available - (project.count_complete + project.count_accept), 0)
        ],
        backgroundColor: ['#4ADE80', '#E2E8F0'],
        borderWidth: 0
      }]
    };
  };
  
  const chartOptions = {
    cutout: '70%',
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };

  // --- Renderers for each tab ---
  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      {sources.length === 0 ? (
        <div className="col-span-2">
          <EmptySourcesState />
        </div>
      ) : (
        <>
          {sources.map(supplier => {
            // Calculate total completes and target for this supplier
            const totalCompletes = supplier.completes || 0;
            const totalTarget = 100; // Example target
            return (
              <Card key={supplier.uuid} className="relative">
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium text-base">{supplier.name}</div>
                    <Tag color="blue">{supplier.uuid}</Tag>
                  </div>
                  <div className="text-xs text-gray-500">{supplier.name} - Added {supplier.created}</div>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Completes: <strong>{totalCompletes}</strong> of {totalTarget}</span>
                  <span className="text-sm text-gray-500">Pace: {supplier.pace}/hr</span>
                </div>
                <Progress 
                  percent={calcPercent(totalCompletes, totalTarget)} 
                  size="small" 
                  format={() => `${Math.round(calcPercent(totalCompletes, totalTarget))}%`}
                />
                <div className="text-sm pt-2 flex justify-between">
                  <span>Status: <strong>{supplier.status || 'active'}</strong></span>
                  <span className="text-gray-500 text-xs">Last response: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <div className="flex gap-2">
                    <Button icon={<PauseCircleOutlined />} size="small">Pause</Button>
                    <Button
                      icon={<BarChartOutlined />}
                      size="small"
                      onClick={() => navigateToSource(supplier.uuid)}
                    >
                      Details
                    </Button>
                  </div>
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small" 
                    type="text"
                    onClick={() => navigateToSource(supplier.uuid)}
                   >
                     View Source
                  </Button>
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );

  {/* ===== PROJECT HEADER (GRID LAYOUT) ===== */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-center">
    {/* LEFT: Project Info */}
    <div>
  <Title level={2} className="mb-1 flex items-center gap-2">
  {project && project.name ? project.name : <span className="text-gray-400">Loading...</span>}
  {project && project.name && (
    <Button icon={<CopyOutlined />} size="small" onClick={() => copyToClipboard(project.name)} />
  )}
</Title>
<div className="text-gray-500 mb-2">
  <span className="font-medium">Project ID:</span> {project && project.uuid ? project.uuid : <span className="text-gray-400">Loading...</span>}
</div>
<div className="mb-2">Description: {project && project.description ? project.description : <span className="text-gray-400">Loading...</span>}</div>
</div>
    {/* RIGHT: Chart and KPIs */}
    <div className="flex flex-col items-center gap-4">
      <div className="w-[180px] h-[180px] flex-none flex items-center justify-center">
  {project && typeof project.count_complete === 'number' && typeof project.total_available === 'number' ? (
  <DonutChart
    data={{
      labels: ['Completed', 'Remaining'],
      datasets: [
        {
          data: [
            Math.max(project.count_complete, 0),
            Math.max(project.total_available - project.count_complete, 0)
          ],
          backgroundColor: ['#22c55e', '#e5e7eb'],
          borderWidth: 0,
        },
      ],
    }}
    size={180}
  />
) : (
  <div className="flex items-center justify-center h-full w-full"><span className="text-gray-400">Loading chart...</span></div>
)}
</div>
      <div className="text-center -mt-10">
        <div className="text-lg font-bold text-green-600">
  {project && typeof project.count_complete === 'number' && typeof project.total_available === 'number' && project.total_available > 0
  ? ((project.count_complete / project.total_available) * 100).toFixed(2)
  : '--'} %
</div>
        <div className="text-xs text-gray-600">Completed</div>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 mt-4 w-full">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Sample available</div>
          <div className="text-2xl font-bold">{project && typeof project.total_available === 'number' ? project.total_available : '--'}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">CPI</div>
          <div className="text-2xl font-bold">{project && typeof project.cpi_buyer === 'number' ? `$${(project.cpi_buyer / 100).toFixed(2)}` : '--'}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Completed</div>
          <div className="text-2xl font-bold">{project && typeof project.count_complete === 'number' ? project.count_complete : '--'}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Over Quotas</div>
          <div className="text-2xl font-bold">{project && typeof project.count_over_quota === 'number' ? project.count_over_quota : '--'}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Terminated</div>
          <div className="text-2xl font-bold">{project && typeof project.count_terminate === 'number' ? project.count_terminate : '--'}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Status</div>
          <Tag color="green">Active</Tag>
        </div>
        <div className="col-span-2">
          <Text strong className="block mb-2">Survey Links:</Text>
          {renderBuyer()}
        </div>
      </div>
    </div>
  </div>

  const renderAllSourcesInstructions = () => (
    <div>
      <Alert
        message="📋 Instructions for All Sources"
        description="This shows setup instructions and links for all your response sources. Select a specific source to manage individual settings."
        type="info"
        className="mb-4"
      />
      
      <div className="flex justify-between mb-4">
        <Text strong>Source Instructions Overview</Text>
        <Button icon={<CopyOutlined />} type="primary">Copy All Links</Button>
      </div>
      
      {mockSuppliers.map(s => (
        <div key={s.uuid}>
          <Title level={5}>Source: {s.name}</Title>
          <p className="text-sm text-gray-500 mb-4">Created: {s.created}</p>
          
          <div className="mb-4">
            <Text strong>Quick Stats:</Text>
            <Row gutter={16} className="mt-2">
              <Col span={8}>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-bold">{getTotalCompletes()}</div>
                  <div className="text-xs text-gray-500">Responses</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-bold">76%</div>
                  <div className="text-xs text-gray-500">Quality</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-bold">$1.05</div>
                  <div className="text-xs text-gray-500">Avg CPI</div>
                </div>
              </Col>
            </Row>
          </div>

          <Text strong className="block mb-2">Survey Links:</Text>
          <div className="space-y-2">
            {mockQuotasData.map(q => (
                <div key={q.uuid} className="flex items-center gap-2">
                  <Text className="w-20 text-sm">{q.code}:</Text>
                  <Input
                    size="small"
                    readOnly
                    value={`${q.live_link}&source=${s.uuid}`}
                    className="flex-1"
                  />
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(`${q.live_link}&source=${s.uuid}`)}
                  />
                </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ===== SOURCE-SPECIFIC TABS (when source selected) =====
  
  const renderSourceOverview = () => {
    if (!isValidSelectedSource) return <EmptySourceDetailState />;
    const source = sources.find(s => s.uuid === selectedSource);
    if (!source) return <EmptySourceDetailState />;
    
    // Check if source has any data (completes, pace, etc.)
    const hasData = source.completes > 0 || source.pace > 0;
    
    // Show empty state if source has no data yet
    if (!hasData) {
      return <EmptySourceDetailState />;
    }

    return (
      <div className="space-y-6">
        {/* Source Performance Overview */}
        <div>
          <Title level={5}>📊 Source Performance</Title>
          <Row gutter={16}>
            <Col span={6}>
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {source.completes || 0}
                </div>
                <div className="text-sm text-gray-600">Total Responses</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">74%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center p-4 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-600">$1.08</div>
                <div className="text-sm text-gray-600">Avg Cost</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center p-4 bg-orange-50 rounded">
                <div className="text-2xl font-bold text-orange-600">92%</div>
                <div className="text-sm text-gray-600">Quality Score</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Audience Performance for this Source */}
        <div>
          <Title level={5}>🎯 Audience Performance</Title>
          <Table
            dataSource={mockQuotasData}
            rowKey="uuid"
            pagination={false}
            columns={[
              { title: 'Audience', dataIndex: 'name', key: 'name' },
              { title: 'Code', dataIndex: 'code', key: 'code' },
              {
                title: 'Source CPI',
                dataIndex: 'cpi',
                key: 'cpi',
                render: v => `${(v * 0.9).toFixed(2)}` // Source-specific CPI
              },
              {
                title: 'Responses',
                key: 'complete',
                render: (_, r) => (
                  <div>
                    <div className="font-medium">{Math.floor(r.complete * 0.4)}/{Math.floor(r.target * 0.6)}</div>
                    <Progress percent={calcPercent(Math.floor(r.complete * 0.4), Math.floor(r.target * 0.6))} size="small" />
                  </div>
                )
              },
              {
                title: 'Terminates',
                key: 'terminate',
                render: (_, r) => (
                  <div>
                    <div className="text-sm">{Math.floor(r.failure * 0.3)}</div>
                    <Progress
                      percent={calcPercent(Math.floor(r.failure * 0.3), Math.floor(r.target * 0.6))}
                      strokeColor="#f5222d"
                      size="small"
                      showInfo={false}
                    />
                  </div>
                )
              },
              {
                title: 'Status',
                key: 'state',
                render: () => (
                  <Select defaultValue="active" style={{ width: 100 }}>
                    <Option value="active">Active</Option>
                    <Option value="paused">Paused</Option>
                  </Select>
                )
              }
            ]}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>
    );
  };

  // Helper function for project return URLs tab
  const renderReturnURLs = () => {
    // If a source is selected, show source-specific return URLs
    if (selectedSource) {
      return renderSourceReturnURLs();
    }
    
    // Otherwise show global project return URLs
    return (
      <div>
        <Title level={5}>Project Return URLs</Title>
        <Text type="secondary" className="block mb-4">
          These are the global return URLs for your project. Select a specific source to see source-specific URLs.
        </Text>
        <div className="space-y-3">
          {[
            { type: 'Complete', url: `https://client.com/complete` },
            { type: 'Terminate', url: `https://client.com/terminate` },
            { type: 'Quota Full', url: `https://client.com/quotafull` }
          ].map((returnUrl, index) => (
            <div key={index} className="flex items-center gap-2">
              <Tag color="blue">{returnUrl.type}</Tag>
              <Input
                readOnly
                value={returnUrl.url}
                className="flex-1"
                addonAfter={
                  <Button 
                    icon={<CopyOutlined />} 
                    size="small"
                    onClick={() => copyToClipboard(returnUrl.url)}
                  />
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderSourceReturnURLs = () => {
    if (!isValidSelectedSource) return <EmptySourceDetailState />;
    const source = sources.find(s => s.uuid === selectedSource);
    if (!source) return <EmptySourceDetailState />;

    // Source-specific return URLs
    const sourceReturnUrls = [
      { type: 'Complete', url: `https://client.com/complete?source=${selectedSource}`, provider: source.name },
      { type: 'Terminate', url: `https://client.com/terminate?source=${selectedSource}`, provider: source.name },
      { type: 'Over Quota', url: `https://client.com/quota?source=${selectedSource}`, provider: source.name },
      { type: 'Duplicate', url: `https://client.com/duplicate?source=${selectedSource}`, provider: source.name },
      { type: 'Quality Termination', url: `https://client.com/quality?source=${selectedSource}`, provider: source.name },
      { type: 'Screenout', url: `https://client.com/screenout?source=${selectedSource}`, provider: source.name },
      { type: 'Timeout', url: `https://client.com/timeout?source=${selectedSource}`, provider: source.name }
    ];

    return (
      <div>
        <Title level={5}>Return URLs for {source.name}</Title>
        <Text type="secondary" className="block mb-4">
          These URLs are specific to this response source. Configure where respondents should be redirected after completing the survey.
        </Text>
        
        <div className="space-y-3">
          {sourceReturnUrls.map(returnUrl => (
            <div key={returnUrl.type}>
              <label className="block text-sm font-medium mb-1">{returnUrl.type}</label>
              <Input
                defaultValue={returnUrl.url}
                addonAfter={
                  <Button 
                    icon={<CopyOutlined />} 
                    size="small"
                    onClick={() => copyToClipboard(returnUrl.url)}
                  />
                }
              />
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <Text className="text-sm">
            <strong>Note:</strong> These return URLs include the source parameter ({selectedSource}) to track responses from this specific source.
          </Text>
        </div>
      </div>
    );
  };

  // Helper function for respondents tab
  const renderRespondentsData = () => {
    return (
      <div>
        <Title level={5}>Respondent Data</Title>
        <Text type="secondary" className="block mb-4">
          View and manage respondent data for this project.
        </Text>
        <Table
          rowKey="id"
          dataSource={[
            { id: '1001', source: 'Panel A', status: 'Complete', date: '2023-06-15', time: '12m 30s' },
            { id: '1002', source: 'Panel B', status: 'Screened', date: '2023-06-15', time: '5m 12s' },
            { id: '1003', source: 'Panel A', status: 'Complete', date: '2023-06-14', time: '14m 45s' },
            { id: '1004', source: 'Panel C', status: 'Terminated', date: '2023-06-14', time: '8m 20s' },
            { id: '1005', source: 'Panel B', status: 'Complete', date: '2023-06-13', time: '11m 55s' }
          ]}
          columns={[
            { title: 'Respondent ID', dataIndex: 'id', key: 'id' },
            { title: 'Source', dataIndex: 'source', key: 'source' },
            { 
              title: 'Status', 
              dataIndex: 'status', 
              key: 'status',
              render: (status) => {
                let color = 'green';
                if (status === 'Screened') color = 'orange';
                if (status === 'Terminated') color = 'red';
                return <Tag color={color}>{status}</Tag>;
              }
            },
            { title: 'Date', dataIndex: 'date', key: 'date' },
            { title: 'Time Taken', dataIndex: 'time', key: 'time' },
            {
              title: 'Actions',
              key: 'actions',
              render: () => (
                <Space>
                  <Button size="small" icon={<EyeOutlined />}>View</Button>
                  <Button size="small" icon={<DownloadOutlined />}>Export</Button>
                </Space>
              )
            }
          ]}
          pagination={{ pageSize: 5 }}
        />
      </div>
    );
  };
  
  // Helper function for invoicing tab
  const renderBillingInformation = () => {
    return (
      <div>
        <Title level={5}>Billing Information</Title>
        <Table
          rowKey="id"
          dataSource={[
            { id: 'INV001', date: '2023-06-15', amount: 100.00, status: 'Paid', source: 'Panel A' },
            { id: 'INV002', date: '2023-06-14', amount: 50.00, status: 'Pending', source: 'Panel B' },
            { id: 'INV003', date: '2023-06-13', amount: 200.00, status: 'Paid', source: 'Panel C' }
          ]}
          columns={[
            { title: 'Invoice ID', dataIndex: 'id', key: 'id' },
            { title: 'Date', dataIndex: 'date', key: 'date' },
            { title: 'Amount', dataIndex: 'amount', key: 'amount' },
            { 
              title: 'Status', 
              dataIndex: 'status', 
              key: 'status',
              render: (status) => {
                const color = status === 'Paid' ? 'green' : 'orange';
                return <Tag color={color}>{status}</Tag>;
              }
            },
            { title: 'Source', dataIndex: 'source', key: 'source' },
            {
              title: 'Actions',
              key: 'actions',
              render: () => (
                <Space>
                  <Button size="small" icon={<FilePdfOutlined />}>PDF</Button>
                  <Button size="small" icon={<PrinterOutlined />}>Print</Button>
                </Space>
              )
            }
          ]}
          pagination={{ pageSize: 5 }}
        />
      </div>
    );
  };
  
  const renderSourceSampleProvider = () => {
    if (!isValidSelectedSource) return <EmptySourceDetailState />;
    const source = sources.find(s => s.uuid === selectedSource);
    if (!source) return <EmptySourceDetailState />;
    return (
      <Row gutter={16}>
        <Col span={12}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Source Status</label>
              <Select defaultValue="active" style={{ width: '100%' }}>
                <Option value="active">Active</Option>
                <Option value="paused">Paused</Option>
                <Option value="stopped">Stopped</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Daily Response Limit</label>
              <Input type="number" defaultValue="100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority Level</label>
              <Select defaultValue="normal" style={{ width: '100%' }}>
                <Option value="high">High Priority</Option>
                <Option value="normal">Normal Priority</Option>
                <Option value="low">Low Priority</Option>
              </Select>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div>
            <label className="block text-sm font-medium mb-2">Quality Controls</label>
            <Space direction="vertical">
              <label>
                <input type="checkbox" className="mr-2" defaultChecked />
                Block duplicate responses
              </label>
              <label>
                <input type="checkbox" className="mr-2" defaultChecked />
                Enable speeder detection ({'<'} 50% median time)
              </label>
              <label>
                <input type="checkbox" className="mr-2" />
                Require email verification
              </label>
              <label>
                <input type="checkbox" className="mr-2" defaultChecked />
                Enable attention checks
              </label>
            </Space>
          </div>
        </Col>
      </Row>
    );
  };

  // --- SidebarSourceItem ---
  const SidebarSourceItem = ({ source, active, onClick }) => {
    // Choose status indicator based on source status
    const getStatusIndicator = () => {
      if (source.status === 'active') {
        return (
          <span className="flex items-center text-green-600 font-medium text-xs gap-1">
            <span key="indicator-dot" className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            <span key="indicator-text">Active</span>
          </span>
        );
      } else {
        return (
          <span className="flex items-center text-yellow-600 font-medium text-xs gap-1">
            <span key="indicator-dot" className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
            <span key="indicator-text">Paused</span>
          </span>
        );
      }
    };
    
    return (
      <div
        className={`flex flex-col px-3 py-2 rounded-lg cursor-pointer mb-1 transition-all duration-200 \
          ${active ? 'bg-blue-100 border-l-4 border-blue-600 text-blue-800 font-bold shadow-sm' : 'hover:bg-blue-50'} \
        `}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        onClick={onClick}
        tabIndex={0}
        role="button"
        aria-pressed={active}
        aria-label={`Source ${source.name}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <span className="truncate text-base leading-tight text-gray-900">{source.name}</span>
          {getStatusIndicator()}
        </div>
        <div className="flex gap-4 text-xs text-gray-600 font-medium mt-1.5">
          <span key="completes">✔️ {source.completes !== undefined ? source.completes : 0}</span>
          <span key="pace">🚀 {source.pace || '0.0'}/hr</span>
        </div>
      </div>
    );
  };

  // --- Sidebar Renderer ---
  const renderSidebar = () => (
    <aside
      className={
        `fixed left-0 top-0 h-full bg-white border-r border-gray-100 shadow-lg flex flex-col justify-between z-50
        transition-transform duration-300
        ${isMobile ? (sidebarOpen ? 'translate-x-0 w-full max-w-[100vw]' : '-translate-x-full') : 'translate-x-0 w-[280px]'}
        `
      }
      style={{ willChange: 'transform', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
      role="dialog"
      aria-modal={isMobile ? 'true' : undefined}
      aria-label="Sidebar navigation"
    >
      {/* Sidebar content starts here */}
      <div>
        <div className="px-6 pt-8 pb-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold mb-2 truncate text-gray-900">{project?.name || 'Untitled Project'}</div>
            <Tag color={project?.state === 'active' ? 'green' : 'orange'} className="mb-1 px-3 py-1 rounded-full text-xs font-medium">
              {project?.state ? project.state.charAt(0).toUpperCase() + project.state.slice(1) : 'Unknown'}
            </Tag>
          </div>
          {isMobile && (
            <Button
              shape="circle"
              icon={<ArrowLeftOutlined />}
              size="small"
              onClick={() => setSidebarOpen(false)}
              className="ml-2"
              style={{ minWidth: 36, minHeight: 36 }}
              aria-label="Close sidebar"
              tabIndex={0}
              role="button"
              aria-pressed="false"
            />
          )}
        </div>
        {/* Project Section */}
        <div className="px-6 pt-6">
          <div className="text-xs text-gray-700 uppercase tracking-widest font-bold mb-3 mt-2">Project</div>
          <div
            className={`flex items-center gap-3 px-4 min-h-[48px] rounded-lg cursor-pointer mb-2 transition-all duration-200 \
              ${currentView === 'overview' ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-800 font-bold shadow-sm' : 'hover:bg-gray-50'}
            `}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onClick={() => {
              navigateToOverview();
              if (isMobile) setSidebarOpen(false);
            }}
            tabIndex={0}
            role="button"
            aria-pressed={currentView === 'overview'}
            aria-label="Project overview"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigateToOverview();
                if (isMobile) setSidebarOpen(false);
              }
            }}
          >
            <span className="flex items-center justify-center text-blue-600 bg-blue-100 rounded-full w-9 h-9">
              <BarChartOutlined style={{ fontSize: '18px' }} />
            </span>
            <span className="truncate text-base leading-tight text-gray-900">Overview</span>
          </div> 
        </div>
        {/* Response Sources Section */}
        <div className="px-6 pt-4">
          <div className="text-xs text-gray-700 uppercase tracking-widest font-bold mb-3 mt-6">Response Sources</div>
          {/* Scrollable source list */}
          <div className="max-h-[calc(100vh-380px)] overflow-y-auto pr-1 custom-scrollbar">
            {sources.map(s => (
              <SidebarSourceItem
                key={s.uuid}
                source={s}
                active={selectedSource === s.uuid}
                onClick={() => {
                  navigateToSource(s.uuid);
                  if (isMobile) setSidebarOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Bottom: Add Source Button */}
      <div className="px-6 pb-8 mt-4">
        <Button type="dashed" icon={<PlusOutlined />} block style={{ minHeight: 48, borderRadius: '8px' }} className="hover:border-blue-500 hover:text-blue-500 transition-colors" onClick={() => setAddSourceModal(true)}>
          Add Source
        </Button>
      </div>
    </aside>
  );

  // State for tab navigation
  // activeTab is already declared at the top level
  // launchModalVisible is already declared at the top level
  // launchStep is already declared at the top level
  // Adding launch type state for the launch modal workflow
