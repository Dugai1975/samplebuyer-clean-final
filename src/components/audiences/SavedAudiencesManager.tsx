"use client";

import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, Modal, Space, Typography, message } from 'antd';
import { SaveOutlined, DeleteOutlined, CopyOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SavedAudience {
  id: string;
  name: string;
  criteria: any;
  feasibility: any;
  created_at: string;
}

interface SavedAudiencesManagerProps {
  mode?: 'default' | 'select';
  onUseAudience?: (audience: SavedAudience) => void;
}

export const SavedAudiencesManager: React.FC<SavedAudiencesManagerProps> = ({ 
  mode = 'default',
  onUseAudience
}) => {
  const [savedAudiences, setSavedAudiences] = useState<SavedAudience[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<SavedAudience | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('saved_audiences');
    if (stored) {
      setSavedAudiences(JSON.parse(stored));
    }
  }, []);

  const handleUseAudience = (audience: SavedAudience) => {
    if (mode === 'select' && onUseAudience) {
      // In select mode, call the provided callback
      onUseAudience(audience);
    } else {
      // In default mode, redirect to feasibility with saved criteria
      const queryParams = new URLSearchParams({
        from_saved: 'true',
        audience_id: audience.id,
        completes: audience.criteria.completes.toString(),
        country: audience.criteria.country,
        incidence: audience.criteria.incidence_rate.toString(),
        loi: audience.criteria.loi_minutes.toString()
      }).toString();
      
      window.location.href = `/feasibility?${queryParams}`;
    }
  };

  const handleDeleteAudience = (id: string) => {
    const updated = savedAudiences.filter(a => a.id !== id);
    setSavedAudiences(updated);
    localStorage.setItem('saved_audiences', JSON.stringify(updated));
    message.success('Audience deleted');
  };

  const showAudienceDetails = (audience: SavedAudience) => {
    setSelectedAudience(audience);
    setDetailModalVisible(true);
  };

  const handleDuplicateAudience = (audience: SavedAudience) => {
    const newAudience = {
      ...audience,
      id: `${audience.id}-copy-${Date.now()}`,
      name: `${audience.name} (Copy)`,
      created_at: new Date().toISOString()
    };
    
    const updated = [...savedAudiences, newAudience];
    setSavedAudiences(updated);
    localStorage.setItem('saved_audiences', JSON.stringify(updated));
    message.success('Audience duplicated');
  };

  if (savedAudiences.length === 0) {
    return (
      <Card title="Saved Audiences" className="mb-6">
        <div className="text-center py-8 text-gray-500">
          <p>No saved audiences yet.</p>
          <p className="text-sm">Save audiences from feasibility checks to reuse them later.</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card title="Saved Audiences" className="mb-6">
        <List
          dataSource={savedAudiences}
          renderItem={(audience) => (
            <List.Item
              actions={[
                <Button 
                  key="use"
                  type="primary"
                  size="small"
                  onClick={() => handleUseAudience(audience)}
                >
                  Use
                </Button>,
                <Button
                  key="details"
                  size="small"
                  icon={<InfoCircleOutlined />}
                  onClick={() => showAudienceDetails(audience)}
                >
                  Details
                </Button>,
                <Button
                  key="duplicate"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleDuplicateAudience(audience)}
                >
                  Duplicate
                </Button>,
                <Button
                  key="delete"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteAudience(audience.id)}
                >
                  Delete
                </Button>
              ]}
            >
              <List.Item.Meta
                title={audience.name}
                description={
                  <Space direction="vertical" size="small">
                    <div>
                      <Tag color="blue">{audience.criteria.country}</Tag>
                      <Tag color="green">{audience.criteria.completes} completes</Tag>
                      <Tag color="orange">IR: {audience.criteria.incidence_rate}%</Tag>
                      <Tag color="purple">LOI: {audience.criteria.loi_minutes} min</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                      Created: {new Date(audience.created_at).toLocaleDateString()}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Audience Details Modal */}
      <Modal
        title={selectedAudience?.name}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="use" 
            type="primary" 
            onClick={() => {
              if (selectedAudience) handleUseAudience(selectedAudience);
              setDetailModalVisible(false);
            }}
          >
            Use This Audience
          </Button>
        ]}
      >
        {selectedAudience && (
          <div className="space-y-4">
            <div>
              <Text strong>Audience Criteria</Text>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <Text>Country:</Text>
                  <Text>{selectedAudience.criteria.country}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Completes:</Text>
                  <Text>{selectedAudience.criteria.completes}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Incidence Rate:</Text>
                  <Text>{selectedAudience.criteria.incidence_rate}%</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Survey Length:</Text>
                  <Text>{selectedAudience.criteria.loi_minutes} minutes</Text>
                </div>
                {selectedAudience.criteria.demographics && (
                  <div className="mt-2">
                    <Text strong>Demographics:</Text>
                    <div className="mt-1">
                      {Object.entries(selectedAudience.criteria.demographics).map(([key, value]) => (
                        <Tag key={key} className="mb-1">
                          {key}: {String(value)}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedAudience.feasibility && (
              <div>
                <Text strong>Feasibility Results</Text>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <Text>Estimated Cost:</Text>
                    <Text>${selectedAudience.feasibility.estimated_cost.toFixed(2)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Estimated Time:</Text>
                    <Text>{selectedAudience.feasibility.estimated_time}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Recommended CPI:</Text>
                    <Text>${selectedAudience.feasibility.recommended_cpi.toFixed(2)}</Text>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SavedAudiencesManager;
