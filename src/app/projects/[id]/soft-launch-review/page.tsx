"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Alert, Breadcrumb, Button } from "antd";
import SoftLaunchBreadcrumbs from "@/components/navigation/SoftLaunchBreadcrumbs";
import { ExperimentOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import SoftLaunchReview from "@/components/project/SoftLaunchReview";
import { errorLogger } from "@/services/errorLogger";

class ReviewPageErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    errorLogger.log('SoftLaunchReviewPage.runtime', {error, info});
  }
  render() {
    if (this.state.hasError) {
      return (
        <Alert
          type="error"
          message="An unexpected error occurred in the soft launch review page."
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

const SoftLaunchReviewPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  // Optionally fetch project data here if needed for breadcrumbs or guards

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <SoftLaunchBreadcrumbs projectId={projectId} currentStep="review" />
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        className="mb-4 text-base sm:text-lg px-2 py-1 sm:px-4 sm:py-2"
        style={{ touchAction: 'manipulation' }}
      >
        Back to Project
      </Button>
      <ReviewPageErrorBoundary>
        <Card
          title={
            <span className="flex items-center">
              <ExperimentOutlined className="mr-2 text-blue-500" />
              Soft Launch Test Results
            </span>
          }
          bordered={false}
          className="mb-6"
        >
          <SoftLaunchReview
            projectId={projectId}
            onPromoteToFullLaunch={() => {}}
            onAdjustSettings={() => {}}
            onRunAnotherTest={() => {}}
          />
        </Card>
      </ReviewPageErrorBoundary>
    </div>
  );
};

export default SoftLaunchReviewPage;
