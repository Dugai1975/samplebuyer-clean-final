"use client";

import React from 'react';
import { Button, Card, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { SavedAudiencesManager } from '@/components/audiences/SavedAudiencesManager';

const { Title } = Typography;

export default function SavedAudiencesPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  const handleNewFeasibility = () => {
    router.push('/feasibility');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
                type="text"
              >
                Back to Dashboard
              </Button>
            </div>
            <Button 
              type="primary" 
              onClick={handleNewFeasibility}
            >
              New Feasibility Check
            </Button>
          </div>
        </Card>

        <div className="mb-6">
          <Title level={2}>Saved Audiences</Title>
          <p className="text-gray-600">
            Manage your saved audience configurations and reuse them for new projects.
          </p>
        </div>

        <SavedAudiencesManager />
      </div>
    </div>
  );
}
