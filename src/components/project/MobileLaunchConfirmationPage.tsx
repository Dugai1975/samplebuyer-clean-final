import React, { useState, useEffect } from 'react';
import { Form, Input, Tag } from 'antd';
import { ArrowLeftOutlined, RocketOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface MobileLaunchConfirmationPageProps {
  defaultName: string;
  defaultDescription: string;
  onCancel: () => void;
  onConfirm: (name: string, description: string) => void;
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

const MobileLaunchConfirmationPage: React.FC<MobileLaunchConfirmationPageProps> = ({
  defaultName,
  defaultDescription,
  onCancel,
  onConfirm,
  loading = false,
  incidenceRateTouched,
  incidenceRateValue,
  projectSummary
}) => {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);

  // Reset values when component mounts
  useEffect(() => {
    setName(defaultName);
    setDescription(defaultDescription);
  }, [defaultName, defaultDescription]);

  return (
    <div className="fixed inset-0 bg-white z-[2000] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
        <button 
          onClick={onCancel}
          className="flex items-center text-gray-600 font-medium"
          style={{ background: 'none', border: 'none', padding: '8px 0' }}
        >
          <ArrowLeftOutlined style={{ marginRight: '8px' }} />
          Back
        </button>
        <h1 className="text-lg font-semibold m-0 flex items-center">
          <RocketOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
          Setup Project
        </h1>
        <div style={{ width: '60px' }}></div> {/* Spacer for balance */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Warning for untouched default incidence rate */}
        {(!incidenceRateTouched && (incidenceRateValue === 30)) && (
          <div className="flex items-start bg-amber-50 border border-amber-100 rounded-md p-3 mb-6">
            <span className="mt-0.5 mr-2 flex-shrink-0">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="10" fill="#FDE68A"/>
                <path d="M10 6v4m0 4h.01" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div className="text-sm text-amber-800">
              <b>Incidence Rate:</b> You are using the <b>default value (30%)</b>. This can significantly affect your project's cost and feasibility. Please review and confirm this is correct for your study.
            </div>
          </div>
        )}

        {/* Project Summary */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4 text-base font-medium text-gray-700">
            <InfoCircleOutlined style={{ color: '#60a5fa' }} />
            <span>Project Summary</span>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div className="flex items-center">
              <span className="text-gray-500 mr-2 min-w-[70px]">Cost:</span>
              <span className="font-medium text-gray-800">{projectSummary.cost}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2 min-w-[70px]">Time:</span>
              <span className="font-medium text-gray-800">{projectSummary.time}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2 min-w-[70px]">Country:</span>
              <span className="font-medium text-gray-800">{projectSummary.country}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2 min-w-[70px]">Completes:</span>
              <span className="font-medium text-gray-800">{projectSummary.completes}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2 min-w-[70px]">LOI:</span>
              <span className="font-medium text-gray-800">{projectSummary.loi}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2 min-w-[70px]">IR:</span>
              <span className="font-medium text-gray-800">{projectSummary.ir}%</span>
            </div>
          </div>
        </div>

        {/* Project Name */}
        <Form layout="vertical" className="mb-6">
          <div className="flex items-center mb-2">
            <span className="text-red-500 mr-1">*</span>
            <span className="text-base font-medium text-gray-700">Project Name</span>
            <div className="ml-auto">
              <Tag color="blue" className="text-xs border-0 bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
                Auto-generated
              </Tag>
            </div>
          </div>
          <Input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            maxLength={80} 
            size="large"
            className="w-full font-medium"
          />
        </Form>

        {/* Project Description */}
        <Form layout="vertical">
          <div className="flex items-center mb-2">
            <span className="text-base font-medium text-gray-700">Project Description</span>
            <div className="ml-auto">
              <Tag color="blue" className="text-xs border-0 bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
                Auto-generated
              </Tag>
            </div>
          </div>
          <Input.TextArea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={3} 
            maxLength={200} 
            className="w-full text-sm"
            placeholder="Brief description of your research project"
          />
        </Form>
      </div>

      {/* Footer with action button */}
      <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0 flex gap-2">
  <button
    onClick={onCancel}
    disabled={loading}
    className="flex-1 py-3 px-4 rounded-md border border-gray-300 text-gray-700 font-medium bg-white hover:bg-gray-50 transition"
    type="button"
  >
    Cancel
  </button>
  <button
    onClick={() => onConfirm(name, description)}
    disabled={loading}
    className={`flex-1 py-3 px-4 rounded-md font-medium flex items-center justify-center border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
    type="button"
    style={{ minWidth: 0 }}
  >
    {loading ? 'Processing...' : 'Create Project'}
    {!loading && <RocketOutlined style={{ marginLeft: '8px' }} />}
  </button>
</div>
    </div>
  );
};

export default MobileLaunchConfirmationPage;
