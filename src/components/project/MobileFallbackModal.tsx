import React, { ReactNode, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface MobileFallbackModalProps {
  visible: boolean;
  title: ReactNode;
  children: ReactNode;
  onCancel: () => void;
  onOk: () => void;
  okText: string;
  cancelText?: string;
  confirmLoading?: boolean;
}

const MobileFallbackModal: React.FC<MobileFallbackModalProps> = ({
  visible,
  title,
  children,
  onCancel,
  onOk,
  okText,
  cancelText = 'Cancel',
  confirmLoading,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      // Focus trap
      modalRef.current?.focus();
      
      // Prevent scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>{title}</div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
            }}
          >
            <CloseOutlined />
          </button>
        </div>
        
        {/* Content */}
        <div style={{
          padding: '20px',
          flex: 1,
          overflowY: 'auto',
        }}>
          {children}
        </div>
        
        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '12px',
        }}>
          <Button block size="large" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button 
            block 
            type="primary" 
            size="large" 
            onClick={onOk}
            loading={confirmLoading}
          >
            {okText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileFallbackModal;
