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
  message,
  Form,
  InputNumber,
  Statistic,
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
import { Line } from 'react-chartjs-2';
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
import DonutChart from './DonutChart';

// Define types for our component props and data
interface ProjectData {
  uuid: string;
  name: string;
  description: string;
  total_available: number;
  count_complete: number;
  count_accept?: number;
  count_reject?: number;
  count_terminate?: number;
  count_over_quota?: number;
  cpi_buyer?: number;
  state?: string;
  buyer?: {
    name: string;
    complete_link?: string;
    terminate_link?: string;
    quota_link?: string;
    duplicate_link?: string;
    quality_link?: string;
    screenout_link?: string;
    timeout_link?: string;
    redirect_url?: string;
  };
}

interface SourceData {
  uuid: string;
  name: string;
  status?: string;
  completes?: number;
  target?: number;
  pace?: number;
  created: string;
  lastResponse?: string;
}

interface QuotaData {
  uuid: string;
  name: string;
  code: string;
  description: string;
  cpi: number;
  target: number;
  complete: number;
  failure: number;
  live_link?: string;
  check_link?: string;
  qualifications?: Array<{id: string, response_ids: string[]}>;
}

// DonutChart props interface is imported from the DonutChart component
// This is just a reference for our usage
interface DonutChartReference {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
    }>;
  };
  options?: any;
  size?: number;
}

// Register Chart.js elements and scales
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

// Mock data for demonstration
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

const ProjectDetailView = ({ projectData, feasibilityData, sources: providedSources = [] }: { projectData?: ProjectData, feasibilityData?: any, sources?: SourceData[] }) => {
  const router = useRouter();
  
  // Default project data if not provided
  const project = projectData || mockProject;
  
  // Use mock sources if none provided
  const mockSuppliers = [
    { uuid: 'sup-1', name: 'Test Mock Supplier', created: '06/30/2025, 08:47:38 AM', completes: 20, pace: 3, status: 'active', target: 100, lastResponse: '07/09/2025, 10:15:22 AM' },
    { uuid: 'sup-2', name: 'Cint', created: '06/30/2025, 10:52:41 AM', completes: 15, pace: 2, status: 'active', target: 100, lastResponse: '07/09/2025, 08:30:45 AM' }
  ];
  
  const sources = providedSources.length > 0 ? providedSources : mockSuppliers;
  
  // State variables
  const [currentView, setCurrentView] = useState<'overview' | 'source'>('overview');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [filterSupplier, setFilterSupplier] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailQuota, setDetailQuota] = useState<QuotaData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('links');
  
  // Calculate percentage helper
  const calcPercent = (value: number, total: number): number => {
    if (!total) return 0;
    return (value / total) * 100;
  };

  // Check if on mobile device
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  // Handle window resize
  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);
  
  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  useEffect(() => {
    if (touchStart - touchEnd > 100) {
      // Swipe left - close sidebar
      setSidebarOpen(false);
    }
    if (touchStart - touchEnd < -100) {
      // Swipe right - open sidebar
      setSidebarOpen(true);
    }
  }, [touchEnd, touchStart]);

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  };

  // Navigation functions
  const navigateToOverview = () => {
    setCurrentView('overview');
    setSelectedSource(null);
  };

  const navigateToSource = (sourceId: string) => {
    setSelectedSource(sourceId);
    setCurrentView('source');
    if (isMobile) setSidebarOpen(false);
  };

  const handleSupplierClick = (uuid: string) => {
    setFilterSupplier(uuid === filterSupplier ? null : uuid);
  };

  const handleAddSource = () => {
    // Implementation for adding a new source
    Modal.confirm({
      title: 'Add New Source',
      content: (
        <div>
          <p>Would you like to add a new source to this project?</p>
          <p>This will create a new survey link for a new supplier.</p>
        </div>
      ),
      onOk() {
        message.success('New source added successfully!');
      }
    });
  };

  const showModal = (quota: QuotaData) => {
    setDetailQuota(quota);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  // --- Renderers for each tab ---
  // Render the overview tab
  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      {sources.map(supplier => {
        const totalCompletes = supplier.completes || 0;
        const totalTarget = supplier.target || 100; // Example target
        
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
    </div>
  );

  // Project-level survey links tab
  const renderProjectSurveyLinks = () => {
    // Function to test links
    const testSurveyLink = (linkType: string) => {
      const url = project.buyer?.[linkType as keyof typeof project.buyer];
      if (url && typeof url === 'string') {
        window.open(url, '_blank');
      }
    };
    
    const testLiveLink = () => testSurveyLink('redirect_url');
    const testTestLink = () => testSurveyLink('redirect_url');

    const returnUrls = [
      { type: 'Complete', url: project.buyer?.complete_link, provider: project.buyer?.name },
      { type: 'Terminate', url: project.buyer?.terminate_link, provider: project.buyer?.name },
      { type: 'Over Quota', url: project.buyer?.quota_link, provider: project.buyer?.name },
      { type: 'Duplicate', url: project.buyer?.duplicate_link, provider: project.buyer?.name },
      { type: 'Quality', url: project.buyer?.quality_link, provider: project.buyer?.name },
      { type: 'Screenout', url: project.buyer?.screenout_link, provider: project.buyer?.name },
      { type: 'Timeout', url: project.buyer?.timeout_link, provider: project.buyer?.name }
    ];

    return (
      <div className="p-4">
        <Card title="Survey Links" className="mb-6">
          <div className="mb-4">
            <div className="mb-2">
              <Text strong>Live Link:</Text>
              <div className="flex items-center mt-1">
                <Input 
                  value={project.buyer?.redirect_url || 'https://example.com/survey'} 
                  readOnly 
                  className="mr-2" 
                />
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => copyToClipboard(project.buyer?.redirect_url || 'https://example.com/survey')}
                >
                  Copy
                </Button>
                <Button 
                  type="primary" 
                  className="ml-2" 
                  onClick={testLiveLink}
                >
                  Test
                </Button>
              </div>
            </div>
            
            <div>
              <Text strong>Test Link:</Text>
              <div className="flex items-center mt-1">
                <Input 
                  value={`${project.buyer?.redirect_url || 'https://example.com/survey'}&test=1`} 
                  readOnly 
                  className="mr-2" 
                />
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => copyToClipboard(`${project.buyer?.redirect_url || 'https://example.com/survey'}&test=1`)}
                >
                  Copy
                </Button>
                <Button 
                  type="primary" 
                  className="ml-2" 
                  onClick={testTestLink}
                >
                  Test
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Return URLs" className="mb-6">
          <Table 
            dataSource={returnUrls}
            pagination={false}
            rowKey="type"
            columns={[
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                width: 120
              },
              {
                title: 'URL',
                dataIndex: 'url',
                key: 'url',
                render: (url) => (
                  <div className="flex items-center">
                    <Input value={url || ''} readOnly className="mr-2" />
                    <Button 
                      icon={<CopyOutlined />} 
                      onClick={() => copyToClipboard(url || '')}
                    >
                      Copy
                    </Button>
                    <Button 
                      type="primary" 
                      className="ml-2" 
                      onClick={() => testSurveyLink(url?.split('/').pop() || '')}
                    >
                      Test
                    </Button>
                  </div>
                )
              }
            ]}
          />
        </Card>
      </div>
    );
  };

  // Source-specific quotas tab with audience table
  const renderSourceQuotas = () => {
    const quotas = mockQuotasData;

    const columns = [
      {
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
        width: 100
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: 'Target',
        dataIndex: 'target',
        key: 'target',
        width: 80,
        render: (_: any, r: any) => (
          <div>
            <InputNumber 
              min={1} 
              defaultValue={r.target} 
              style={{ width: 70 }} 
            />
          </div>
        )
      },
      {
        title: 'CPI',
        dataIndex: 'cpi',
        key: 'cpi',
        width: 80,
        render: (_: any, r: any) => (
          <div>
            <InputNumber 
              min={0} 
              step={0.01} 
              precision={2}
              defaultValue={r.cpi} 
              style={{ width: 70 }} 
              formatter={(value: number | undefined) => `$${value || 0}`}
              parser={(value: string | undefined) => value?.replace('$', '') ? parseFloat(value.replace('$', '')) : 0}
            />
          </div>
        )
      },
      {
        title: 'Progress',
        key: 'progress',
        width: 200,
        render: () => (
          <div>
            <Progress 
              percent={30} 
              size="small" 
              format={() => '30%'}
            />
          </div>
        )
      }
    ];

    return (
      <div className="p-4">
        <Card title="Audience Quotas">
          <Table 
            dataSource={quotas}
            columns={columns}
            rowKey="uuid"
            pagination={false}
            onRow={(record) => ({
              onClick: () => showModal(record)
            })}
          />
        </Card>
      </div>
    );
  };

  // Source-specific survey links
  const renderSourceLinks = () => {
    const selectedSourceData = sources.find(s => s.uuid === selectedSource);
    if (!selectedSourceData) return <div>Source not found</div>;

    return (
      <div className="p-4">
        <Card title="Survey Links">
          <div className="mb-4">
            <div className="mb-2">
              <Text strong>Live Link:</Text>
              <div className="flex items-center mt-1">
                <Input 
                  value={`https://sample-router.sayasdf.com/router/live?source=${selectedSourceData.uuid}`} 
                  readOnly 
                  className="mr-2" 
                />
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => copyToClipboard(`https://sample-router.sayasdf.com/router/live?source=${selectedSourceData.uuid}`)}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div>
              <Text strong>Test Link:</Text>
              <div className="flex items-center mt-1">
                <Input 
                  value={`https://sample-router.sayasdf.com/router/test?source=${selectedSourceData.uuid}`} 
                  readOnly 
                  className="mr-2" 
                />
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => copyToClipboard(`https://sample-router.sayasdf.com/router/test?source=${selectedSourceData.uuid}`)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // This navigateToOverview function is already defined above

  // Render source detail view
  const renderSourceDetail = () => {
    const selectedSourceData = sources.find(s => s.uuid === selectedSource);
    if (!selectedSourceData) return <div>Source not found</div>;
    
    // Source-specific overview tab
    const renderSourceOverview = () => {
      // Prepare data for donut chart
      const donutData = {
        labels: ['Complete', 'Terminate', 'Quota Full', 'Quality'],
        datasets: [
          {
            data: [65, 20, 10, 5],
            backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#F44336'],
            borderWidth: 0,
          },
        ],
      };

      return (
        <div>
          <Card className="mb-6">
            <Row gutter={[16, 16]}>
              <Col span={24} md={12}>
                <div>
                  <Title level={5}>Source Performance</Title>
                  <div className="flex justify-between items-center mb-2">
                    <span>Completes: <strong>{selectedSourceData.completes || 0}</strong> of {selectedSourceData.target || 100}</span>
                  </div>
                  <Progress 
                    percent={calcPercent(selectedSourceData.completes || 0, selectedSourceData.target || 100)} 
                    size="small" 
                  />
                </div>
              </Col>
              <Col span={24} md={12} className="flex justify-center">
                <DonutChart data={donutData} />
              </Col>
            </Row>
          </Card>
          
          <Card title="Key Metrics" className="mb-6">
            <Row gutter={16}>
              <Col span={12} md={6}>
                <Card size="small">
                  <Statistic 
                    title="Completes" 
                    value={selectedSourceData.completes || 0} 
                    suffix={`/ ${selectedSourceData.target || 100}`} 
                  />
                </Card>
              </Col>
              <Col span={12} md={6}>
                <Card size="small">
                  <Statistic 
                    title="Conversion" 
                    value={calcPercent(selectedSourceData.completes || 0, selectedSourceData.target || 100)} 
                    suffix="%" 
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={12} md={6}>
                <Card size="small">
                  <Statistic 
                    title="Avg. LOI" 
                    value={12} 
                    suffix="min" 
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={12} md={6}>
                <Card size="small">
                  <Statistic 
                    title="Pace" 
                    value={selectedSourceData.pace || 0} 
                    suffix="/hr"
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      );
    };

    // Source-specific survey links tab
    const renderSourceSurveyLinks = () => {
      return (
        <Card>
          <div className="mb-6">
            <Text strong>Live Link:</Text>
            <div className="flex items-center mt-1">
              <Input 
                value={`https://sample-router.sayasdf.com/router/live?source=${selectedSourceData.uuid}`} 
                readOnly 
                className="mr-2" 
              />
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => copyToClipboard(`https://sample-router.sayasdf.com/router/live?source=${selectedSourceData.uuid}`)}
              >
                Copy
              </Button>
            </div>
          </div>
          
          <div>
            <Text strong>Test Link:</Text>
            <div className="flex items-center mt-1">
              <Input 
                value={`https://sample-router.sayasdf.com/router/test?source=${selectedSourceData.uuid}`} 
                readOnly 
                className="mr-2" 
              />
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => copyToClipboard(`https://sample-router.sayasdf.com/router/test?source=${selectedSourceData.uuid}`)}
              >
                Copy
              </Button>
            </div>
          </div>
        </Card>
      );
    };

    // Source-specific settings tab
    const renderSourceSettings = () => {
      return (
        <Card>
          <Form layout="vertical" initialValues={selectedSourceData}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Source Name" name="name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Source ID" name="uuid">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Target Completes" name="target">
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Status">
                  <Select defaultValue={selectedSourceData.status || 'active'}>
                    <Option value="active">Active</Option>
                    <Option value="paused">Paused</Option>
                    <Option value="completed">Completed</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <div className="flex justify-end">
              <Button type="primary">Save Changes</Button>
            </div>
          </Form>
        </Card>
      );
    };

    // Source-specific quotas tab
    const renderSourceQuotas = () => {
      return (
        <Card>
          <Alert
            type="info"
            message="Quota settings are inherited from the project level."
            className="mb-4"
          />
          <Table
            dataSource={mockQuotasData}
            rowKey="uuid"
            pagination={false}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Code',
                dataIndex: 'code',
                key: 'code',
                width: 100,
              },
              {
                title: 'Target',
                dataIndex: 'target',
                key: 'target',
                width: 80,
              },
              {
                title: 'Complete',
                dataIndex: 'complete',
                key: 'complete',
                width: 100,
                render: (value: number) => (
                  <Tag color="green">{value}</Tag>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                width: 100,
                render: (_: any, record: any) => (
                  <Button size="small" onClick={() => showModal(record)}>
                    View
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      );
    };
    
    return (
      <div className="container mx-auto px-4 py-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={navigateToOverview}
          className="mb-4"
        >
          Back to Overview
        </Button>
        
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Title level={4} className="mb-0">{selectedSourceData.name}</Title>
              <Text type="secondary">ID: {selectedSourceData.uuid}</Text>
            </div>
            <Tag color={selectedSourceData.status === 'active' ? 'green' : 'orange'}>
              {selectedSourceData.status || 'Active'}
            </Tag>
          </div>
          
          <Tabs
            defaultActiveKey="overview"
            items={[
              {
                key: 'overview',
                label: 'Overview',
                children: renderSourceOverview()
              },
              {
                key: 'survey-links',
                label: 'Survey Links',
                children: renderSourceSurveyLinks()
              },
              {
                key: 'settings',
                label: 'Settings',
                children: renderSourceSettings()
              },
              {
                key: 'quotas',
                label: 'Quotas',
                children: renderSourceQuotas()
              }
            ]}
          />
        </Card>
      </div>
    );
  };

  // Helper function for project instructions tab
  const renderProjectInstructions = () => {
    return <div className="p-4">Project instructions content</div>;
  };

  const renderAllSourcesInstructions = () => {
    return (
      <div className="p-4">
        <Card title="Source Instructions">
          <div className="mb-4">
            <Title level={4}>Getting Started</Title>
            <p>Follow these steps to get started with your project:</p>
            <ol className="list-decimal ml-5 my-3">
              <li>Review the project details and requirements</li>
              <li>Set up your survey links for each source</li>
              <li>Configure quotas and targeting</li>
              <li>Test the survey flow with the test links</li>
              <li>Launch the project when ready</li>
            </ol>
          </div>
          
          <div className="mb-4">
            <Title level={4}>Managing Sources</Title>
            <p>Each source represents a supplier or channel for your survey respondents:</p>
            <ul className="list-disc ml-5 my-3">
              <li>Add new sources as needed for different suppliers</li>
              <li>Monitor completion rates and adjust quotas</li>
              <li>Pause underperforming sources</li>
              <li>Download source-specific reports</li>
            </ul>
          </div>
          
          <div>
            <Title level={4}>Best Practices</Title>
            <p>For optimal results, consider these best practices:</p>
            <ul className="list-disc ml-5 my-3">
              <li>Regularly check response quality</li>
              <li>Adjust CPI based on incidence rates</li>
              <li>Monitor completion times</li>
              <li>Review screener questions for accuracy</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  };

  // Source-specific overview tab
  const renderSourceOverview = () => {
    const selectedSourceData = sources.find(s => s.uuid === selectedSource);
    if (!selectedSourceData) return <div>Source not found</div>;

    // Prepare data for donut chart
    const donutData = {
      labels: ['Complete', 'Terminate', 'Quota Full', 'Quality'],
      datasets: [
        {
          data: [65, 20, 10, 5],
          backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#F44336'],
          borderWidth: 0,
        },
      ],
    };

    // Prepare data for line chart
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const completesData = [0, 5, 12, 18, 25, 30, 35];
    const terminatesData = [0, 3, 7, 10, 15, 18, 20];

    const lineData = {
      labels: dates,
      datasets: [
        {
          label: 'Completes',
          data: completesData,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Terminates',
          data: terminatesData,
          borderColor: '#FFC107',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };

    const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    return (
      <div className="p-4">
        <Card title="Source Overview" className="mb-6">
          <Row gutter={24}>
            <Col span={24} md={12}>
              <div className="mb-4">
                <Title level={5}>Response Distribution</Title>
                <div style={{ height: 250 }}>
                  <DonutChart data={donutData} />
                </div>
              </div>
            </Col>
            <Col span={24} md={12}>
              <div className="mb-4">
                <Title level={5}>Response Trend</Title>
                <div style={{ height: 250 }}>
                  <Line data={lineData} options={lineOptions} />
                </div>
              </div>
            </Col>
          </Row>
          
          <div className="mt-6">
            <Title level={5}>Source Statistics</Title>
            <Row gutter={24}>
              <Col span={12} md={6}>
                <Card size="small">
                  <Statistic 
                    title="Completes" 
                    value={selectedSourceData.completes || 0} 
                    suffix={`/ ${selectedSourceData.target || 100}`}
                  />
                </Card>
              </Col>
              <Col span={12} md={6}>
                <Card size="small">
                  <Statistic 
                    title="Conversion Rate" 
                    value={35} 
                    suffix="%" 
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={12} md={6}>
                <Card size="small">
                  <Statistic 
                    title="Avg. LOI" 
                    value={12} 
                    suffix="min" 
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={12} md={6}>
                <Card size="small">
                  <Statistic 
                    title="Pace" 
                    value={selectedSourceData.pace || 0} 
                    suffix="/hr"
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    );
  };

  // Source settings tab
  const renderSourceSettings = () => {
    const selectedSourceData = sources.find(s => s.uuid === selectedSource);
    if (!selectedSourceData) return <div>Source not found</div>;

    return (
      <div className="p-4">
        <Card title="Source Settings">
          <Form layout="vertical">
            <Form.Item label="Source Name">
              <Input defaultValue={selectedSourceData.name} />
            </Form.Item>
            
            <Form.Item label="Status">
              <Select defaultValue={selectedSourceData.status || 'active'}>
                <Option value="active">Active</Option>
                <Option value="paused">Paused</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Target Completes">
              <InputNumber 
                min={1} 
                defaultValue={selectedSourceData.target || 100} 
                style={{ width: 200 }}
              />
            </Form.Item>
            
            <Form.Item label="CPI (Cost Per Interview)">
              <InputNumber 
                min={0} 
                step={0.01} 
                precision={2}
                defaultValue={2.50} 
                style={{ width: 200 }}
                formatter={(value) => `$${value}`}
                parser={(value) => {
                  // Parse to either 0 or 2.5 to match expected return type
                  const parsed = value?.replace('$', '') ? parseFloat(value.replace('$', '')) : 0;
                  return parsed > 0 ? 2.5 : 0 as 0 | 2.5;
                }}
              />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary">Save Changes</Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  };

  // Render project header with donut chart
  const renderProjectHeader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-center">
      {/* LEFT: Project Info */}
      <div>
        <Title level={2} className="mb-1 flex items-center gap-2">
          {project?.name || 'New Project'}
          <Button 
            icon={<CopyOutlined />} 
            size="small" 
            onClick={() => copyToClipboard(project?.name || 'New Project')} 
          />
        </Title>
        <div className="text-gray-500 mb-2">
          <span className="font-medium">Project ID:</span> {project?.uuid || 'Not assigned yet'}
        </div>
        <div className="mb-2">Description: {project?.description || 'No description available'}</div>
        {feasibilityData && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="text-sm font-medium mb-2">Feasibility Data:</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {feasibilityData.country && (
                <div><span className="font-medium">Country:</span> {feasibilityData.country}</div>
              )}
              {feasibilityData.completes && (
                <div><span className="font-medium">Completes:</span> {feasibilityData.completes}</div>
              )}
              {feasibilityData.incidence_rate && (
                <div><span className="font-medium">Incidence Rate:</span> {feasibilityData.incidence_rate}%</div>
              )}
              {feasibilityData.loi_minutes && (
                <div><span className="font-medium">LOI:</span> {feasibilityData.loi_minutes} minutes</div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* RIGHT: Chart and KPIs */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-[180px] h-[180px] flex-none flex items-center justify-center">
          <DonutChart
            data={{
              labels: [
                'Complete',
                'Remaining'
              ],
              datasets: [
                {
                  data: [
                    Math.max(project?.count_complete || 0, 0),
                    Math.max((project?.total_available || 100) - (project?.count_complete || 0), 0)
                  ],
                  backgroundColor: ['#52c41a', '#f0f0f0'],
                  borderWidth: 0
                }
              ]
            }}
            options={{
              cutout: '70%',
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {currentView === 'source' && selectedSource ? (
        // Make sure renderSourceDetail exists and is callable
        typeof renderSourceDetail === 'function' ? renderSourceDetail() : <div>Source detail view not available</div>
      ) : (
        <>
          {/* Project header */}
          <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-6">
              {/* Back button */}
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => router.push('/projects')}
                className="mb-4"
              >
                Back to Projects
              </Button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="container mx-auto px-4 py-6">
            {/* Project header with donut chart */}
            {renderProjectHeader()}
            
            {/* Tabs */}
            <Tabs 
              defaultActiveKey="overview" 
              className="project-tabs"
              items={[
                {
                  key: 'overview',
                  label: 'Overview',
                  children: renderOverview()
                },
                {
                  key: 'sources',
                  label: 'Sources',
                  children: (
                    <>
                      <div className="flex justify-between mb-4">
                        <Title level={4}>Project Sources</Title>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={handleAddSource}
                        >
                          Add Source
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sources.map(source => (
                          <Card 
                            key={source.uuid} 
                            title={
                              <div className="flex items-center">
                                <span className="mr-2">{source.name}</span>
                                <Tag color={source.status === 'active' ? 'green' : 'orange'}>
                                  {source.status === 'active' ? 'Active' : 'Paused'}
                                </Tag>
                              </div>
                            }
                            className="source-card"
                          >
                            <div className="mb-3">
                              <Text type="secondary">Created: {source.created}</Text>
                            </div>
                            <div className="mb-3">
                              <Text>Completes: {source.completes} / {source.target}</Text>
                              <Progress percent={calcPercent(source.completes || 0, source.target || 100)} size="small" />
                            </div>
                            <div className="mb-3">
                              <Text>Pace: {source.pace} completes/day</Text>
                            </div>
                            <div className="mb-3">
                              <Text>Last Response: {source.lastResponse || 'No response yet'}</Text>
                            </div>
                            <div className="flex items-center">
                              <Button 
                                icon={<BarChartOutlined />}
                                onClick={() => navigateToSource(source.uuid)}
                              >
                                Details
                              </Button>
                              <Button 
                                type="text" 
                                icon={<EyeOutlined />} 
                                className="ml-auto"
                                onClick={() => window.open(`https://example.com/source/${source.uuid}`, '_blank')}
                              >
                                View Source
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )
                },
                {
                  key: 'survey-links',
                  label: 'Survey Links',
                  children: renderProjectSurveyLinks()
                },
                {
                  key: 'settings',
                  label: 'Settings',
                  children: (
                    <Card title="Project Settings">
                      <Form layout="vertical" initialValues={project}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Project Name" name="name">
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Project ID" name="uuid">
                              <Input disabled />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item label="Description" name="description">
                              <Input.TextArea rows={3} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Status">
                              <Select defaultValue="active">
                                <Option value="active">Active</Option>
                                <Option value="paused">Paused</Option>
                                <Option value="completed">Completed</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                        <div className="flex justify-end">
                          <Button type="primary">Save Changes</Button>
                        </div>
                      </Form>
                    </Card>
                  )
                },
                {
                  key: 'respondents',
                  label: 'Respondents',
                  children: (
                    <Card title="Respondent Data">
                      <Alert 
                        type="info" 
                        message="Respondent data will be available once the survey has responses." 
                        className="mb-4"
                      />
                      <Button icon={<DownloadOutlined />} disabled>Export Respondent Data</Button>
                    </Card>
                  )
                },
                {
                  key: 'invoicing',
                  label: 'Invoicing',
                  children: (
                    <Card title="Invoicing">
                      <Alert 
                        type="info" 
                        message="Invoicing information will be available once the project is completed." 
                        className="mb-4"
                      />
                      <Button icon={<FilePdfOutlined />} disabled>Generate Invoice</Button>
                    </Card>
                  )
                },
                {
                  key: 'quality',
                  label: 'Quality / Reconciliation',
                  children: (
                    <Card title="Quality Control">
                      <Alert 
                        type="info" 
                        message="Quality control metrics will be available as responses are collected." 
                        className="mb-4"
                      />
                      <Button icon={<BarChartOutlined />} disabled>View Quality Metrics</Button>
                    </Card>
                  )
                }
              ]}
            />
          </div>

          {/* Modals */}
          <Modal title={`Details – ${detailQuota ? detailQuota.name : ''}`} open={modalVisible} onCancel={closeModal} footer={null} width={700}>
            <div>
              <p><strong>Description:</strong> {detailQuota ? detailQuota.description : ''}</p>
              <p><strong>Target:</strong> {detailQuota ? detailQuota.target : 0}</p>
              <p><strong>CPI:</strong> ${detailQuota && detailQuota.cpi ? detailQuota.cpi.toFixed(2) : '0.00'}</p>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default ProjectDetailView;
