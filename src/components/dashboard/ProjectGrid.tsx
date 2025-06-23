"use client";

import React, { useState } from 'react';
import { Row, Col, Input, Select, Button, Space, Empty } from 'antd';
import { SearchOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { ProjectCard } from './ProjectCard';
import { EnhancedProject } from '@/types/enhanced';

const { Option } = Select;

interface ProjectGridProps {
  projects: EnhancedProject[];
  loading?: boolean;
  onProjectView: (project: EnhancedProject) => void;
  onProjectEdit?: (project: EnhancedProject) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  loading,
  onProjectView,
  onProjectEdit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.state === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return (b.completion_percentage || 0) - (a.completion_percentage || 0);
        case 'quality':
          return (b.quality_score || 0) - (a.quality_score || 0);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <div>
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search projects..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              placeholder="Status"
            >
              <Option value="all">All Status</Option>
              <Option value="live">Live</Option>
              <Option value="paused">Paused</Option>
              <Option value="completed">Completed</Option>
              <Option value="draft">Draft</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
              placeholder="Sort by"
            >
              <Option value="recent">Most Recent</Option>
              <Option value="name">Name</Option>
              <Option value="progress">Progress</Option>
              <Option value="quality">Quality Score</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="flex justify-end">
              <Space>
                <span className="text-sm text-gray-600">
                  {filteredProjects.length} of {projects.length} projects
                </span>
                <Button icon={<FilterOutlined />} size="small">
                  Advanced Filters
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <Empty
          description="No projects found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredProjects.map(project => (
            <Col xs={24} sm={12} lg={8} xl={6} key={project.uuid}>
              <ProjectCard
                project={project}
                onView={onProjectView}
                onEdit={onProjectEdit}
                onPause={(proj) => console.log('Pause project:', proj.uuid)}
                onResume={(proj) => console.log('Resume project:', proj.uuid)}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
