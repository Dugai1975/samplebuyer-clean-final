'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { 
  Button, Card, Tabs, Typography, Modal, Tag, Progress, notification, Input, 
  Form, Select, Collapse, Switch, Checkbox, Alert, Space, Table, theme, Row, Col
} from 'antd';
import { 
  CopyOutlined, ArrowLeftOutlined, PauseCircleOutlined, BarChartOutlined, 
  EyeOutlined, PlusOutlined, DownloadOutlined, RocketOutlined, 
  CheckCircleOutlined, EditOutlined, LinkOutlined 
} from '@ant-design/icons';
// import { ProjectReviewLaunch } from '@/components/project/ProjectReviewLaunch'; // Deleted component, import commented out
// import SoftLaunchBreadcrumbs from '@/components/navigation/SoftLaunchBreadcrumbs'; // Deleted component, import commented out
// import { CleanProjectLaunch } from '@/components/project/ProjectReviewLaunch'; // Component removed
import { RedirectLinksConfig } from '@/components/project/RedirectLinksConfig';

// Chart.js registration
ChartJS.register(ArcElement, ChartTooltip, Legend);

// Define mock data for the project detail page
interface MockProject {
  id: string;
  name: string;
  description: string;
  state: string;
  total_available: number;
  count_complete: number;
  count_terminate: number;
  cpi_buyer: number;
  count_accept: number;
  count_reject: number;
  count_over_quota: number;
  buyer: {
    redirect_url: string;
    complete_link: string;
    terminate_link: string;
    quota_link: string;
    duplicate_link: string;
    quality_link: string;
    screenout_link: string;
    timeout_link: string;
  };
}

interface MockSupplier {
  id: string;
  uuid: string;
  name: string;
  quota: number;
  complete: number;
  cpi: number;
}

interface MockQuota {
  id: string;
  name: string;
  description: string;
  target: number;
  complete: number;
  failure: number;
  cpi: number;
  message: string;
}

interface MockSession {
  id: string;
  uuid?: string;
  status: string;
  duration: number;
  timestamp: string;
}

const mockProject: MockProject = {
  id: '41164167',
  name: 'Consumer Electronics Survey',
  description: 'Survey about consumer electronics preferences and buying habits',
  state: 'draft', // draft, soft_launch, active, paused, completed
  total_available: 1500,
  count_complete: 350,
  count_terminate: 120,
  cpi_buyer: 200, // in cents
  count_accept: 500,
  count_reject: 150,
  count_over_quota: 50,
  buyer: {
    redirect_url: 'https://example.com/survey/123',
    complete_link: 'https://example.com/complete?id=123',
    terminate_link: 'https://example.com/terminate?id=123',
    quota_link: 'https://example.com/quota?id=123',
    duplicate_link: 'https://example.com/duplicate?id=123',
    quality_link: 'https://example.com/quality?id=123',
    screenout_link: 'https://example.com/screenout?id=123',
    timeout_link: 'https://example.com/timeout?id=123'
  }
};

const mockSuppliers: MockSupplier[] = [
  { id: 'supplier-1', uuid: 'supplier-1', name: 'Supplier A', quota: 100, complete: 25, cpi: 1.75 },
  { id: 'supplier-2', uuid: 'supplier-2', name: 'Supplier B', quota: 100, complete: 10, cpi: 1.95 }
];

const mockQuotasData: MockQuota[] = [
  {
    id: 'quota-1',
    name: 'Group 1',
    description: 'US, natural fallout, 18-65',
    target: 200,
    complete: 14,
    failure: 82,
    cpi: 1.50,
    message: 'collecting data'
  },
  {
    id: 'quota-2',
    name: 'Group 2',
    description: 'US, natural fallout, 18-65',
    target: 200,
    complete: 0,
    failure: 2,
    cpi: 1.50,
    message: 'collecting data'
  },
  {
    id: 'quota-3',
    name: 'Group 3',
    description: 'US, natural fallout, 18-65',
    target: 200,
    complete: 21,
    failure: 15,
    cpi: 1.50,
    message: 'collecting data'
  }
];

const mockSessions: MockSession[] = [
  { id: 'session-1', uuid: 'session-1', status: 'complete', duration: 12, timestamp: '2025-06-20T10:15:30' },
  { id: 'session-2', uuid: 'session-2', status: 'terminate', duration: 5, timestamp: '2025-06-20T10:30:45' },
  { id: 'session-3', uuid: 'session-3', status: 'complete', duration: 14, timestamp: '2025-06-20T11:05:22' },
  { id: 'session-4', uuid: 'session-4', status: 'active', duration: 8, timestamp: '2025-06-20T11:45:10' },
  { id: 'session-5', uuid: 'session-5', status: 'complete', duration: 11, timestamp: '2025-06-20T12:10:33' },
  { id: 'session-6', uuid: 'session-6', status: 'terminate', duration: 3, timestamp: '2025-06-20T12:25:18' }
];

const sessionTableData = [
  { uuid: 's1', target_code: 'G1', respondent_id: 'R01', status_detail: 'complete - return', created_at: '2025-06-10T10:00:00' },
  { uuid: 's2', target_code: 'G1', respondent_id: 'R02', status_detail: 'terminate - screenout', created_at: '2025-06-11T11:30:00' }
];

const { Title, Text } = Typography;
const { Option } = Select;

// Define types for the components we're using
interface ProjectCreationData {
  name: string;
  description: string;
  completes: number;
  country: string;
  language: string;
  languages: string[];
  loi_minutes: number;
  incidence_rate: number;
  survey_id: string;
  demographics: Record<string, any>;
  priority_level: string;
}

import { FeasibilityData } from '@/types/enhanced';
// interface FeasibilityData {


interface QuotaProgress {
  id: string;
  name: string;
  description: string;
  current: number;
  target: number;
  percentage: number;
  status: "active" | "completed" | "pending" | "overdelivered";
  cpi: number;
  complete: number;
  failure: number;
  message: string;
}

export default function ViewProjectMock() {
  // Layout mode state: 'tabbed' (default) or 'split'
  const [layoutMode, setLayoutMode] = useState<'tabbed' | 'split'>('tabbed');

  // Helper for split-view: render audience sources list
  const renderAudienceSourcesList = () => (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">RIWI Primary Audience</h4>
            <p className="text-gray-600 text-sm">US, 25-54, Both genders</p>
            <div className="flex space-x-4 mt-2">
              <span className="text-sm">Status: <Tag color="green">Active</Tag></span>
              <span className="text-sm">Fielded: {project.count_complete}</span>
              <span className="text-sm">CPI: ${project.cpi_buyer ? (project.cpi_buyer / 100).toFixed(2) : '0.00'}</span>
            </div>
          </div>
          <Button size="small">Configure</Button>
        </div>
      </div>
      <Button type="dashed" block icon={<PlusOutlined />}>Add New Audience Source</Button>
    </div>
  );

  // Helper for split-view: render audience metrics
  const renderAudienceMetrics = () => (
    <div className="space-y-3">
      <div>
        <span className="text-sm text-gray-600">Conversion Rate</span>
        <div className="font-semibold">12.5%</div>
      </div>
      <div>
        <span className="text-sm text-gray-600">Quality Score</span>
        <div className="font-semibold">94/100</div>
      </div>
    </div>
  );

  // Split-view dashboard layout
  const renderSplitDashboard = () => (
    <Row gutter={24} className="min-h-screen">
      {/* Left Panel: Audience Management */}
      <Col span={10}>
        <div className="sticky top-4">
          <Card title="Audience Sources" className="mb-4">
            {renderAudienceSourcesList()}
          </Card>
          <Card title="Audience Performance" size="small">
            {renderAudienceMetrics()}
          </Card>
        </div>
      </Col>
      {/* Right Panel: Project Settings & Monitoring */}
      <Col span={14}>
        <Card title="Project Control Center">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'overview', label: 'Overview', children: renderOverview() },
              { key: 'settings', label: 'Settings', children: <div>Settings tab (to implement)</div> },
              { key: 'monitoring', label: 'Live Data', children: <div>Live Data tab (to implement)</div> }
            ]}
          />
        </Card>
      </Col>
    </Row>
  );

  const { token } = theme.useToken();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('id') ?? '';
  
  // Log the project ID to help with debugging
  useEffect(() => {
    console.log('Project ID from URL:', projectId);
    // In a real implementation, you would fetch the project data using this ID
    // For now, we'll continue using the mock data
  }, [projectId]);
  
  const [project, setProject] = useState(mockProject);
  const [suppliers] = useState(mockSuppliers);
  const [quotasData] = useState(mockQuotasData);
  const [sessionsData, setSessionsData] = useState(sessionTableData);
  const [activeTab, setActiveTab] = useState('1');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  // Define a type for the quota data
  type QuotaType = {
    name: string;
    description: string;
    cpi: number;
    complete: number;
    target: number;
    failure: number;
    message: string;
    qualifications?: Array<{id: string; response_ids: string[]}>;
  };
  
  const [detailQuota, setDetailQuota] = useState<QuotaType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [launchModalVisible, setLaunchModalVisible] = useState(false);
  const [redirectLinks, setRedirectLinks] = useState<Record<string, string>>({
    complete_link: project.buyer.complete_link || '',
    terminate_link: project.buyer.terminate_link || '',
    quota_link: project.buyer.quota_link || '',
    duplicate_link: project.buyer.duplicate_link || '',
    quality_link: project.buyer.quality_link || '',
    screenout_link: project.buyer.screenout_link || '',
    timeout_link: project.buyer.timeout_link || '',
    redirect_url: project.buyer.redirect_url || ''
  });
  const [redirectLinksValid, setRedirectLinksValid] = useState(true); // Assuming links are valid initially

  const handleOverviewRep = () => setActiveTab('1');
  
  // Launch-related functions
  const handleOpenLaunch = () => {
    setLaunchModalVisible(true);
  };
  
  const handleCloseLaunch = () => {
    setLaunchModalVisible(false);
  };
  
  const handleLaunch = async (launchType: 'soft' | 'full', launchConfig: any): Promise<void> => {
    // In a real implementation, this would call the API to launch the project
    // with the specified launch configuration
    console.log('Launching project with config:', { launchType, launchConfig });
    
    // Update project state based on launch type
    setProject(prev => ({
      ...prev,
      state: launchType === 'soft' ? 'soft_launch' : 'active'
    }));
    
    // Show success message
    notification.success({
      message: `Project ${launchType === 'soft' ? 'Soft' : 'Full'} Launch Successful`,
      description: `Your project has been ${launchType === 'soft' ? 'soft launched' : 'fully launched'} successfully.`,
      placement: 'topRight'
    });
    
    // Close the launch modal
    setLaunchModalVisible(false);
  };
  const handleSupplierClick = (id: string) => setSelectedSupplierId(id);
  const calcPercent = (value: number, total: number) => total ? Math.round((value / total) * 100) : 0;
  const showDetailModal = (quota: QuotaType) => { setDetailQuota(quota); setModalVisible(true); };
  const closeModal = () => setModalVisible(false);

  const chartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [project.count_complete + project.count_accept, Math.max(project.total_available - (project.count_complete + project.count_accept), 0)],
      backgroundColor: ['#4ADE80', '#E2E8F0'], borderWidth: 0
    }]
  };
  const chartOptions = { cutout: '70%', plugins: { legend: { display: false }, tooltip: { enabled: false } } };

  const sampleUrls = [{ code: 'G1', redirect_url: project.buyer.redirect_url + '&q=q1' }];

  // Project status badge
  const getStatusBadge = () => {
    switch(project.state) {
      case 'draft':
        return <Tag color="default">Draft</Tag>;
      case 'soft_launch':
        return <Tag color="blue">Soft Launch</Tag>;
      case 'active':
        return <Tag color="green">Active</Tag>;
      case 'paused':
        return <Tag color="orange">Paused</Tag>;
      case 'completed':
        return <Tag color="purple">Completed</Tag>;
      default:
        return <Tag color="default">{project.state}</Tag>;
    }
  };
  
  // Mock feasibility data for the project
  const feasibilityData: FeasibilityData = {
    available_respondents: 5000,
    estimated_cpi: 2.5,
    estimated_timeline_days: 5,
    confidence_level: 95,
    supplier_breakdown: [],
    // Add any other required fields from the canonical interface
  };

  const renderAudienceTab = () => (
  <Row gutter={[24, 24]}>
    <Col span={16}>
      <Card title="Active Audience Sources" className="mb-6">
        {/* List of configured audiences */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">RIWI Primary Audience</h4>
                <p className="text-gray-600 text-sm">US, 25-54, Both genders</p>
                <div className="flex space-x-4 mt-2">
                  <span className="text-sm">Status: <Tag color="green">Active</Tag></span>
                  <span className="text-sm">Fielded: {project.count_complete}</span>
                  <span className="text-sm">CPI: ${project.cpi_buyer ? (project.cpi_buyer / 100).toFixed(2) : '0.00'}</span>
                </div>
              </div>
              <Button size="small">Configure</Button>
            </div>
          </div>
        </div>
        <Button type="dashed" block className="mt-4" icon={<PlusOutlined />}>
          Add New Audience Source
        </Button>
      </Card>
    </Col>
    <Col span={8}>
      <Card title="Audience Performance" size="small">
        {/* Audience-specific metrics */}
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-600">Conversion Rate</span>
            <div className="font-semibold">12.5%</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Quality Score</span>
            <div className="font-semibold">94/100</div>
          </div>
        </div>
      </Card>
    </Col>
  </Row>
);

const renderOverview = () => {
  return (
    <div className="mt-4">
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Project Overview</h2>
          <p className="text-gray-500">Current progress and statistics</p>
          <div className="flex space-x-2 mt-2">
            {project.state === 'draft' && (
              <Button 
                type="primary" 
                size="large"
                icon={<RocketOutlined />} 
                onClick={handleOpenLaunch}
                className="bg-green-500 hover:bg-green-600"
              >
                Launch Project
              </Button>
            )}
            {project.state === 'soft_launch' && (
              <Button 
                type="primary" 
                size="large"
                icon={<RocketOutlined />} 
                onClick={handleOpenLaunch}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Full Launch
              </Button>
            )}
            {(project.state === 'active' || project.state === 'paused') && (
              <Button 
                icon={<PauseCircleOutlined />} 
                size="large"
                onClick={() => notification.info({message: 'Pause functionality would be implemented here'})}
              >
                {project.state === 'paused' ? 'Resume' : 'Pause'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm bg-blue-50">
            <p className="text-sm text-gray-500">Sample Available</p>
            <p className="text-2xl font-bold">{project.total_available}</p>
          </Card>
          <Card className="shadow-sm bg-green-50">
            <p className="text-sm text-gray-500">Completes</p>
            <p className="text-2xl font-bold">{project.count_complete}</p>
          </Card>
          <Card className="shadow-sm bg-orange-50">
            <p className="text-sm text-gray-500">Terminates</p>
            <p className="text-2xl font-bold">{project.count_terminate}</p>
          </Card>
          <Card className="shadow-sm bg-purple-50">
            <p className="text-sm text-gray-500">CPI</p>
            <p className="text-2xl font-bold">${(project.cpi_buyer / 100).toFixed(2)}</p>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm" title="Completion Progress">
            <div className="flex justify-center items-center py-4">
              <div style={{ width: '200px', height: '200px' }}>
                <Doughnut 
                  data={chartData} 
                  options={{
                    cutout: '70%',
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Target</p>
                <p className="text-xl font-bold">{project.count_complete + (project.total_available - project.count_complete - project.count_terminate)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-xl font-bold">
                  {Math.round((project.count_complete / (project.count_complete + (project.total_available - project.count_complete - project.count_terminate))) * 100)}%
                </p>
              </div>
            </div>
          </Card>
          <Card className="shadow-sm" title="Survey Links">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Survey URL</p>
                <div className="flex items-center">
                  <Input value={project.buyer.redirect_url} readOnly />
                  <Button icon={<CopyOutlined />} className="ml-2" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Complete Link</p>
                <div className="flex items-center">
                  <Input value={project.buyer.complete_link} readOnly />
                  <Button icon={<CopyOutlined />} className="ml-2" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="default" 
                  icon={<EditOutlined />}
                  onClick={handleOpenLaunch}
                >Edit</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Tabs children below: fix misplaced/stray code and props ---

  // Main component return
  return (
    <div>
      {/* Conditionally render split or tabbed dashboard */}
      {layoutMode === 'split' ? renderSplitDashboard() : (
        <div>
          <Card style={{ background: token.colorBgContainer }} className="mb-4">
            <div className='px-4'>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{project.name}</h2>
                  <p className="text-gray-500">{project.description}</p>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
                <Button onClick={handleOverviewRep}>Overview</Button>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2'>
                <div>
                  <div className="px-6 py-4 grid grid-cols-1 w-64 gap-2">
                    {suppliers.map(s => <Button key={s.uuid} className={`w-full ${selectedSupplierId===s.uuid?'bg-blue-500 text-white':''}`} onClick={()=>handleSupplierClick(s.uuid)}>{s.name}</Button>)}
                  </div>
                </div>
                <div>
                  <div className="flex flex-col items-center justify-center h-full">
                    <Button type="primary" onClick={handleOpenLaunch} icon={<RocketOutlined />}>Launch Project</Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
      <div className="mb-4">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: 'Project Overview',
              children: renderOverview()
            },
            {
              key: 'audiences',
              label: 'Audience Sources',
              children: renderAudienceTab()
            },
            {
              key: '4',
              label: 'Buyer',
              children: (
                <Card>
                  <div>Buyer tab content (to implement)</div>
                </Card>
              )
            },
            {
              key: '2',
              label: 'Respondents',
              children: (
                <>
                  <div className="text-right mb-2">
                    <Button icon={<DownloadOutlined />} size="small">Download CSV</Button>
                  </div>
                  <Table 
                    dataSource={sessionsData} 
                    rowKey="uuid" 
                    pagination={false} 
                    columns={[
                      {title:'Quota Code', dataIndex:'target_code', key:'target_code'},
                      {title:'UUID', dataIndex:'uuid', key:'uuid'},
                      {title:'Supplier RID', dataIndex:'respondent_id', key:'respondent_id'},
                      {title:'Status Detail', dataIndex:'status_detail', key:'status_detail'},
                      {title:'Date (UTC)', dataIndex:'created_at', key:'created_at'}
                    ]} 
                    scroll={{x:'max-content'}}
                  />
                </>
              )
            },
            {
              key: '6',
              label: 'Invoicing',
              children: (
                <Table 
                  dataSource={[
                    {
                      item:'Completes sent',
                      quantity:project.count_complete+project.count_accept+project.count_reject,
                      cpi:`$${(project.cpi_buyer/100).toFixed(2)}`,
                      cost:`$${((project.count_complete+project.count_accept+project.count_reject)*(project.cpi_buyer/100)).toFixed(2)}`
                    }
                  ]} 
                  rowKey="item" 
                  pagination={false} 
                  columns={[
                    {title:'Item', dataIndex:'item', key:'item'},
                    {title:'Quantity', dataIndex:'quantity', key:'quantity'},
                    {title:'CPI (Avg)', dataIndex:'cpi', key:'cpi'},
                    {title:'Revenue', dataIndex:'cost', key:'cost'},
                    {title:'Actions', key:'actions', render: () => (
                      <Button icon={<DownloadOutlined />} size="small">Download CSV</Button>
                    )}
                  ]} 
                  scroll={{x:'max-content'}}
                />
              )
            },
            {
              key: '7',
              label: 'Suppliers',
              children: (
                <div>
                  <div className="text-right mb-2">
                    <Button icon={<PlusOutlined />} size="small">Add sample provider</Button>
                  </div>
                  <Table 
                    dataSource={suppliers} 
                    rowKey="uuid" 
                    pagination={false} 
                    columns={[
                      {title:'Name', dataIndex:'name', key:'name'},
                      {title:'Quota', dataIndex:'quota', key:'quota'},
                      {title:'Completes', dataIndex:'complete', key:'complete'},
                      {title:'CPI', dataIndex:'cpi', key:'cpi', render: (c:number) => `$${c.toFixed(2)}`}
                    ]} 
                    scroll={{x:'max-content'}}
                  />
                </div>
              )
            }
          ]}
        />
        <Button icon={<ArrowLeftOutlined />} onClick={handleCloseLaunch}>Back to Project</Button>
      </div>
    </div>
  )}
      {/* Quota Details Modal */}
      <Modal title={`Details – ${detailQuota?.name}`} open={modalVisible} onCancel={closeModal} footer={null} width={700}>
        <Collapse>
          <Collapse.Panel header="Qualifications" key="1">
            {detailQuota?.qualifications?.map((q: any, i: number) => (
              <p key={i}>{q.id}: {q.response_ids.join(', ')}</p>
            ))}
          </Collapse.Panel>
        </Collapse>
      </Modal>
      
      {/* Launch Project Modal */}
      <Modal
        open={launchModalVisible}
        footer={null}
        onCancel={handleCloseLaunch}
        width="90%"
        style={{ top: 20 }}
        styles={{
          body: { padding: 0, maxHeight: 'calc(100vh - 100px)', overflow: 'auto' },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
        }}
        className="launch-review-modal"
      >
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 border-b border-blue-100 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-800">Launch Your Project</h2>
              <p className="text-sm text-gray-600">Review your project details, add survey links, and launch</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button icon={<ArrowLeftOutlined />} onClick={handleCloseLaunch}>Back to Project</Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Alert
            message="Project Launch Component"
            description="The complex project launch wizard has been removed and will be replaced with a simpler version."
            type="info"
            showIcon
          />
          <div className="mt-4 flex justify-end">
            <Button type="primary" onClick={handleCloseLaunch}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}