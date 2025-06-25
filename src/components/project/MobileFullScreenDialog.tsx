import React, { ReactNode, useEffect } from 'react';

interface MobileFullScreenDialogProps {
  visible: boolean;
  title?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmLoading?: boolean;
  children: ReactNode;
}

const MobileFullScreenDialog: React.FC<MobileFullScreenDialogProps> = ({
  visible,
  title = 'Finalize Project',
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Launch',
  confirmLoading,
  children
}) => {
  // Prevent body scrolling when dialog is open
  useEffect(() => {
    if (visible) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scroll position when dialog is closed
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [visible]);

  if (!visible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button 
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 12px',
            fontSize: '16px',
            color: '#666',
            cursor: 'pointer',
          }}
        >
          {cancelText}
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{title}</h2>
        <button 
          onClick={onConfirm}
          disabled={confirmLoading}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 12px',
            fontSize: '16px',
            color: '#1890ff',
            fontWeight: 500,
            cursor: 'pointer',
            opacity: confirmLoading ? 0.6 : 1,
          }}
        >
          {confirmLoading ? 'Loading...' : confirmText}
        </button>
      </div>
      <div style={{ 
        flex: 1, 
        padding: '16px', 
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {children}
      </div>
    </div>
  );
};

export default MobileFullScreenDialog;
