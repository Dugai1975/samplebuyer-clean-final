'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Typography,
  Statistic,
  Progress,
  Tabs,
  Tag,
  Button,
  Divider,
  Input,
  Table,
  Timeline,
  Badge,
  Tooltip,
  Empty,
  message,
  Spin,
  Row,
  Col
} from 'antd';
import {
  ArrowLeftOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DownloadOutlined,
  ReloadOutlined,
  LineChartOutlined,
  PieChartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle
} from 'chart.js';
import BottomStickyBar from '@/components/navigation/BottomStickyBar';
import '../projectDetail/projectDetail.css';
import './sourceDetail.css';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle
);

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Generate mock time series data for the source
const generateTimeSeriesData = (days = 7, startCompletes = 0, targetCompletes = 100) => {
  const data = [];
  let currentCompletes = startCompletes;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate a realistic progression curve
    const dayProgress = Math.min(
      Math.floor(Math.random() * 15) + (targetCompletes - currentCompletes) / (i + 1) * 0.8,
      targetCompletes - currentCompletes
    );
    
    currentCompletes += dayProgress;
    
    data.push({
      date: date.toISOString().split('T')[0],
      completes: currentCompletes,
      daily: dayProgress
    });
  }
  
  return data;
};

// Generate mock status events for the source
const generateStatusEvents = (days = 7) => {
  const events = [];
  const now = new Date();
  const statuses = ['active', 'paused'];
  let currentStatus = 'active';
  
  for (let i = days; i >= 0; i--) {
    if (Math.random() > 0.7) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Toggle status
      currentStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      events.push({
        date: date.toISOString(),
        status: currentStatus,
        reason: currentStatus === 'active' ? 'Resumed by admin' : 'Paused by admin'
      });
    }
  }
  
  return events;
};

// Generate mock respondent data
const generateRespondents = (count = 20) => {
  const statuses = ['complete', 'screenout', 'terminate', 'quotafull'];
  const respondents = [];
  
  for (let i = 0; i < count; i++) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - i * 30);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    respondents.push({
      id: `resp-${i}-${Date.now().toString(36).substring(5)}`,
      timestamp: now.toISOString(),
      status,
      timeSpent: Math.floor(Math.random() * 15) + 5,
      questions: Math.floor(Math.random() * 20) + 5
    });
  }
  
  return respondents;
};

export default function SourceDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState(null);
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [statusEvents, setStatusEvents] = useState([]);
  const [respondents, setRespondents] = useState([]);
  
  // Get source ID and project ID from URL
  const sourceId = searchParams.get('id');
  const projectId = searchParams.get('projectId');
  
  // Load source data from localStorage
  useEffect(() => {
    if (!sourceId || !projectId) {
      message.error('Missing source or project ID');
      router.push('/');
      return;
    }
    
    try {
      // Load projects from localStorage
      const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const foundProject = allProjects.find(p => p.uuid === projectId);
      
      if (!foundProject) {
        message.error('Project not found');
        router.push('/');
        return;
      }
      
      setProject(foundProject);
      
      // Find the source within the project
      const foundSource = foundProject.sources?.find(s => s.uuid === sourceId);
      
      if (!foundSource) {
        message.error('Source not found in project');
        router.push(`/projectDetail?id=${projectId}`);
        return;
      }
      
      setSource(foundSource);
      
      // Generate mock data for the source
      setTimeSeriesData(generateTimeSeriesData(7, 0, foundSource.audience?.size || 100));
      setStatusEvents(generateStatusEvents(7));
      setRespondents(generateRespondents(20));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading source data:', error);
      message.error('Failed to load source data');
      setIsLoading(false);
    }
  }, [sourceId, projectId, router]);
  
  // Handle toggling source status
  const handleToggleStatus = () => {
    if (!source || !project) return;
    
    try {
      // Toggle status
      const newStatus = source.status === 'active' ? 'paused' : 'active';
      
      // Update source in state
      const updatedSource = { ...source, status: newStatus };
      setSource(updatedSource);
      
      // Update source in project
      const updatedProject = { ...project };
      const sourceIndex = updatedProject.sources.findIndex(s => s.uuid === sourceId);
      
      if (sourceIndex !== -1) {
        updatedProject.sources[sourceIndex] = updatedSource;
        setProject(updatedProject);
        
        // Update in localStorage
        const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const projectIndex = allProjects.findIndex(p => p.uuid === projectId);
        
        if (projectIndex !== -1) {
          allProjects[projectIndex] = updatedProject;
          localStorage.setItem('projects', JSON.stringify(allProjects));
        }
      }
      
      message.success(`Source ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
    } catch (error) {
      console.error('Error toggling source status:', error);
      message.error('Failed to update source status');
    }
  };
  
  // Prepare chart data
  const completionChartData = {
    labels: timeSeriesData.map(d => d.date),
    datasets: [
      {
        label: 'Completes',
        data: timeSeriesData.map(d => d.completes),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };
  
  const dailyCompletesChartData = {
    labels: timeSeriesData.map(d => d.date),
    datasets: [
      {
        label: 'Daily Completes',
        data: timeSeriesData.map(d => d.daily),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }
    ]
  };
  
  const statusDistributionData = {
    labels: ['Completes', 'Screenouts', 'Terminates', 'Quotafuls'],
    datasets: [
      {
        data: [
          source?.completes || 0,
          source?.screenouts || 0,
          source?.terminates || 0,
          source?.quotafuls || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare respondent table columns
  const respondentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text copyable>{text}</Text>
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let icon = null;
        
        switch (status) {
          case 'complete':
            color = 'success';
            icon = <CheckCircleOutlined />;
            break;
          case 'screenout':
            color = 'warning';
            icon = <CloseCircleOutlined />;
            break;
          case 'terminate':
            color = 'error';
            icon = <CloseCircleOutlined />;
            break;
          case 'quotafull':
            color = 'processing';
            icon = <InfoCircleOutlined />;
            break;
          default:
            break;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      }
    },
    {
      title: 'Time Spent',
      dataIndex: 'timeSpent',
      key: 'timeSpent',
      render: (mins) => `${mins} mins`
    },
    {
      title: 'Questions',
      dataIndex: 'questions',
      key: 'questions'
    }
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading source details..." />
      </div>
    );
  }
  
  if (!source) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Empty description="Source not found" />
        <Button 
          type="primary" 
          onClick={() => router.push(`/projectDetail?id=${projectId}`)}
          className="mt-4"
        >
          Return to Project
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen source-detail-container">
      {/* Header with back button and source info */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="text"
              onClick={() => router.push(`/projectDetail?id=${projectId}`)}
              className="mr-2"
            >
              Back to Project
            </Button>
            <Divider type="vertical" />
            <div>
              <Title level={4} className="!mb-0">{source.name}</Title>
              <Text type="secondary">ID: {source.uuid}</Text>
            </div>
            <div className="ml-auto">
              <Tag color={source.status === 'active' ? 'green' : 'orange'} className="text-base px-3 py-1">
                {source.status === 'active' ? 'Active' : 'Paused'}
              </Tag>
            </div>
          </div>
          
          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <Statistic 
                title="Completes" 
                value={source.completes || 0} 
                suffix={`/ ${source.audience?.size || 100}`}
              />
              <Progress 
                percent={source.audience?.size ? (source.completes / source.audience.size) * 100 : 0} 
                size="small" 
                className="mt-2"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </Card>
            <Card>
              <Statistic 
                title="Pace" 
                value={source.pace || '0.0'} 
                suffix="/hr"
              />
            </Card>
            <Card>
              <Statistic 
                title="Screenouts" 
                value={source.screenouts || 0} 
              />
            </Card>
            <Card>
              <Statistic 
                title="Created" 
                value={source.created || new Date().toLocaleDateString()} 
              />
            </Card>
          </div>
          
          {/* Tabs for different views */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="source-tabs"
            items={[
              {
                key: 'overview',
                label: (
                  <span className="flex items-center gap-2">
                    <LineChartOutlined />
                    Overview
                  </span>
                ),
              },
              {
                key: 'respondents',
                label: (
                  <span className="flex items-center gap-2">
                    <UserOutlined />
                    Respondents
                  </span>
                ),
              },
              {
                key: 'history',
                label: (
                  <span className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    History
                  </span>
                ),
              }
            ]}
          />
        </div>
      </div>
      
      {/* Tab content */}
      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts section */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Completion Progress">
                  <Line 
                    data={completionChartData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: source.audience?.size || 100
                        }
                      }
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Daily Completes">
                  <Line 
                    data={dailyCompletesChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Response Distribution">
                  <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                    <Pie 
                      data={statusDistributionData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          }
                        }
                      }}
                    />
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Audience Details">
                  <div className="space-y-4">
                    <div>
                      <Text strong>Description</Text>
                      <p>{source.audience?.description || 'No description available'}</p>
                    </div>
                    <div>
                      <Text strong>Target Size</Text>
                      <p>{source.audience?.size || 100} completes</p>
                    </div>
                    <div>
                      <Text strong>Feasibility</Text>
                      <Tag color={
                        source.audience?.feasibility === 'High' ? 'green' : 
                        source.audience?.feasibility === 'Medium' ? 'blue' : 
                        'orange'
                      }>
                        {source.audience?.feasibility || 'Medium'}
                      </Tag>
                    </div>
                    {source.audience?.criteria && (
                      <div>
                        <Text strong>Criteria</Text>
                        <div className="mt-2">
                          {Object.entries(source.audience.criteria).map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <Text type="secondary">{key}: </Text>
                              <Text>{JSON.stringify(value)}</Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
        
        {activeTab === 'respondents' && (
          <Card title="Recent Respondents">
            <Table 
              dataSource={respondents} 
              columns={respondentColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )}
        
        {activeTab === 'history' && (
          <Card title="Source History">
            <Timeline
              mode="left"
              items={statusEvents.map(event => ({
                color: event.status === 'active' ? 'green' : 'orange',
                children: (
                  <div>
                    <p><Text strong>{event.status === 'active' ? 'Activated' : 'Paused'}</Text> - {event.reason}</p>
                    <Text type="secondary">{new Date(event.date).toLocaleString()}</Text>
                  </div>
                )
              }))}
            />
          </Card>
        )}
      </div>
      
      {/* Bottom Sticky Bar */}
      <BottomStickyBar 
        breadcrumbs={[
          { label: 'SampleBuyer', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: project?.name || 'Project', href: `/projectDetail?id=${projectId}` },
          { label: source.name }
        ]}
        onToggleActiveSources={handleToggleStatus}
        hasActiveSources={source.status === 'active'}
        sourcesCount={1}
      />
    </div>
  );
}
