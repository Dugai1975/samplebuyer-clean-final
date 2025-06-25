import React, { ReactNode, useEffect, useCallback, useRef, useState } from 'react';
import { Button } from 'antd';
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
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Handle body scroll prevention and viewport fixes
  useEffect(() => {
    if (visible) {
      // Store original styles
      const originalStyle = window.getComputedStyle(document.body);
      const originalPosition = originalStyle.position;
      const originalTop = originalStyle.top;
      const originalWidth = originalStyle.width;
      
      // Get current scroll position
      const scrollY = window.scrollY;
      
      // Apply mobile-safe body locking
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('mobile-modal-open');
      
      // Store scroll position for restoration
      document.body.setAttribute('data-scroll-y', scrollY.toString());
      
      return () => {
        // Restore original body styles
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = '';
        document.body.classList.remove('mobile-modal-open');
        
        // Restore scroll position
        const storedScrollY = document.body.getAttribute('data-scroll-y');
        if (storedScrollY) {
          window.scrollTo(0, parseInt(storedScrollY, 10));
          document.body.removeAttribute('data-scroll-y');
        }
      };
    }
  }, [visible]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onCancel();
    }
  }, [onCancel]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onCancel();
      }
    };
    
    if (visible) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onCancel]);

  // Handle touch events for swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    // Determine if swipe was significant enough to dismiss
    const distance = touchEnd - touchStart;
    const isSignificantSwipe = distance > 100; // Threshold in pixels
    
    // Only dismiss if swiping downward significantly
    if (isSignificantSwipe && distance > 0) {
      onCancel();
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Focus trap for accessibility
  useEffect(() => {
    if (visible && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        // Focus first element
        (focusableElements[0] as HTMLElement).focus();
        
        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            // Shift + Tab
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } 
            // Tab
            else if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        };
        
        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
      }
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div 
      ref={overlayRef}
      className="mobile-modal-overlay"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`mobile-modal-container ${className}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mobile-modal-header">
          <div className="mobile-modal-title">{title}</div>
          <button 
            className="mobile-modal-close" 
            onClick={onCancel}
            aria-label="Close modal"
          >
            <CloseOutlined />
          </button>
        </div>
        <div 
          ref={contentRef}
          className="mobile-modal-content"
        >
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
