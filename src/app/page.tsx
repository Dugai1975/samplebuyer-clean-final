'use client';

import React, { useState } from 'react';
import { Button, Typography, Card, Row, Col, Input, Tag, message } from 'antd';
import { PlusOutlined, ThunderboltOutlined, TableOutlined, AppstoreOutlined, RocketOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useFeatureFlagContext } from '@/components/shared/FeatureFlagProvider';
import { FeatureFlagDebugger } from '@/components/shared/FeatureFlagDebugger';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { Project } from '@/types/enhanced';
import { MobileProjectCard } from '@/components/mobile/MobileProjectCard';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { AIProjectDescriber } from '@/components/ai/AIProjectDescriber';

const { Title } = Typography;
const { TextArea } = Input;

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { userContext } = useFeatureFlagContext();
  const { projects: baseProjects, loading, error, refreshProjects } = useEnhancedProjects();
  const { projects, lastUpdate, isOnline } = useRealTimeUpdates(baseProjects);
  const { isMobile } = useMobileDetection();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const useModernCards = useFeatureFlag('modern_project_cards', userContext);
  const useRealTimeFeatures = useFeatureFlag('real_time_updates', userContext);
  const roleAdaptation = useFeatureFlag('role_adaptation', userContext);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectView = (project: Project) => {
    setSelectedProject(project);
    router.push(`/monitor/${project.uuid}`);
  };

  const handleFeasibilityCheck = () => {
    router.push('/feasibility');
  };

  const handleCreateProject = () => {
    createEmptyProject();
  };

  const createEmptyProject = () => {
    // Create a new empty project with no sources
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const newProject = {
      name: `New Project ${projects.length + 1}`,
      description: 'Empty project ready for setup',
      status: 'active',
      uuid: Date.now().toString(),
      created_at: new Date().toISOString(),
      code: `P${Math.floor(1000 + Math.random() * 9000)}`,
      state: 'draft',
      sources: [] // Empty sources array
    };
    
    localStorage.setItem('projects', JSON.stringify([newProject, ...projects]));
    message.success('Empty project created!');
    router.push(`/projectDetail?id=${newProject.uuid}`);
  };

  // Mobile hero section
  const renderMobileHero = () => (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Find Your Perfect Audience</h1>
        <p className="text-gray-600 text-sm mb-6">
          Choose your preferred starting point
        </p>
      </div>
      {/* Dual Path Options */}
      <div className="space-y-3">
        <Card 
          className="shadow-md p-4 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleFeasibilityCheck}
        >
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
              <ThunderboltOutlined />
            </div>
            <h3 className="font-semibold text-base">Check Feasibility First</h3>
          </div>
          <p className="text-sm text-gray-600 ml-11">
            Get instant pricing and audience size before creating your project
          </p>
        </Card>
        <Card 
          className="shadow-md p-4 border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleCreateProject}
        >
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
              <RocketOutlined />
            </div>
            <h3 className="font-semibold text-base">Create Project Directly</h3>
          </div>
          <p className="text-sm text-gray-600 ml-11">
            Start with project setup and configure audience later
          </p>
        </Card>
      </div>
    </div>
  );

  // Mobile projects list
  const renderMobileProjects = () => (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">Your Projects</h2>
      {projects.length === 0 ? (
        <Card className="shadow-md p-6 text-center">
          <div className="text-gray-400 mb-3">
            <RocketOutlined className="text-2xl" />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            No projects yet. Find your perfect audience to get started!
          </p>
          <Button 
            type="primary" 
            block 
            className="min-h-[44px]"
            onClick={() => router.push('/wizard')}
          >
            Find Your Audience
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <Card key={project.uuid} className="shadow-md">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{project.name}</div>
                    <div className="text-xs text-gray-600">{project.code}</div>
                  </div>
                  <Tag 
                    color={project.state === 'active' ? 'green' : 'blue'}
                    className="text-xs"
                  >
                    {project.state === 'active' ? 'Live' : 'Draft'}
                  </Tag>
                </div>
                <Button 
                  size="small" 
                  block
                  className="min-h-[40px]"
                  onClick={() => router.push(`/projectDetail?id=${project.uuid}`)}
                >
                  {project.state === 'draft' ? 'Complete Setup' : 'View Project'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
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
          {renderMobileHero()}
          {renderMobileProjects()}
        </>
      ) : (
        <>
          {/* Updated Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Title level={2} className="mb-1">Projects Dashboard</Title>
              <p className="text-gray-600">
                Discover your perfect audience and launch projects instantly
              </p>
            </div>
          </div>

          {/* Audience Discovery Hero Section */}
          <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-8">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThunderboltOutlined className="text-3xl text-blue-500" />
                </div>
                <h1 className="text-4xl font-bold mb-3">Find Your Perfect Audience</h1>
                <p className="text-xl text-gray-600">
                  Get instant pricing and launch projects in 2 simple steps
                </p>
              </div>
              {/* 2-Step Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                <Card className="shadow-md text-left border-2 border-transparent hover:border-blue-200 transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</div>
                    <h3 className="font-semibold">Check Feasibility</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Define your audience and get instant pricing & availability
                  </p>
                </Card>
                <Card className="shadow-md text-left border-2 border-transparent hover:border-green-200 transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</div>
                    <h3 className="font-semibold">Launch & Collect</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Add your survey link and start collecting responses immediately
                  </p>
                </Card>
              </div>
              {/* Quick Start Options */}
              <div className="space-y-4">
                <div className="max-w-xl mx-auto">
                  <Input.TextArea
                    placeholder="Quick start: Describe your target audience (e.g., 'Working moms 25-45 in US who buy organic food')"
                    rows={2}
                    size="large"
                    className="text-base"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="flex justify-center gap-3">
                  <Button 
                    type="primary" 
                    size="large"
                    className="min-h-[44px] px-8"
                    onClick={() => router.push('/wizard')}
                  >
                    Find My Audience
                  </Button>
                  <Button 
                    size="large"
                    className="min-h-[44px] px-6"
                    onClick={createEmptyProject}
                  >
                    Manual Setup
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Your Projects</h2>
              <div className="flex justify-center space-x-4 mb-8">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ThunderboltOutlined />}
                  onClick={handleFeasibilityCheck}
                  className="h-12 px-8"
                >
                  Check Feasibility
                </Button>
                <Button 
                  size="large" 
                  icon={<PlusOutlined />}
                  onClick={handleCreateProject}
                  className="h-12 px-8"
                >
                  Create Project
                </Button>
              </div>
            </div>
            {projects.length === 0 ? (
              <Card className="shadow-md">
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <RocketOutlined className="text-4xl" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first project by finding your perfect audience
                  </p>
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => router.push('/wizard')}
                    className="min-h-[44px]"
                  >
                    Find Your Audience
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="shadow-md">
                <div className="space-y-0">
                  {projects.map((project, index) => (
                    <div 
                      key={project.uuid}
                      className={`flex justify-between items-center py-4 px-2 hover:bg-gray-50 rounded transition-colors ${
                        index < projects.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-semibold text-base">{project.name}</div>
                            <div className="text-sm text-gray-600">
                              {project.code} • Created {dayjs(project.created_at).format('MMM D')}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Project Status */}
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            project.state === 'active' ? 'bg-green-500' : 
                            project.state === 'draft' ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-sm text-gray-600">
                            {project.state === 'draft' ? 'Ready to Launch' : 
                             project.state === 'active' ? 'Collecting Data' : 'Setup'}
                          </span>
                        </div>
                        <Tag 
                          color={
                            project.state === 'active' ? 'green' : 
                            project.state === 'draft' ? 'blue' : 'default'
                          }
                          className="font-medium"
                        >
                          {project.state === 'active' ? 'Live' : 
                           project.state === 'draft' ? 'Draft' : 'Setup'}
                        </Tag>
                        <Button 
                          size="small" 
                          onClick={() => router.push(`/projectDetail?id=${project.uuid}`)}
                          className="min-h-[32px]"
                        >
                          {project.state === 'draft' ? 'Complete Setup' : 'View'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {useRealTimeFeatures && (
            <LiveActivityFeed />
          )}
        </>
      )}
    </div>
  );
}