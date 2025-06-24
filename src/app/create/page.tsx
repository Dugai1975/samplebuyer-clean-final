"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { UnifiedProjectCreator } from '@/components/project/UnifiedProjectCreator';
import { ProjectCreationData } from '@/types';
import { apiService } from '@/services/api';

export default function CreateProjectPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push('/');
  };

  const handleComplete = async (data: ProjectCreationData) => {
    try {
      message.loading('Creating project...', 0);
      
      // Create project via API
      const project = await apiService.createProject(data);
      
      message.destroy();
      message.success('Project created successfully!');
      
      // FIX: Navigate to the correct project detail page with the project ID
      // The tabs are at /projectDetail and we need to pass the project ID as a query parameter
      router.push(`/projectDetail?id=${project.uuid}`);
      
    } catch (error) {
      message.destroy();
      message.error('Failed to create project. Please try again.');
      console.error('Project creation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedProjectCreator
        onCancel={handleCancel}
        onComplete={(data) => { void handleComplete(data); }}
      />
    </div>
  );
}
