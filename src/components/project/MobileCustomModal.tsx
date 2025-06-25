import React, { ReactNode } from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './MobileModal.css';

interface MobileCustomModalProps {
  visible: boolean;
  title: ReactNode;
  onCancel: () => void;
  onOk: () => void;
  okText: string;
  cancelText?: string;
  children: ReactNode;
  confirmLoading?: boolean;
  width?: string | number;
  className?: string;
}

const MobileCustomModal: React.FC<MobileCustomModalProps> = ({
  visible,
  title,
  onCancel,
  onOk,
  okText,
  cancelText = 'Cancel',
  children,
  confirmLoading,
  width = '90vw',
  className = '',
}) => {
  if (!visible) return null;

  return (
    <div className="mobile-custom-modal-overlay">
      <div 
        className={`mobile-custom-modal ${className}`}
        style={{ width }}
      >
        <div className="mobile-custom-modal-header">
          <div className="mobile-custom-modal-title">{title}</div>
          <button 
            className="mobile-custom-modal-close" 
            onClick={onCancel}
            aria-label="Close"
          >
            <CloseOutlined />
          </button>
        </div>
        <div className="mobile-custom-modal-body">
          {children}
        </div>
        <div className="mobile-custom-modal-footer">
          <Button
            onClick={onCancel}
            size="large"
            className="mobile-custom-modal-cancel-button"
            block
          >
            {cancelText}
          </Button>
          <Button
            type="primary"
            onClick={onOk}
            loading={confirmLoading}
            size="large"
            className="mobile-custom-modal-ok-button"
            block
          >
            {okText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileCustomModal;
