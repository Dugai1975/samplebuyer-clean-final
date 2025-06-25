import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './MobileModal.css';
import './ModalFix.js';

const { TextArea } = Input;
const { Text } = Typography;

interface CustomAudienceRequestModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit?: (description: string) => Promise<void> | void;
}

const CustomAudienceRequestModal: React.FC<CustomAudienceRequestModalProps> = ({ visible, onCancel, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOk = async () => {
    if (!description.trim()) {
      message.warning('Please describe your custom audience criteria.');
      return;
    }
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(description);
      }
      setDescription('');
      message.success('Your request has been submitted! Our team will follow up soon.');
      onCancel();
    } catch (e) {
      message.error('There was an error submitting your request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setDescription('');
    onCancel();
  };

  return (
    <Modal
      open={visible}
      title={
        <span className="flex items-center">
          <SendOutlined className="mr-2 text-blue-500" />
          <span className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>Request Custom Audience</span>
        </span>
      }
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Submit Request"
      confirmLoading={submitting}
      destroyOnHidden
      width={isMobile ? '94%' : 420}
      centered
      className="custom-audience-request-modal"
      styles={{
        body: { padding: isMobile ? '16px 12px' : '28px 20px' },
        content: { maxWidth: isMobile ? '100%' : 420 },
        mask: { zIndex: 1050 },
        wrapper: { zIndex: 1051 }
      }}
      wrapClassName="mobile-modal-wrapper"
      okButtonProps={{
        className: 'bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600 text-white font-medium w-full md:w-auto',
        size: 'large'
      }}
      cancelButtonProps={{
        size: 'large',
        className: 'border-gray-300 hover:border-gray-400 font-medium w-full md:w-auto'
      }}
    >
      <div className={`mb-${isMobile ? '2' : '3'}`}>
        <Text type="secondary" className={`block mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Can't find your audience? Describe your ideal respondent or targeting needs below. Our team will review and get in touch to help.
        </Text>
        <TextArea
          autoSize={{ minRows: isMobile ? 3 : 4, maxRows: 8 }}
          maxLength={600}
          showCount
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the custom audience or criteria you need..."
          disabled={submitting}
          className="w-full text-sm border-gray-200 hover:border-blue-400 focus:border-blue-500 rounded-md"
        />
      </div>
    </Modal>
  );
};

export default CustomAudienceRequestModal;
