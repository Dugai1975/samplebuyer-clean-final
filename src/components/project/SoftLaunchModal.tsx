import React, { useMemo } from 'react';
import {
  Modal,
  Card,
  Form,
  Radio,
  InputNumber,
  Checkbox,
  Alert,
  Button,
  Tooltip,
  Row,
  Col,
  Typography,
  Space
} from 'antd';
import { InfoCircleOutlined, CheckCircleTwoTone, DollarCircleTwoTone, SafetyCertificateTwoTone } from '@ant-design/icons';
import type { SoftLaunchConfig } from '@/services/softLaunchService';
import type { ProjectCreationData } from '@/types/enhanced';
import { errorLogger } from '@/services/errorLogger';

const { Title, Text } = Typography;

// ErrorBoundary for runtime errors
class SoftLaunchModalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    errorLogger.log('SoftLaunchModal.runtime', {error, info});
  }
  render() {
    if (this.state.hasError) {
      return (
        <Alert
          type="error"
          message="An unexpected error occurred in the soft launch setup."
          description={<span>
            Please refresh the page or <a href="mailto:support@example.com">contact support</a>.<br/>
            <Button onClick={() => window.location.reload()} style={{marginTop: 8}}>Reload Page</Button>
          </span>}
          showIcon
        />
      );
    }
    return this.props.children;
  }
}


export interface SoftLaunchModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (config: SoftLaunchConfig) => void;
  projectData: ProjectCreationData;
  loading?: boolean;
}

export const SoftLaunchModal: React.FC<SoftLaunchModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  projectData,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [testType, setTestType] = React.useState<'fixed' | 'percentage'>('fixed');
  const [autoPause, setAutoPause] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [manualOverride, setManualOverride] = React.useState(false);

  // Default test limit
  const minFixed = 5;
  const maxFixed = Math.max(10, Math.floor(projectData.completes * 0.5));
  const minPct = 5;
  const maxPct = 50;

  // Real-time cost estimation
  const costEstimate = useMemo(() => {
    const values = form.getFieldsValue();
    let testCount = 0;
    if (values.testType === 'fixed') {
      testCount = values.test_limit || minFixed;
    } else {
      testCount = Math.round((values.test_limit || minPct) / 100 * projectData.completes);
    }
    const cpi = projectData.estimated_cpi || 5;
    return {
      testCount,
      cost: testCount * cpi
    };
  }, [form, projectData.completes, projectData.estimated_cpi, minFixed, minPct]);

  // Validation rules
  const validateTestLimit = (_: any, value: number) => {
    if (testType === 'fixed') {
      if (value < minFixed) return Promise.reject(new Error(`Minimum is ${minFixed}`));
      if (value > maxFixed) return Promise.reject(new Error(`Maximum is ${maxFixed}`));
    } else {
      if (value < minPct) return Promise.reject(new Error(`Minimum is ${minPct}%`));
      if (value > maxPct) return Promise.reject(new Error(`Maximum is ${maxPct}%`));
    }
    return Promise.resolve();
  };

  // Handle confirm
  const handleOk = async () => {
    setFormError(null);
    try {
      const values = await form.validateFields();
      const config: SoftLaunchConfig = {
        test_limit: values.test_limit,
        test_limit_type: values.testType,
        auto_pause: autoPause,
        started_at: new Date().toISOString(),
      };
      try {
        onConfirm(config);
      } catch (e: any) {
        errorLogger.log('SoftLaunchModal.onConfirm', e);
        setFormError(e?.message || 'Failed to start soft launch. Please try again.');
      }
    } catch (e: any) {
      errorLogger.log('SoftLaunchModal.validateFields', e);
      setFormError(e?.message || 'Please fix the validation errors above.');
    }
  };

  // Manual override handler for fallback
  const handleManualOverride = () => {
    setManualOverride(true);
    setFormError('Automation failed. You may proceed with manual launch or contact support.');
  };

  // Reset form on open/close
  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        testType: 'fixed',
        test_limit: Math.min(10, projectData.completes),
      });
      setTestType('fixed');
      setAutoPause(true);
    }
  }, [visible, projectData.completes, form]);

  return (
    <SoftLaunchModalErrorBoundary>
      <Modal
        open={visible}
        title={<span><SafetyCertificateTwoTone twoToneColor="#52c41a" /> Soft Launch Setup</span>}
        onCancel={onCancel}
        onOk={handleOk}
        confirmLoading={loading}
        okText="Start Soft Launch"
        width={520}
        destroyOnClose
        maskClosable={!loading}
      >
        {formError && (
          <Alert
            type={manualOverride ? 'warning' : 'error'}
            message={manualOverride ? 'Manual Override Enabled' : 'Error'}
            description={<span>
              {formError}<br/>
              {!manualOverride && (
                <Button onClick={handleManualOverride} style={{marginTop: 8}}>Manual Override</Button>
              )}
              <Button type="link" href="mailto:support@example.com" style={{marginLeft: 8}}>Contact Support</Button>
            </span>}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          initialValues={{ testType: 'fixed', test_limit: Math.min(10, projectData.completes) }}
          onValuesChange={(changed, all) => {
            if (changed.testType) setTestType(changed.testType);
          }}
        >
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 8 }}>Test Parameters</Title>
            <Form.Item name="testType" label="Test Type">
              <Radio.Group>
                <Radio.Button value="fixed">Fixed Number</Radio.Button>
                <Radio.Button value="percentage">Percentage</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="test_limit"
              label={testType === 'fixed' ? 'Test Completes' : 'Test Percentage (%)'}
              rules={[{ required: true, message: 'Please enter a test limit' }, { validator: validateTestLimit }]}
            >
              <InputNumber
                min={testType === 'fixed' ? minFixed : minPct}
                max={testType === 'fixed' ? maxFixed : maxPct}
                style={{ width: 160 }}
                addonAfter={testType === 'fixed' ? '' : '%'}
                step={1}
                disabled={loading}
              />
            </Form.Item>
          </Card>

          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 8 }}>Cost Estimation</Title>
            <Alert
              type={costEstimate.cost > 0 ? 'info' : 'warning'}
              showIcon
              icon={<DollarCircleTwoTone twoToneColor="#faad14" />}
              message={
                <Space>
                  Estimated cost for test: <b>${costEstimate.cost.toFixed(2)}</b>
                  <Tooltip title="Based on your estimated CPI and test size.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              description={
                <Text type="secondary">
                  {costEstimate.testCount} completes × ${projectData.estimated_cpi || 5} CPI
                </Text>
              }
              style={{ marginBottom: 0 }}
            />
          </Card>

          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 8 }}>Auto-pause Settings</Title>
            <Form.Item style={{ marginBottom: 0 }}>
              <Checkbox checked={autoPause} onChange={e => setAutoPause(e.target.checked)}>
                Auto-pause project when test completes are reached
              </Checkbox>
              <div style={{ color: '#888', marginLeft: 24, fontSize: 13 }}>
                If enabled, your project will pause for your review once the test completes are collected.
              </div>
            </Form.Item>
          </Card>

          <Card size="small" style={{ marginBottom: 0 }}>
            <Title level={5} style={{ marginBottom: 8 }}>Why use Soft Launch?</Title>
            <Alert
              type="success"
              showIcon
              icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
              message="Reduce risk and optimize performance"
              description={
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Detects quality issues before full spend</li>
                  <li>Allows you to review early results</li>
                  <li>Minimizes cost exposure</li>
                  <li>Improves project confidence</li>
                </ul>
              }
            />
          </Card>
        </Form>
      </Modal>
    </SoftLaunchModalErrorBoundary>
  );
};

export default SoftLaunchModal;
