'use client';

import React from 'react';
import { Button, Tooltip, Badge } from 'antd';
import { PlusOutlined, RocketOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BottomStickyBarProps {
  breadcrumbs: BreadcrumbItem[];
  onAddSource?: () => void;
  onLaunch?: () => void;
  onToggleActiveSources?: () => void;
  hasActiveSources?: boolean;
  sourcesCount?: number;
  launchDisabled?: boolean;
  className?: string;
}

const BottomStickyBar: React.FC<BottomStickyBarProps> = ({
  breadcrumbs,
  onAddSource,
  onLaunch,
  onToggleActiveSources,
  hasActiveSources = false,
  sourcesCount = 0,
  launchDisabled = true,
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
        {onAddSource && (
          <Tooltip title="Add a new audience source to this project">
            <Button 
              icon={<PlusOutlined />} 
              onClick={onAddSource}
              size={isMobile ? "middle" : "large"}
              className="mr-3"
            >
              Add Source
            </Button>
          </Tooltip>
        )}
        
        {onToggleActiveSources && sourcesCount > 0 && (
          <Tooltip title={hasActiveSources ? "Pause all active sources" : "Resume all paused sources"}>
            <Button 
              icon={hasActiveSources ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={onToggleActiveSources}
              size={isMobile ? "middle" : "large"}
              className="mr-3"
              danger={hasActiveSources}
            >
              {hasActiveSources ? "Pause All" : "Resume All"}
            </Button>
          </Tooltip>
        )}
        
        {onLaunch && (
          <Tooltip title={sourcesCount === 0 ? "Add at least one source to launch project" : "Launch this project"}>
            <Badge count={sourcesCount} size="small" offset={[-5, 5]} showZero>
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
            </Badge>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default BottomStickyBar;
