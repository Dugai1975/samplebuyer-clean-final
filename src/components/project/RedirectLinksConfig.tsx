"use client";

import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Alert, Divider, Space, Typography,
  Tooltip, Collapse, Row, Col, Switch, Select, Tag, message, Checkbox
} from 'antd';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
import ExportOutlined from '@ant-design/icons/ExportOutlined';
import ThunderboltOutlined from '@ant-design/icons/ThunderboltOutlined';
import ExclamationCircleOutlined from '@ant-design/icons/ExclamationCircleOutlined';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RedirectLink {
  type: 'complete' | 'terminate' | 'quota_full' | 'duplicate' | 'quality' | 'screenout' | 'timeout';
  url: string;
  required: boolean;
  description: string;
  example: string;
}

interface RedirectLinksConfigProps {
  projectData: any;
  onChange: (links: Record<string, string>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const REDIRECT_TYPES: RedirectLink[] = [
  {
    type: 'complete',
    required: true,
    description: 'Respondent completes the survey successfully.',
    example: 'https://yoursite.com/complete?pid={{PID}}&quota={{QUOTA}}',
    url: ''
  },
  {
    type: 'terminate',
    required: true,
    description: 'Respondent is terminated (screened out).',
    example: 'https://yoursite.com/terminate?pid={{PID}}',
    url: ''
  },
  {
    type: 'quota_full',
    required: true,
    description: 'Quota has been filled.',
    example: 'https://yoursite.com/quota_full?pid={{PID}}',
    url: ''
  },
  {
    type: 'duplicate',
    required: false,
    description: 'Duplicate respondent detected.',
    example: 'https://yoursite.com/duplicate?pid={{PID}}',
    url: ''
  },
  {
    type: 'quality',
    required: false,
    description: 'Low-quality respondent.',
    example: 'https://yoursite.com/quality?pid={{PID}}',
    url: ''
  },
  {
    type: 'screenout',
    required: false,
    description: 'Screened out for other reasons.',
    example: 'https://yoursite.com/screenout?pid={{PID}}',
    url: ''
  },
  {
    type: 'timeout',
    required: false,
    description: 'Respondent timed out.',
    example: 'https://yoursite.com/timeout?pid={{PID}}',
    url: ''
  }
];

export const RedirectLinksConfig: React.FC<RedirectLinksConfigProps> = ({
  projectData,
  onChange,
  onValidationChange
}: RedirectLinksConfigProps) => {
  const [links, setLinks] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [baseUrl, setBaseUrl] = useState('');
  const [useSmartGeneration, setUseSmartGeneration] = useState(true);
  const [overwriteSmart, setOverwriteSmart] = useState(false);
  const [valid, setValid] = useState(false);
  const [missingRequired, setMissingRequired] = useState<string[]>([]);

  useEffect(() => {
    if (projectData?.survey_url && !baseUrl) {
      try {
        const url = new URL(projectData.survey_url);
        setBaseUrl(url.origin);
      } catch {
        // Invalid URL, ignore
      }
    }
  }, [projectData?.survey_url, baseUrl]);

  useEffect(() => {
    const requiredLinks = REDIRECT_TYPES.filter(r => r.required);
    const missing: string[] = [];
    const isValid = requiredLinks.every(r => {
      const val = links[r.type];
      const ok = val && /^https?:\/\//.test(val);
      if (!ok) missing.push(r.type);
      return ok;
    });
    setMissingRequired(missing);
    setValid(isValid);
    onValidationChange(isValid);
    onChange(links);
  }, [links, onChange, onValidationChange]);

  const handleLinkPaste = (type: string, value: string) => {
    if (!baseUrl) {
      try {
        const url = new URL(value);
        setBaseUrl(url.origin);
      } catch {}
    }
    handleLinkChange(type, value);
  };

  const handleLinkChange = (type: string, value: string) => {
    setLinks(prev => ({ ...prev, [type]: value }));
    setTouched(prev => ({ ...prev, [type]: true }));
  };

  const handleSmartGenerate = () => {
    if (!baseUrl) {
      message.warning('Please enter a base URL first');
      return;
    }
    const newLinks: Record<string, string> = { ...links };
    REDIRECT_TYPES.forEach(r => {
      const path = r.type.replace('_', '-');
      if (overwriteSmart || !links[r.type]) {
        newLinks[r.type] = `${baseUrl}/${path}?pid={{PID}}${r.type === 'complete' ? '&quota={{QUOTA}}' : ''}`;
      }
    });
    setLinks(newLinks);
    message.success('Redirect URLs generated!');
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('Copied to clipboard!');
  };

  const handleTest = (url: string) => {
    const testUrl = url.replace('{{PID}}', 'TEST_PID').replace('{{QUOTA}}', 'Q1');
    window.open(testUrl, '_blank');
  };

  const isValidUrl = (url: string) => /^https?:\/\//.test(url);
  const getFieldStatus = (type: string) => {
    if (!touched[type]) return '';
    const url = links[type];
    const isRequired = REDIRECT_TYPES.find(r => r.type === type)?.required;
    if (isRequired && (!url || !isValidUrl(url))) return 'error';
    if (url && !isValidUrl(url)) return 'error';
    return '';
  };

  const requiredTypes = REDIRECT_TYPES.filter(r => r.required);
  const optionalTypes = REDIRECT_TYPES.filter(r => !r.required);
  const configuredRequired = requiredTypes.filter(r => links[r.type] && isValidUrl(links[r.type])).length;
  const configuredOptional = optionalTypes.filter(r => links[r.type] && isValidUrl(links[r.type])).length;
  const configuredCount = Object.values(links).filter(url => url && isValidUrl(url)).length;

  return (
    <Card
      title={<span><LinkOutlined /> Redirect Links Configuration</span>}
      extra={
        <Tooltip title="Auto-generate URLs from base">
          <Button size="small" icon={<SettingOutlined />} onClick={handleSmartGenerate} disabled={!baseUrl}>
            Generate All
          </Button>
        </Tooltip>
      }
      className={`mb-6 ${!valid ? 'border-error' : ''}`}
    >
      {missingRequired.length > 0 && (
        <Alert
          message={
            <span>
              <ExclamationCircleOutlined style={{ color: 'orange' }} /> Please provide all required redirect URLs:
              <ul>
                {missingRequired.map(type => (
                  <li key={type}>{type.replace('_', ' ').toUpperCase()}</li>
                ))}
              </ul>
            </span>
          }
          type="warning"
          showIcon
          className="mt-4"
        />
      )}
      <Paragraph type="secondary">
        Configure the URLs respondents will be redirected to after survey completion, screenout, quota full, and other outcomes. Industry-standard parameters: <Tag>{'{PID}'}</Tag>, <Tag>{'{QUOTA}'}</Tag>.
      </Paragraph>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form layout="vertical">
            <Form.Item label="Base URL for Generation" required>
              <Input
                prefix={<GlobalOutlined />}
                placeholder="https://yoursite.com"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                aria-label="Base URL for Generation"
              />
            </Form.Item>
            <Divider />
            {REDIRECT_TYPES.map(r => (
              <Form.Item
                key={r.type}
                label={
                  <span>
                    {r.type.replace('_', ' ').toUpperCase()}
                    <Tooltip title={r.description}>
                      <InfoCircleOutlined />
                    </Tooltip>
                    {r.required && <Tag color="red">required</Tag>}
                  </span>
                }
                required={r.required}
                validateStatus={getFieldStatus(r.type)}
                help={getFieldStatus(r.type) === 'error' ? 'Please enter a valid URL' : ''}
              >
                <Input.Group compact>
                  <Input
                    style={{ width: '85%' }}
                    placeholder={r.example}
                    value={links[r.type] || ''}
                    onChange={e => handleLinkPaste(r.type, e.target.value)}
                    prefix={<LinkOutlined />}
                    aria-label={r.type.replace('_', ' ').toUpperCase()}
                  />
                  <Tooltip title="Copy URL">
                    <Button icon={<CopyOutlined />} onClick={() => handleCopy(links[r.type] || '')} disabled={!links[r.type]} aria-label="Copy URL" />
                  </Tooltip>
                  <Tooltip title="Test URL in new tab">
                    <Button icon={<ExportOutlined />} onClick={() => handleTest(links[r.type] || '')} disabled={!links[r.type]} aria-label="Test URL in new tab" />
                  </Tooltip>
                </Input.Group>
              </Form.Item>
            ))}
          </Form>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div className="flex justify-between items-center">
            <span>
              {configuredRequired}/{requiredTypes.length} required URLs configured
            </span>
            <span>
              {configuredOptional}/{optionalTypes.length} optional URLs configured
            </span>
            <span>
              {configuredCount}/{REDIRECT_TYPES.length} total URLs configured
            </span>
          </div>
        </Col>
      </Row>
      {valid ? (
        <Alert
          message={<span><CheckCircleOutlined style={{ color: 'green' }} /> All required URLs are valid.</span>}
          type="success"
          showIcon
          className="mt-4"
        />
      ) : (
        <Alert
          message={<span><ExclamationCircleOutlined style={{ color: 'orange' }} /> Please provide all required redirect URLs.</span>}
          type="warning"
          showIcon
          className="mt-4"
        />
      )}
    </Card>
  );
};
