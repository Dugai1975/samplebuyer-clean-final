import React, { useState, useEffect } from 'react';
import { Form, Input, Tag } from 'antd';
import { RocketOutlined, InfoCircleOutlined } from '@ant-design/icons';
import MobileFullScreenDialog from './MobileFullScreenDialog';

interface MobileLaunchModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (name: string, description: string) => void;
  defaultName: string;
  defaultDescription: string;
  loading?: boolean;
  incidenceRateTouched?: boolean;
  incidenceRateValue?: number;
  projectSummary: {
    cost: string;
    time: string;
    country: string;
    completes: number;
    loi: string;
    ir: number;
  };
}

const MobileLaunchModal: React.FC<MobileLaunchModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  defaultName,
  defaultDescription,
  loading,
  incidenceRateTouched,
  incidenceRateValue,
  projectSummary
}) => {
  // Debug log to help troubleshoot visibility issues
  useEffect(() => {
    console.log('MobileLaunchModal visible prop:', visible);
  }, [visible]);
  
  // If not visible, don't render anything
  if (!visible) return null;
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);

  // Reset values when modal opens
  useEffect(() => {
    if (visible) {
      setName(defaultName);
      setDescription(defaultDescription);
    }
  }, [defaultName, defaultDescription, visible]);

  // Custom title component for the header
  const titleComponent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <RocketOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
      <span style={{ fontWeight: 600 }}>Finalize & Launch Project</span>
    </div>
  );

  return (
    <MobileFullScreenDialog
      visible={visible}
      title={titleComponent}
      onCancel={onCancel}
      onConfirm={() => onConfirm(name, description)}
      confirmText="Launch"
      cancelText="Cancel"
      confirmLoading={loading}
    >
      {/* Warning for untouched default incidence rate */}
      {(!incidenceRateTouched && (incidenceRateValue === 30)) && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '24px'
        }}>
          <span style={{ marginTop: '2px', marginRight: '8px' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="10" fill="#FDE68A"/>
              <path d="M10 6v4m0 4h.01" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <div style={{ fontSize: '14px', color: '#92400e' }}>
            <b>Incidence Rate:</b> You are using the <b>default value (30%)</b>. This can significantly affect your project's cost and feasibility. Please review and confirm this is correct for your study.
          </div>
        </div>
      )}

      {/* Project Summary */}
      <div style={{
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '16px',
          fontSize: '16px',
          fontWeight: 500,
          color: '#374151'
        }}>
          <InfoCircleOutlined style={{ color: '#60a5fa' }} />
          <span>Project Summary</span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px',
          fontSize: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', marginRight: '12px', minWidth: '70px' }}>Cost:</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{projectSummary.cost}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', marginRight: '12px', minWidth: '70px' }}>Time:</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{projectSummary.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', marginRight: '12px', minWidth: '70px' }}>Country:</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{projectSummary.country}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', marginRight: '12px', minWidth: '70px' }}>Completes:</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{projectSummary.completes}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', marginRight: '12px', minWidth: '70px' }}>LOI:</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{projectSummary.loi}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', marginRight: '12px', minWidth: '70px' }}>IR:</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{projectSummary.ir}%</span>
          </div>
        </div>
      </div>

      {/* Project Name */}
      <Form layout="vertical">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#ef4444', marginRight: '4px' }}>*</span>
          <span style={{ fontSize: '16px', fontWeight: 500, color: '#374151' }}>Project Name</span>
          <div style={{ marginLeft: 'auto' }}>
            <Tag color="blue" style={{ 
              fontSize: '12px', 
              border: 0, 
              backgroundColor: '#eff6ff', 
              color: '#3b82f6',
              padding: '2px 12px',
              borderRadius: '9999px',
              fontWeight: 'normal'
            }}>
              Auto-generated
            </Tag>
          </div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <Input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            maxLength={80} 
            size="large"
            style={{
              width: '100%',
              fontWeight: 500,
              borderColor: '#d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '16px'
            }}
          />
        </div>

        {/* Project Description */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '16px', fontWeight: 500, color: '#374151' }}>Project Description</span>
          <div style={{ marginLeft: 'auto' }}>
            <Tag color="blue" style={{ 
              fontSize: '12px', 
              border: 0, 
              backgroundColor: '#eff6ff', 
              color: '#3b82f6',
              padding: '2px 12px',
              borderRadius: '9999px',
              fontWeight: 'normal'
            }}>
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
            style={{
              width: '100%',
              fontSize: '15px',
              borderColor: '#d1d5db',
              borderRadius: '6px'
            }}
            placeholder="Brief description of your research project"
          />
        </div>
      </Form>
    </MobileFullScreenDialog>
  );
};

export default MobileLaunchModal;
