'use client';

import React from 'react';
import { Button } from 'antd';
import { SaveOutlined, RocketOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BottomStickyBarProps {
  breadcrumbs: BreadcrumbItem[];
  onSave?: () => void;
  onLaunch?: () => void;
  saveDisabled?: boolean;
  launchDisabled?: boolean;
  className?: string;
}

const BottomStickyBar: React.FC<BottomStickyBarProps> = ({
  breadcrumbs,
  onSave,
  onLaunch,
  saveDisabled = false,
  launchDisabled = false,
  className = '',
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className={`sticky-bottom-bar ${className}`}>
      <div className="breadcrumb-container">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="breadcrumb-separator">/</span>}
            <div className="breadcrumb-item">
              {item.href ? (
                <Link href={item.href} className="breadcrumb-link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumb-current">{item.label}</span>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
      
      <div className="sticky-bottom-bar-buttons">
        {onSave && (
          <Button 
            icon={<SaveOutlined />} 
            onClick={onSave}
            disabled={saveDisabled}
            size={isMobile ? "middle" : "large"}
            className="mr-3"
          >
            Save
          </Button>
        )}
        
        {onLaunch && (
          <Button 
            type="primary" 
            icon={<RocketOutlined />}
            onClick={onLaunch}
            disabled={launchDisabled}
            size={isMobile ? "middle" : "large"}
            className={!launchDisabled ? "bg-blue-500 hover:bg-blue-600 border-blue-500" : ""}
          >
            Launch Project
          </Button>
        )}
      </div>
    </div>
  );
};

export default BottomStickyBar;
