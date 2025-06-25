"use client";

import React, { useState } from 'react';
import { Card, Skeleton, Button, Tag, Collapse, Row, Col, Tooltip } from 'antd';
import { FeasibilityData } from '@/types';
import { ArrowUpOutlined, ArrowDownOutlined, SaveOutlined, RocketOutlined } from '@ant-design/icons';

interface MobileFeasibilityPanelProps {
  feasibilityData: FeasibilityData | null;
  isCalculating: boolean;
  isComplete?: boolean;
  onSaveDraft?: () => void;
  onCreateProject?: (e?: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  demographics?: Record<string, string[]>;
}

const MobileFeasibilityPanel: React.FC<MobileFeasibilityPanelProps> = ({
  feasibilityData,
  isCalculating,
  isComplete = false,
  onSaveDraft = () => {},
  onCreateProject = () => {},
  className = '',
  demographics = {}
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
    // Trigger haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Only show loading when calculation is actually happening (not during initial form filling)
  // This matches the desktop panel behavior
  if (isCalculating && demographics && Object.keys(demographics).some(key => {
    const values = demographics[key];
    return Array.isArray(values) && values.length > 0;
  })) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-[1001] ${className}`}>
        <div className="p-4">
          <Skeleton active paragraph={{ rows: 1 }} />
          <div className="flex justify-between mt-4">
            <Skeleton.Button active size="large" shape="round" />
            <Skeleton.Button active size="large" shape="round" />
          </div>
        </div>
      </div>
    );
  }

  if (!feasibilityData) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-[1001] ${className}`}>
        <div className="p-4">
          <div className="text-center text-gray-500 py-2">
            Complete project details to see feasibility
          </div>
          <div className="flex justify-between mt-4">
            <Button 
              icon={<SaveOutlined />} 
              onClick={onSaveDraft}
              size="large"
              className="min-h-[44px] min-w-[44px]"
            >
              Save Draft
            </Button>
            <Button 
              type="primary" 
              disabled 
              size="large"
              className="min-h-[44px] min-w-[44px]"
            >
              Create Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-[1001] transition-transform duration-300 ${className}`}
      style={{
        transform: expanded ? 'translateY(0)' : 'translateY(0)',
        maxHeight: expanded ? '80vh' : 'auto',
        overflowY: expanded ? 'auto' : 'hidden'
      }}
    >
      {/* Collapsed View */}
      <div className="p-4">
        {/* Tag/status row */}
        <div 
          className="flex items-center justify-between mb-4 cursor-pointer gap-2" 
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Tag color={feasibilityData.feasible ? "success" : "error"} className="flex-shrink-0">
              {feasibilityData.feasible ? "Feasible" : "Not Feasible"}
            </Tag>
            {expanded ? (
              <ArrowDownOutlined className="text-blue-500 flex-shrink-0" />
            ) : (
              <ArrowUpOutlined className="text-blue-500 flex-shrink-0" />
            )}
          </div>
          <Tag color="blue" className="ml-2 whitespace-nowrap flex-shrink-0">{feasibilityData.estimated_time}</Tag>
        </div>

        {/* Summary Stats */}
        <div className="flex w-full mb-4 gap-0">
          <div className="flex-1 flex flex-col items-center justify-center border-r last:border-r-0">
            <span className="text-xs text-gray-500 mb-1">Cost per Complete</span>
            <span className="text-2xl font-bold leading-tight">${feasibilityData.recommended_cpi.toFixed(2)}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 mb-1">Total Budget</span>
            <span className="text-2xl font-bold leading-tight">${feasibilityData.estimated_cost.toFixed(2)}</span>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="pt-4 border-t border-gray-200 text-left">
            <div className="mb-4">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                <span className="text-base font-medium">Estimated Completion:</span>
                <span className="font-bold text-lg">{feasibilityData.estimated_time}</span>
              </div>
            </div>
            
            {/* Current Targeting */}
            {Object.keys(demographics).length > 0 && (
              <div className="mb-4">
                <h5 className="text-base font-medium mb-2">🎯 Current Targeting</h5>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="space-y-2">
                    {Object.entries(demographics).map(([category, values]) => {
                      if (!Array.isArray(values) || values.length === 0) return null;
                      // Merge core and advanced options for lookup
                      const categoryLabels: Record<string, string> = {
                        gender: 'Gender',
                        age_ranges: 'Age',
                        income: 'Income',
                        employment: 'Employment',
                        education: 'Education',
                        marital_status: 'Marital Status',
                        children: 'Children',
                        ethnicity: 'Ethnicity',
                        location_type: 'Location',
                        device_preference: 'Device'
                      };
                      
                      return (
                        <div key={category} className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2 py-1 border rounded text-blue-600 border-blue-200 bg-blue-50 text-xs font-medium">
                            {categoryLabels[category] || category}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {values.map((value) => (
                              <span key={value} className="px-2 py-1 border rounded bg-gray-50 text-xs font-medium">
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex w-full gap-3 mt-4 justify-end">
          <Button 
            icon={<SaveOutlined />} 
            onClick={onSaveDraft}
            size="large"
            className="min-h-[44px] min-w-[44px]"
          >
            Save Draft
          </Button>
          <Button 
            type="primary" 
            icon={<RocketOutlined />}
            onClick={onCreateProject}
            disabled={!isComplete}
            size="large"
            className={`min-h-[44px] min-w-[44px] ${isComplete ? 'bg-green-500 hover:bg-green-600 border-green-500' : ''}`}
          >
            Finalize & Launch
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileFeasibilityPanel;
