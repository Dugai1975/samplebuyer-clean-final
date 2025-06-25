import React, { ReactNode, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './MobileModalWrapper.css';

interface MobileModalWrapperProps {
  visible: boolean;
  title: ReactNode;
  children: ReactNode;
  onCancel: () => void;
  onOk: () => void;
  okText: string;
  cancelText?: string;
  confirmLoading?: boolean;
  className?: string;
}

const MobileModalWrapper: React.FC<MobileModalWrapperProps> = ({
  visible,
  title,
  children,
  onCancel,
  onOk,
  okText,
  cancelText = 'Cancel',
  confirmLoading,
  className = '',
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (visible) {
      document.body.classList.add('mobile-modal-open');
    } else {
      document.body.classList.remove('mobile-modal-open');
    }
    return () => {
      document.body.classList.remove('mobile-modal-open');
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="mobile-modal-overlay">
      <div className={`mobile-modal-container ${className}`}>
        <div className="mobile-modal-header">
          <div className="mobile-modal-title">{title}</div>
          <button className="mobile-modal-close" onClick={onCancel}>
            <CloseOutlined />
          </button>
        </div>
        <div className="mobile-modal-content">
          {children}
        </div>
        <div className="mobile-modal-footer">
          <Button 
            block 
            size="large" 
            onClick={onCancel}
            className="mobile-modal-cancel-btn"
          >
            {cancelText}
          </Button>
          <Button 
            block 
            type="primary" 
            size="large" 
            onClick={onOk}
            loading={confirmLoading}
            className="mobile-modal-ok-btn"
          >
            {okText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileModalWrapper;
