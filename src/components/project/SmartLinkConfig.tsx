'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Alert, Space, Typography, Tooltip, Badge, Row, Col, Tabs, Switch, Select } from 'antd';
import { LinkOutlined, CheckCircleOutlined, WarningOutlined, InfoCircleOutlined, ThunderboltOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SmartLinkConfigProps {
  projectData: any;
  onLinksValidated: (links: Record<string, string>, isValid: boolean) => void;
  onContinue: () => void;
}

interface LinkValidation {
  isValid: boolean;
  status: '' | 'success' | 'warning' | 'error';
  message: string;
}

export const SmartLinkConfig: React.FC<SmartLinkConfigProps> = ({
  projectData,
  onLinksValidated,
  onContinue
}) => {
  const [links, setLinks] = useState<Record<string, string>>({
    complete: '',
    terminate: '',
    quota_full: '',
  });
  
  const [validations, setValidations] = useState<Record<string, LinkValidation>>({});
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [testing, setTesting] = useState(false);
  const [allValid, setAllValid] = useState(false);

  const linkTypes = [
    {
      key: 'complete',
      title: 'Survey Complete',
      description: 'Where to send respondents who finish your survey',
      required: true,
      icon: <CheckCircleOutlined className="text-green-500" />,
      placeholder: 'https://yoursite.com/thank-you?pid={{PID}}&status=complete'
    },
    {
      key: 'terminate',
      title: 'Survey Terminate',
      description: 'Where to send respondents who are screened out',
      required: true,
      icon: <WarningOutlined className="text-orange-500" />,
      placeholder: 'https://yoursite.com/sorry?pid={{PID}}&status=terminate'
    },
    {
      key: 'quota_full',
      title: 'Quota Full',
      description: 'Where to send respondents when quotas are filled',
      required: true,
      icon: <InfoCircleOutlined className="text-blue-500" />,
      placeholder: 'https://yoursite.com/full?pid={{PID}}&status=quota_full'
    }
  ];

  const validateUrl = async (url: string): Promise<LinkValidation> => {
    if (!url) {
      return { isValid: false, status: 'error', message: 'URL is required' };
    }

    try {
      new URL(url);
      
      if (!url.includes('{{PID}}')) {
        return { 
          isValid: false, 
          status: 'warning', 
          message: 'Missing {{PID}} parameter for tracking' 
        };
      }

      // Simulate URL testing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { 
        isValid: true, 
        status: 'success', 
        message: 'URL is valid and accessible' 
      };
    } catch {
      return { 
        isValid: false, 
        status: 'error', 
        message: 'Invalid URL format' 
      };
    }
  };

  const handleLinkChange = async (key: string, value: string) => {
    setLinks(prev => ({ ...prev, [key]: value }));
    
    if (value) {
      const validation = await validateUrl(value);
      setValidations(prev => ({ ...prev, [key]: validation }));
    }
  };

  const generateDefaultLinks = () => {
    const baseUrl = 'https://client-redirects.com';
    const projectId = projectData.name?.toLowerCase().replace(/\s+/g, '-') || 'project';
    
    const defaultLinks = {
      complete: `${baseUrl}/${projectId}/complete?pid={{PID}}&status=complete&quota={{QUOTA}}`,
      terminate: `${baseUrl}/${projectId}/terminate?pid={{PID}}&status=terminate`,
      quota_full: `${baseUrl}/${projectId}/quota-full?pid={{PID}}&status=quota_full`
    };
    
    setLinks(defaultLinks);
    
    // Auto-validate generated links
    Object.entries(defaultLinks).forEach(async ([key, url]) => {
      const validation = await validateUrl(url);
      setValidations(prev => ({ ...prev, [key]: validation }));
    });
  };

  const testAllLinks = async () => {
    setTesting(true);
    for (const [key, url] of Object.entries(links)) {
      if (url) {
        const validation = await validateUrl(url);
        setValidations(prev => ({ ...prev, [key]: validation }));
      }
    }
    setTesting(false);
  };

  useEffect(() => {
    const requiredLinks = linkTypes.filter(t => t.required);
    const validRequiredLinks = requiredLinks.filter(t => validations[t.key]?.isValid);
    const isValid = validRequiredLinks.length === requiredLinks.length;
    
    setAllValid(isValid);
    onLinksValidated(links, isValid);
  }, [links, validations]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <Title level={3}>Configure Redirect URLs</Title>
        <Text type="secondary">
          Set up where to send respondents based on survey outcomes
        </Text>
      </div>

      {/* Quick Setup Options */}
      <Card size="small" className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space>
              <Switch
                checked={autoGenerate}
                onChange={setAutoGenerate}
                size="small"
              />
              <Text>Auto-generate standard redirect URLs</Text>
            </Space>
          </Col>
          <Col span={12} className="text-right">
            <Space>
              <Button 
                icon={<ThunderboltOutlined />}
                onClick={generateDefaultLinks}
                size="small"
              >
                Generate URLs
              </Button>
              <Button 
                icon={<EyeOutlined />}
                onClick={testAllLinks}
                loading={testing}
                size="small"
              >
                Test All
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Link Configuration */}
      <div className="space-y-4">
        {linkTypes.map((linkType) => (
          <Card key={linkType.key} size="small">
            <Row gutter={16} align="top">
              <Col span={1}>
                {linkType.icon}
              </Col>
              <Col span={6}>
                <div>
                  <Text strong>
                    {linkType.title}
                    {linkType.required && <Text type="danger"> *</Text>}
                  </Text>
                  <div>
                    <Text type="secondary" className="text-sm">
                      {linkType.description}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={14}>
                <Input
                  placeholder={linkType.placeholder}
                  value={links[linkType.key] || ''}
                  onChange={(e) => handleLinkChange(linkType.key, e.target.value)}
                  status={validations[linkType.key]?.status as '' | 'warning' | 'error' | undefined}
                  suffix={
                    validations[linkType.key] && (
                      <Tooltip title={validations[linkType.key].message}>
                        {validations[linkType.key].status === 'success' ? (
                          <CheckCircleOutlined className="text-green-500" />
                        ) : validations[linkType.key].status === 'warning' ? (
                          <WarningOutlined className="text-orange-500" />
                        ) : (
                          <WarningOutlined className="text-red-500" />
                        )}
                      </Tooltip>
                    )
                  }
                />
                {validations[linkType.key] && (
                  <Text 
                    type={validations[linkType.key].status === 'success' ? 'success' : 'danger'}
                    className="text-xs"
                  >
                    {validations[linkType.key].message}
                  </Text>
                )}
              </Col>
              <Col span={3} className="text-right">
                <Button 
                  type="link" 
                  size="small" 
                  icon={<CopyOutlined />}
                  onClick={() => navigator.clipboard.writeText(links[linkType.key])}
                >
                  Copy
                </Button>
              </Col>
            </Row>
          </Card>
        ))}
      </div>

      {/* Parameter Help */}
      <Alert
        message="Available Parameters"
        description={
          <div>
            <Text code>{'{PID}'}</Text> - Participant ID for tracking<br/>
            <Text code>{'{QUOTA}'}</Text> - Quota name (for complete URLs)<br/>
            <Text code>{'{STATUS}'}</Text> - Survey outcome status<br/>
            <Text code>{'{PROJECT_ID}'}</Text> - Your project identifier
          </div>
        }
        type="info"
        showIcon
        className="mb-4"
      />

      {/* Continue Button */}
      <div className="text-center">
        <Button
          type="primary"
          size="large"
          onClick={onContinue}
          disabled={!allValid}
          className="px-8"
        >
          Continue to Launch Setup
          {allValid && <CheckCircleOutlined className="ml-2" />}
        </Button>
      </div>
    </div>
  );
};
