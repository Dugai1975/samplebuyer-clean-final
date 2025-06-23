"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Tag, Breadcrumb, Button, Alert } from "antd";
import { ExperimentOutlined, ArrowLeftOutlined, CopyOutlined } from "@ant-design/icons";
import SoftLaunchReview from "@/components/project/SoftLaunchReview";
import SoftLaunchBreadcrumbs from "@/components/navigation/SoftLaunchBreadcrumbs";
import { errorLogger } from "@/services/errorLogger";

class ProjectDetailErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    errorLogger.log('ProjectDetailPage.runtime', {error, info});
  }
  render() {
    if (this.state.hasError) {
      return (
        <Alert
          type="error"
          message="An unexpected error occurred in the project detail page."
          description={<span>
            Please refresh or <a href="mailto:support@example.com">contact support</a>.<br/>
            <Button onClick={() => window.location.reload()} style={{marginTop: 8}}>Reload Page</Button>
          </span>}
          showIcon
        />
      );
    }
    return this.props.children;
  }
}

const RedirectLinksDisplay: React.FC<{ project: any }> = ({ project }) => (
  <Card title="Redirect URLs" className="mb-4">
    <div className="space-y-2">
      {[
        { label: 'Complete', url: project.buyer?.complete_link },
        { label: 'Terminate', url: project.buyer?.terminate_link },
        { label: 'Quota Full', url: project.buyer?.quota_link },
        { label: 'Duplicate', url: project.buyer?.duplicate_link },
        { label: 'Quality', url: project.buyer?.quality_link },
        { label: 'Screenout', url: project.buyer?.screenout_link },
        { label: 'Timeout', url: project.buyer?.timeout_link },
      ].map(({ label, url }) => (
        <div key={label} className="flex justify-between items-center">
          <span className="font-medium">{label}:</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 max-w-xs truncate">{url || 'Not configured'}</span>
            {url && (
              <Button 
                size="small" 
                icon={<CopyOutlined />}
                onClick={() => navigator.clipboard.writeText(url)}
              >
                Copy
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// Main project detail page
const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  // Simulate project state fetch (replace with real API/hook)
  // For demo, get state from query or default
  const [projectState, setProjectState] = React.useState<string>("active");

  useEffect(() => {
    // TODO: Replace with real fetch
    // If project enters soft_paused, auto-redirect to review
    if (projectState === "soft_paused") {
      router.replace(`/projects/${projectId}/soft-launch-review`);
    }
  }, [projectState, projectId, router]);

  // Simulate a project object for demo; replace with real data
  const project = { buyer: {} };

  return (
    <ProjectDetailErrorBoundary>
      <div className="max-w-4xl mx-auto p-4">
        {(projectState.startsWith("soft_") || projectState === "awaiting_review") ? (
          <SoftLaunchBreadcrumbs projectId={projectId} currentStep={projectState === "soft_launch" ? "test" : projectState === "soft_paused" || projectState === "awaiting_review" ? "review" : undefined} />
        ) : (
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <a href="/projects">Projects</a> },
              { title: <span>Project Detail</span> },
            ]}
          />
        )}
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="mb-4 text-base sm:text-lg px-2 py-1 sm:px-4 sm:py-2"
          style={{ touchAction: 'manipulation' }}
        >
          Back to Projects
        </Button>
        <Card
          title={<span className="flex items-center">Project Details</span>}
          bordered={false}
          className="mb-6"
        >
          {/* Soft Launch Status Banner */}
          {projectState.startsWith("soft_") && (
            <Alert
              message={
                <span>
                  <ExperimentOutlined className="mr-2 text-blue-500" />
                  {projectState === "soft_launch" && "Soft Launch In Progress"}
                  {projectState === "soft_paused" && "Soft Launch Paused for Review"}
                  {projectState === "awaiting_review" && "Soft Launch Awaiting Review"}
                </span>
              }
              type="info"
              showIcon
              className="mb-4"
              action={
                <Button
                  size="middle"
                  onClick={() => router.push(`/projects/${projectId}/soft-launch-review`)}
                  icon={<ExperimentOutlined />}
                  className="px-3 py-1 sm:px-4 sm:py-2"
                  style={{ touchAction: 'manipulation' }}
                >
                  Review Results
                </Button>
              }
            />
          )}
          {/* TODO: Render main project detail UI here */}
          <div>Project main details go here...</div>
        </Card>
        {/* Redirect Links Display */}
        <RedirectLinksDisplay project={project} />
      </div>
    </ProjectDetailErrorBoundary>
  );
};

export default ProjectDetailPage;
