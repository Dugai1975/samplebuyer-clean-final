import React from 'react';
import { Table, Tag, Progress, Button, Tooltip, Typography } from 'antd';
import { EyeOutlined, PauseCircleOutlined, CheckCircleOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

// Include CSS directly in component
const styles: Record<string, React.CSSProperties> = {
  sourcesOverview: {
    marginTop: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    padding: '16px',
    border: '1px solid #f0f0f0',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600 as const,
    marginBottom: '12px',
    color: '#262626',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '8px',
  },
  progressBar: {
    width: '100%',
    maxWidth: '120px'
  }
};

interface Source {
  uuid: string;
  name: string;
  status: string;
  completes: number;
  audience?: {
    size: number;
  };
  pace?: number;
}

export interface SourcesOverviewProps {
  sources: Source[];
  projectId: string;
  handleToggleSourceStatus?: (source: Source) => void;
}

const SourcesOverview: React.FC<SourcesOverviewProps> = ({ 
  sources, 
  projectId,
  handleToggleSourceStatus 
}) => {
  const router = useRouter();

  // Handler for viewing source details
  const handleViewSource = (source: Source) => {
    router.push(`/sourceDetail?id=${source.uuid}&projectId=${projectId}`);
  };

  // Calculate the completion percentage
  const calculateCompletionPercentage = (source: Source) => {
    if (!source?.audience?.size || source.audience.size === 0) return 0;
    const completes = source.completes || 0;
    return Math.min(100, Math.round((completes / source.audience.size) * 100));
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'paused':
        return 'orange';
      case 'completed':
        return 'blue';
      default:
        return 'default';
    }
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const columns = [
    {
      title: 'Source Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, source: Source) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">ID: {source.uuid ? source.uuid.substring(0, 8) : 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status || 'default')}>
          {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
        </Tag>
      ),
    },
    {
      title: 'Completes',
      dataIndex: 'completes',
      key: 'completes',
      render: (completes: number, source: Source) => (
        <div>
          <div style={{ fontWeight: 500 }}>{formatNumber(completes || 0)}</div>
          {source?.audience?.size && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>of {formatNumber(source.audience.size)}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_: any, source: Source) => {
        const percent = calculateCompletionPercentage(source);
        return (
          <Tooltip title={`${percent}% complete`}>
            <Progress 
              percent={percent} 
              size="small"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              showInfo={false}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Pace',
      dataIndex: 'pace',
      key: 'pace',
      render: (pace: number) => {
        const paceValue = pace || 0;
        const color = paceValue > 5 ? '#52c41a' : paceValue > 2 ? '#1890ff' : '#faad14';
        return (
          <div style={{ fontWeight: 500, color }}>{typeof paceValue === 'number' ? paceValue.toFixed(1) : '0.0'}/hr</div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, source: Source) => (
        <div className="flex space-x-2">
          <Tooltip title="View Details" key="view-details">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewSource(source)}
              key="view-button"
            />
          </Tooltip>
          {handleToggleSourceStatus && (
            <Tooltip 
              title={source.status === 'active' ? 'Pause Source' : 'Activate Source'} 
              key="toggle-status"
            >
              <Button 
                icon={source.status === 'active' ? <PauseCircleOutlined /> : <CheckCircleOutlined />} 
                size="small"
                onClick={() => handleToggleSourceStatus(source)}
                key="toggle-button"
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  if (sources.length === 0) {
    return (
      <div className="text-center py-6">
        <Text type="secondary">No sources available for this project.</Text>
      </div>
    );
  }

  // Ensure each source has a valid uuid for React keys
  const safeDataSource = sources.map(source => {
    if (!source.uuid) {
      return { ...source, uuid: `temp-${Math.random().toString(36).substring(2, 9)}` };
    }
    return source;
  });

  return (
    <div style={styles.sourcesOverview}>
      <div style={styles.sectionTitle}>
        <DatabaseOutlined style={{ color: '#1890ff' }} /> Sources Overview
      </div>
      
      <Table 
        dataSource={safeDataSource} 
        columns={columns} 
        rowKey="uuid"
        pagination={sources.length > 10 ? { pageSize: 10 } : false}
        size="small"
        scroll={{ x: 'max-content' }}
        bordered={false}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        summary={(pageData) => {
          const activeSources = pageData.filter(s => s.status === 'active').length;
          const totalCompletes = pageData.reduce((sum, source) => sum + (source.completes || 0), 0);
          
          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong>{pageData.length} sources</Text>
                  {activeSources > 0 && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>({activeSources} active)</Text>
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={3}>
                  <Text strong>{formatNumber(totalCompletes)} total completes</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
    </div>
  );
};

export default SourcesOverview;
