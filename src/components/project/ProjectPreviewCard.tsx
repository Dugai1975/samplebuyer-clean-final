import React, { useState } from 'react';
import { Card, Input, Button, Tag, Typography, Tooltip } from 'antd';
import { SaveOutlined, RocketOutlined, EditOutlined } from '@ant-design/icons';
import type { FeasibilityData } from '@/types';
import type { ProjectPreview } from '@/types/enhanced';

interface ProjectPreviewCardProps {
  projectPreview: ProjectPreview;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSaveDraft: () => void;
  onLaunchCollect: () => void;
  feasibilityData: FeasibilityData;
}

export const ProjectPreviewCard: React.FC<ProjectPreviewCardProps> = ({
  projectPreview,
  onNameChange,
  onDescriptionChange,
  onSaveDraft,
  onLaunchCollect,
  feasibilityData,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [name, setName] = useState(projectPreview.name);
  const [description, setDescription] = useState(projectPreview.description);
  const [nameError, setNameError] = useState('');
  const [descError, setDescError] = useState('');

  const validateName = (val: string) => {
    if (!val.trim()) {
      setNameError('Project name cannot be empty');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateDesc = (val: string) => {
    if (val.length > 200) {
      setDescError('Description too long (max 200 chars)');
      return false;
    }
    setDescError('');
    return true;
  };

  const handleNameSave = () => {
    if (validateName(name)) {
      onNameChange(name);
      setEditingName(false);
    }
  };

  const handleDescSave = () => {
    if (validateDesc(description)) {
      onDescriptionChange(description);
      setEditingDescription(false);
    }
  };

  return (
    <Card
      className="animate-fade-in border-blue-400 border-l-4 shadow-lg"
      title={
        <div className="flex items-center gap-2">
          {editingName ? (
            <Input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onPressEnter={handleNameSave}
              onBlur={handleNameSave}
              maxLength={60}
              status={nameError ? 'error' : ''}
            />
          ) : (
            <span className="font-bold text-lg">
              {name}
              <Tooltip title="Edit project name">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => setEditingName(true)}
                  className="ml-2"
                />
              </Tooltip>
            </span>
          )}
          {nameError && <span className="text-red-500 text-xs ml-2">{nameError}</span>}
        </div>
      }
      extra={<Tag color="blue">Preview</Tag>}
      style={{ marginBottom: 24, transition: 'box-shadow 0.3s' }}
      bodyStyle={{ paddingTop: 20 }}
    >
      <div className="mb-3">
        <Typography.Text type="secondary">Description:</Typography.Text>
        {editingDescription ? (
          <Input.TextArea
            autoFocus
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={handleDescSave}
            maxLength={200}
            rows={2}
            status={descError ? 'error' : ''}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-gray-700">{description}</span>
            <Tooltip title="Edit description">
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => setEditingDescription(true)}
              />
            </Tooltip>
          </div>
        )}
        {descError && <div className="text-red-500 text-xs mt-1">{descError}</div>}
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div>
          <Typography.Text strong>Estimated Cost:</Typography.Text>
          <div className="text-green-600 font-semibold text-lg">
            ${projectPreview.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <Typography.Text strong>Timeline:</Typography.Text>
          <div className="text-blue-600 font-semibold text-lg">
            {projectPreview.timeline}
          </div>
        </div>
        <div>
          <Typography.Text strong>CPI:</Typography.Text>
          <div className="text-purple-600 font-semibold text-lg">
            ${projectPreview.cpi.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <Button
          icon={<SaveOutlined />}
          size="large"
          onClick={onSaveDraft}
          style={{ background: '#e6f7ff', color: '#1890ff', borderColor: '#91d5ff' }}
        >
          💾 Save as Draft
        </Button>
        <Button
          icon={<RocketOutlined />}
          type="primary"
          size="large"
          onClick={onLaunchCollect}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
        >
          🚀 Launch & Collect
        </Button>
      </div>
    </Card>
  );
};

export default ProjectPreviewCard;
