// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Progress,
  Tag,
  Typography,
  Select,
  Input,
  Tabs,
  Card,
  Collapse,
  Modal,
  Row,
  Col,
  Space,
  Alert,
  Divider,
  Dropdown,
  Menu,
  theme,
} from 'antd';
import {
  PlusOutlined,
  CopyOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  PauseCircleOutlined,
  TeamOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import { Doughnut, Line } from 'react-chartjs-2';
import StableChartContainer from '../../components/projectDetail/StableChartContainer';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
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
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
ChartJS.register(ArcElement, Tooltip, Legend);

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

const mockSuppliers = [
  { uuid: 'sup-1', name: 'Test Mock Supplier', created: '06/30/2025, 08:47:38 AM', completes: 20, pace: 3 },
  { uuid: 'sup-2', name: 'Cint', created: '06/30/2025, 10:52:41 AM', completes: 15, pace: 2 }
];

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

// --- MAIN COMPONENT ---
export default function ViewProjectMock() {
  // Initialize all state at the top level to avoid hooks order issues
  const [currentTime, setCurrentTime] = React.useState(new Date());
  
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
  const router = useRouter();

  // Project state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [selectedSource, setSelectedSource] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Survey links state (shared between project and source views)
  const [liveLink, setLiveLink] = useState('');
  const [testLink, setTestLink] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTestingLink, setIsTestingLink] = useState(false);

  const [project, setProject] = useState(() => {
    // Calculate the sum of responses from each source
    const totalCompletes = mockSuppliers.reduce((sum, source) => sum + (source.completes || 0), 0);
    return {
      ...mockProject,
      count_complete: totalCompletes, // Update count_complete to reflect the sum from all sources
    };
  });
  const [filterSupplier, setFilterSupplier] = useState(null);
  const [detailQuota, setDetailQuota] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // Tab within content area
  const [addSourceModal, setAddSourceModal] = useState(false);
  // Use sources state for dynamic addition
  const [sources, setSources] = useState(() => {
    // Map suppliers to include status and ensure completes and pace are available
    return mockSuppliers.map(supplier => ({
      ...supplier,
      status: 'active', // Default status
      completes: supplier.completes || 0,
      pace: supplier.pace || 0
    }));
  });

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
    const source = mockSuppliers.find(s => s.uuid === selectedSource);
    if (!source) return null;

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
    const source = mockSuppliers.find(s => s.uuid === selectedSource);
    if (!source) return null;
    
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
    setSelectedSource(sourceId);
    setCurrentView('source');
    if (isMobile) setSidebarOpen(false);
  };

  const showDetailModal = (quota) => {
    setDetailQuota(quota);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleAddSource = () => {
    // Logic to add a new source
    const newSource = {
      uuid: `sup-${mockSuppliers.length + 1}`,
      name: `New Source ${mockSuppliers.length + 1}`,
      created: new Date().toLocaleString(),
      status: 'active',
      completes: 0,
      pace: 0
    };
    mockSuppliers.push(newSource);
    // Force re-render
    setSelectedSource(newSource.uuid);
    setCurrentView('source');
    if (isMobile) setSidebarOpen(false);
  };

  // Chart config (preserved)
  const chartData = {
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
      {mockSuppliers.map(supplier => {
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
                  onClick={() => setSelectedSource(supplier.uuid)}
                >
                  Details
                </Button>
              </div>
              <Button 
                icon={<EyeOutlined />} 
                size="small" 
                type="text"
                onClick={() => setSelectedSource(supplier.uuid)}
              >
                View Source
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );

  {/* ===== PROJECT HEADER (GRID LAYOUT) ===== */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-center">
    {/* LEFT: Project Info */}
    <div>
      <Title level={2} className="mb-1 flex items-center gap-2">
        {project.name}
        <Button icon={<CopyOutlined />} size="small" onClick={() => copyToClipboard(project.name)} />
      </Title>
      <div className="text-gray-500 mb-2">
        <span className="font-medium">Project ID:</span> {project.uuid}
      </div>
      <div className="mb-2">Description: {project.description}</div>
    </div>
    {/* RIGHT: Chart and KPIs */}
    <div className="flex flex-col items-center gap-4">
      <div className="w-[180px] h-[180px] flex-none flex items-center justify-center">
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
      </div>
      <div className="text-center -mt-10">
        <div className="text-lg font-bold text-green-600">
          {project.total_available > 0
            ? ((project.count_complete / project.total_available) * 100).toFixed(2)
            : '0.00'} %
        </div>
        <div className="text-xs text-gray-600">Completed</div>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 mt-4 w-full">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Sample available</div>
          <div className="text-2xl font-bold">{project.total_available}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">CPI</div>
          <div className="text-2xl font-bold">${(project.cpi_buyer / 100).toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Completed</div>
          <div className="text-2xl font-bold">{project.count_complete}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Over Quotas</div>
          <div className="text-2xl font-bold">{project.count_over_quota}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Terminated</div>
          <div className="text-2xl font-bold">{project.count_terminate}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Status</div>
          <Tag color="green">Active</Tag>
        </div>
      </div>
    </div>
  </div>

  const renderBuyer = () => {
    return (
      <div>
        {mockQuotasData.map(q => {
          const url = `${project.buyer.redirect_url}&q=${q.uuid}`;
          return (
            <div key={q.uuid} className="mb-2">
              <label className="block text-sm">Code: {q.code}</label>
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

  // Helper function for project instructions tab
  const renderProjectInstructions = () => {
    return renderAllSourcesInstructions();
  };
  
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
    const source = mockSuppliers.find(s => s.uuid === selectedSource);
    if (!source) return null;

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
          ].map(returnUrl => (
            <div key={returnUrl.type} className="flex items-center gap-2">
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
    const source = mockSuppliers.find(s => s.uuid === selectedSource);
    if (!source) return null;

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
    const source = mockSuppliers.find(s => s.uuid === selectedSource);
    if (!source) return null;
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
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Active
          </span>
        );
      } else {
        return (
          <span className="flex items-center text-yellow-600 font-medium text-xs gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
            Paused
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
          <span>✔️ {source.completes ?? 0}</span>
          <span>🚀 {source.pace ?? '—'}/hr</span>
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
            <div className="text-2xl font-bold mb-2 truncate text-gray-900">{project.name}</div>
            <Tag color={project.state === 'active' ? 'green' : 'orange'} className="mb-1 px-3 py-1 rounded-full text-xs font-medium">{project.state.charAt(0).toUpperCase() + project.state.slice(1)}</Tag>
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
        <Button type="dashed" icon={<PlusOutlined />} block style={{ minHeight: 48, borderRadius: '8px' }} className="hover:border-blue-500 hover:text-blue-500 transition-colors" onClick={() => {
          // Add a new source with mock data
          const uuid = Math.random().toString(36).slice(2, 10);
          setSources(prev => [
            ...prev,
            {
              uuid,
              name: `Source ${prev.length + 1}`,
              created: new Date().toLocaleDateString(),
              status: prev.length % 2 === 0 ? 'active' : 'paused',
              completes: Math.floor(Math.random() * 100),
              pace: (Math.random() * 5).toFixed(1)
            }
          ]);
        }}>
          Add Source
        </Button>
      </div>
    </aside>
  );

  // MAIN COMPONENT RETURN
  return (
    <div className={isMobile ? "bg-gray-50 min-h-screen" : "p-4 bg-gray-50 min-h-screen"}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b sticky top-0 z-30">
          <Button
            type="text"
            icon={<span className="anticon text-gray-900"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="3" y="16" width="18" height="2" rx="1"/></svg></span>}
            onClick={() => {
              console.log('Hamburger button clicked, opening sidebar');
              setSidebarOpen(true);
            }}
            aria-label="Open sidebar menu"
            tabIndex={0}
            role="button"
            aria-pressed={sidebarOpen}
          />
          <div className="text-lg font-bold truncate text-gray-900">{project.name}</div>
          <div style={{ width: 40 }} /> {/* spacer */}
        </div>
      )}
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => {
            console.log('Overlay clicked, closing sidebar');
            setSidebarOpen(false);
          }}
          aria-hidden="true"
          role="presentation"
          tabIndex={-1}
        />
      )}
      {renderSidebar()}
      <div className={isMobile ? "mt-4" : "ml-[280px]"}>
        {/* Main content area */}
        {!selectedSource ? (
          <div className="mb-4">
            {/* Project Status Panel (always at top) */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div>
                <Title level={2} className="mb-1 flex items-center gap-2">
                  {project.name}
                  <Button icon={<CopyOutlined />} size="small" onClick={() => copyToClipboard(project.name)} />
                </Title>
                <div className="text-gray-800 mb-2">
                  <span className="font-medium text-gray-900">Project ID:</span> {project.uuid}
                </div>
                <div className="mb-2 text-gray-900 font-medium">Description: <span className="text-gray-800">{project.description}</span></div>
              </div>
              <div className="flex flex-col items-center gap-4">
  <StableChartContainer size={120}>
    <Doughnut
      data={{
        labels: ['Completed', 'Remaining'],
        datasets: [
          {
            data: [project.count_complete, project.total_available - project.count_complete],
            backgroundColor: ['#22c55e', '#e5e7eb'],
            borderWidth: 0
          }
        ]
      }}
      options={{
        cutout: '75%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }}
    />
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      width: '100%'
    }}>
      <div className="text-lg font-bold text-green-600">
        {((project.count_complete / project.total_available) * 100).toFixed(2)} %
      </div>
      <div className="text-xs text-gray-600">Completed</div>
    </div>
  </StableChartContainer>
</div>
              <div className="grid grid-cols-2 gap-4 mt-4 md:mt-0">
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-sm font-medium text-gray-700 mb-1">Sample available</div>
                  <div className="text-2xl font-bold text-gray-900">{project.total_available}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-sm font-medium text-gray-700 mb-1">CPI</div>
                  <div className="text-2xl font-bold text-gray-900">${(project.cpi_buyer / 100).toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-sm font-medium text-gray-700 mb-1">Completed</div>
                  <div className="text-2xl font-bold text-gray-900">{project.count_complete}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-sm font-medium text-gray-700 mb-1">Over Quotas</div>
                  <div className="text-2xl font-bold text-gray-900">{project.count_over_quota}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-sm font-medium text-gray-700 mb-1">Terminated</div>
                  <div className="text-2xl font-bold text-gray-900">{project.count_terminate}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-sm font-medium text-gray-700 mb-1">Status</div>
                  <Tag color="green" className="font-medium">Active</Tag>
                </div>
              </div>
            </div>
            {/* Tabs below status panel */}
            <Tabs
              defaultActiveKey="sources"
              items={[
                {
                  key: 'sources',
                  label: '📊 Sources Overview',
                  children: (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Title level={4}>Response Sources</Title>
                        <Button type="primary" icon={<PlusOutlined />} size="small">
                          Add Source
                        </Button>
                      </div>
                      {renderOverview()}
                    </div>
                  )
                },
                {
                  key: 'survey_links',
                  label: '🔗 Survey Links',
                  children: renderProjectSurveyLinks()
                },
                {
                  key: 'settings',
                  label: '⚙️ Settings',
                  children: (
                    <div className="px-4">
                      {/* Project settings content placeholder */}
                      <Alert message="Project settings coming soon..." type="info" showIcon />
                    </div>
                  )
                },
                {
                  key: 'respondents',
                  label: '👥 Respondents',
                  children: (
                    <div className="px-4">{renderRespondentsData && renderRespondentsData()}</div>
                  )
                },
                {
                  key: 'invoicing',
                  label: '💸 Invoicing',
                  children: (
                    <div className="px-4">{renderBillingInformation && renderBillingInformation()}</div>
                  )
                },
                {
                  key: 'quality',
                  label: '🛡️ Quality / Reconciliation',
                  children: (
                    <div className="px-4">
                      <Alert message="Quality and reconciliation tools coming soon..." type="info" showIcon />
                    </div>
                  )
                }
              ]}
            />
          </div>

        ) : (
          /* Source-specific Content */
          <Card style={{ background: colorBgContainer }} className="mb-4">
            <div className="px-4">
              {/* Header with back button and source info */}
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => setSelectedSource(null)}
                  size="small"
                >
                  Back to Project
                </Button>
              </div>
              
              {/* Source header with progress */}
              {(() => {
                const source = mockSuppliers.find(s => s.uuid === selectedSource);
                if (!source) return null;
                
                // Calculate source progress
                const sourceQuotas = mockQuotasData.map(q => ({
                  ...q,
                  sourceComplete: Math.floor(q.complete * 0.4) // Source-specific completes
                }));
                const totalSourceCompletes = source.completes || 0;
                const totalSourceTarget = sourceQuotas.reduce((sum, q) => sum + (q.target ? Math.floor(q.target * 0.6) : 0), 0);
                const sourceProgress = totalSourceTarget > 0 ? (totalSourceCompletes / totalSourceTarget) * 100 : 0;
                
                return (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <Title level={4} className="mb-0">{source.name}</Title>
                        <div className="text-gray-500">Source ID: {source.uuid}</div>
                      </div>
                      <Tag color={source.status === 'active' ? 'green' : 'orange'} className="text-base">
                        {source.status === 'active' ? 'Active' : 'Paused'}
                      </Tag>
                    </div>
                    
                    {/* Overall progress bar */}
                    <div className="mt-4 mb-6">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Overall Progress</span>
                        <span>{Math.floor(sourceProgress)}% Complete</span>
                      </div>
                      <Progress 
                        percent={Math.floor(sourceProgress)} 
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        size="large"
                      />
                    </div>
                    
                    {/* Source metrics */}
                    <div className="grid grid-cols-4 mb-6 gap-4">
                      <div className="p-4 rounded-lg bg-blue-50 text-center">
                        <p className="text-gray-500 text-sm">Responses</p>
                        <p className="text-2xl font-bold text-blue-600">{source.completes || 0}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 text-center">
                        <p className="text-gray-500 text-sm">Current Pace</p>
                        <p className="text-2xl font-bold text-green-600">{source.pace || 0}/hr</p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50 text-center">
                        <p className="text-gray-500 text-sm">Avg. LOI</p>
                        <p className="text-2xl font-bold text-purple-600">12.4 min</p>
                      </div>
                      <div className="p-4 rounded-lg bg-orange-50 text-center">
                        <p className="text-gray-500 text-sm">Conversion</p>
                        <p className="text-2xl font-bold text-orange-600">68%</p>
                      </div>
                    </div>
                    
                    {/* Pace/Traction Chart */}
                    <Card title="Response Trend" className="mb-4" size="small">
                      <div style={{ height: '240px', position: 'relative', padding: '10px' }}>
                        {/* Real chart.js line chart */}
                        {(() => {
                          // Use the component-level currentTime state that's updated by the top-level useEffect

                          // Generate data for the line chart
                          const projectStart = new Date(project.created_at || '2025-07-01T09:00:00');
                          const now = currentTime;
                          const msBetween = now.getTime() - projectStart.getTime();
                          const daysSinceStart = Math.max(1, Math.ceil(msBetween / (1000 * 60 * 60 * 24)));

                          // Use real timestamps for X axis
                          let pointCount = 8;
                          if (daysSinceStart > 14) {
                            pointCount = Math.min(8, Math.ceil(daysSinceStart / 7));
                          } else if (daysSinceStart > 2) {
                            pointCount = Math.min(8, daysSinceStart);
                          }
                          // Calculate evenly spaced timestamps
                          const timeStamps = [];
                          for (let i = 0; i < pointCount; i++) {
                            const t = new Date(projectStart.getTime() + (msBetween * i) / (pointCount - 1));
                            timeStamps.push(t);
                          }
                          // Format for chart labels
                          const timeLabels = timeStamps.map((t, i) => {
                            if (i === 0) return t.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            if (i === timeStamps.length - 1) return t.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            return t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          });

                          // Generate mock data
                          const attemptsData = [];
                          const completesData = [];
                          for (let i = 0; i < pointCount; i++) {
                            const baseAttempts = 5 + i * 3 + Math.floor(Math.random() * 5);
                            const baseCompletes = Math.floor(baseAttempts * (0.6 + Math.random() * 0.2));
                            attemptsData.push(baseAttempts);
                            completesData.push(baseCompletes);
                          }

                          // Calculate incidence rate (IR)
                          const expectedIR = 30; // Example fixed expected IR, can be replaced with real value
                          const totalAttempts = attemptsData.reduce((a, b) => a + b, 0);
                          const totalCompletes = completesData.reduce((a, b) => a + b, 0);
                          const realIR = totalAttempts > 0 ? ((totalCompletes / totalAttempts) * 100).toFixed(1) : '0';

                          // Chart.js data and options
                          const lineData = {
                            labels: timeLabels,
                            datasets: [
                              {
                                label: 'Attempts',
                                data: attemptsData,
                                borderColor: '#8884d8',
                                backgroundColor: 'rgba(136,132,216,0.1)',
                                pointBackgroundColor: '#8884d8',
                                tension: 0.4,
                                fill: false,
                              },
                              {
                                label: 'Completes',
                                data: completesData,
                                borderColor: '#82ca9d',
                                backgroundColor: 'rgba(130,202,157,0.1)',
                                pointBackgroundColor: '#82ca9d',
                                tension: 0.4,
                                fill: false,
                              }
                            ]
                          };
                          const lineOptions = {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                  usePointStyle: true,
                                  padding: 8,
                                }
                              },
                              tooltip: {
                                mode: 'index',
                                intersect: false
                              },
                            },
                            scales: {
                              x: {
                                title: {
                                  display: true,
                                  text: 'Time',
                                },
                                grid: { display: false },
                                type: 'category',
                                min: 0,
                                max: undefined,
                              },
                              y: {
                                title: {
                                  display: true,
                                  text: 'Responses',
                                },
                                min: undefined,
                                max: undefined,
                                ticks: {},
                                grid: { color: '#f0f0f0' },
                              },
                            },
                          };
                          return (
                            <>
                              <div className="flex gap-6 mb-2 text-xs">
                                <div className="text-gray-600">Expected IR: <span className="font-semibold text-blue-700">{expectedIR}%</span></div>
                                <div className="text-gray-600">Actual IR (Incidence Rate): <span className="font-semibold text-green-700">{realIR}%</span></div>
                              </div>
                              <Line data={lineData} options={lineOptions} height={200} />
                            </>
                          );
                        })()}
                      </div>
                    </Card>
                  </div>
                );
              })()}
              
              {/* Tabs for source details */}
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'links',
                    label: '🔗 Survey Links',
                    children: renderSourceLinks()
                  },
                  {
                    key: 'settings',
                    label: '⚙️ Settings',
                    children: renderSourceSampleProvider ? renderSourceSampleProvider() : <div>Settings content</div>
                  },
                  {
                    key: 'quotas',
                    label: '🎯 Quotas',
                    children: renderSourceQuotas()
                  }
                ]}
              />
              <Modal
                open={modalVisible}
                onCancel={closeModal}
                footer={null}
                width={isMobile ? '90vw' : 700}
              >
                <Collapse>
                  <Panel header="Qualifications" key="1">
                    {detailQuota?.qualifications?.map((q: any, i: number) => (
                      <p key={i}>
                        {q.id}: {q.response_ids.join(', ')}
                      </p>
                    ))}
                  </Panel>
                </Collapse>
              </Modal>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
