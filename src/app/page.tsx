'use client';

import React, { useState } from 'react';
import { Button, Typography, Card, Row, Col } from 'antd';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useFeatureFlagContext } from '@/components/shared/FeatureFlagProvider';
import { FeatureFlagDebugger } from '@/components/shared/FeatureFlagDebugger';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { EnhancedProject } from '@/types/enhanced';
import { MobileProjectCard } from '@/components/mobile/MobileProjectCard';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { AIProjectDescriber } from '@/components/ai/AIProjectDescriber';

const { Title } = Typography;

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { userContext } = useFeatureFlagContext();
  const { projects: baseProjects, loading, error, refreshProjects } = useEnhancedProjects();
  const { projects, lastUpdate, isOnline } = useRealTimeUpdates(baseProjects);
  const { isMobile } = useMobileDetection();

  const useModernCards = useFeatureFlag('modern_project_cards', userContext);
  const useRealTimeFeatures = useFeatureFlag('real_time_updates', userContext);
  const roleAdaptation = useFeatureFlag('role_adaptation', userContext);
  const [selectedProject, setSelectedProject] = useState<EnhancedProject | null>(null);

  const handleProjectView = (project: EnhancedProject) => {
    setSelectedProject(project);
    router.push(`/monitor/${project.uuid}`);
  };

  const handleCreateProject = () => {
    router.push('/create');
  };

  const renderMobileProjects = () => (
    <div className="p-4 space-y-4">
      {projects.map((project: EnhancedProject) => (
        <MobileProjectCard
          key={project.uuid}
          project={project}
          onView={handleProjectView}
          onToggleStatus={() => {}}
        />
      ))}
    </div>
  );

  const renderDesktopProjects = () => (
    <ProjectGrid
      projects={projects}
      loading={loading}
      onProjectView={handleProjectView}
      onProjectEdit={() => {}}
    />
  );

  if (loading) {
    return (
      <div className="p-6">
        <FeatureFlagDebugger />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} loading={true} style={{ height: '280px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <FeatureFlagDebugger />
        <Card>
          <div className="text-center py-8">
            <p className="text-red-500">Error: {error}</p>
            <Button onClick={refreshProjects} className="mt-4">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={isMobile ? 'mobile-layout' : 'p-6'}>
      <FeatureFlagDebugger />
      {isMobile ? (
        <>
          <div className="p-4">
            <h1 className="text-xl font-bold mb-2">Projects</h1>
            <p className="text-gray-600 text-sm mb-4">
              Manage your sample collection projects
            </p>
          </div>
          {useModernCards ? renderMobileProjects() : (
            <div className="p-4">
              <div className="text-center py-8 bg-white rounded-lg">
                <p>Mobile project cards coming soon!</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title level={2} className="mb-1">Projects Dashboard</Title>
              <div className="flex items-center space-x-2">
                <p className="text-gray-600">
                  Manage and monitor your sample collection projects
                </p>
                {useRealTimeFeatures && (
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 pulse-animation' : 'bg-red-500'}`} />
                    <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                      {isOnline ? 'Live' : 'Offline'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateProject}
              className="bg-green-500 hover:bg-green-600 border-green-500"
            >
              Create Project
            </Button>
          </div>
          <Card 
            className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border-2 border-dashed border-purple-300 hover:border-purple-400 transition-all duration-300 mb-6 shadow-lg"
          >
            <div className="py-4">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-2 shadow-md">
                  <ThunderboltOutlined className="text-3xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Launch in 60 Seconds</h3>
                <p className="text-gray-600 mb-4">Find your perfect audience and launch instantly</p>
              </div>
              
              <div className="mb-5">
                <AIProjectDescriber 
                  compact={true} 
                  onDescriptionGenerated={(description, projectName) => {
                    if (description) {
                      // Store the generated description and project name in session storage
                      // so they can be retrieved on the create page
                      sessionStorage.setItem('audienceDescription', description);
                      sessionStorage.setItem('projectName', projectName);
                      router.push('/create');
                    }
                  }}
                />
              </div>
              
              <div className="flex justify-center">
                <Button 
                  type="default"
                  className="text-gray-600 hover:text-gray-800 border-gray-300"
                  onClick={handleCreateProject}
                >
                  Create Manually Instead
                </Button>
              </div>
            </div>
          </Card>
          {renderDesktopProjects()}
          {useRealTimeFeatures && (
            <LiveActivityFeed />
          )}
        </>
      )}
    </div>
  );
}