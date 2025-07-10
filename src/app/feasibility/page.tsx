"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { UnifiedProjectCreator } from "@/components/project/UnifiedProjectCreator";

import { useSearchParams } from "next/navigation";

export default function FeasibilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get("projectId") ?? null;
  const projectName = searchParams?.get("projectName") ?? null;

  // Handler for when user wants to add to project
  const handleAddToProject = (criteria: any) => {
    // Send criteria back to project page as URL param
    router.push(`/projectDetail?id=${projectId}&newSourceCriteria=${encodeURIComponent(JSON.stringify(criteria))}`);
  };

  const handleCancel = () => {
    router.push("/");
  };

  const handleComplete = async (data: any) => {
    try {
      // Navigate to project detail page
      router.push(`/projectDetail?id=${data.uuid}`);
    } catch (error) {
      message.error('Navigation failed. Please try again.');
      console.error('Navigation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <UnifiedProjectCreator 
        onCancel={handleCancel} 
        onComplete={handleComplete} 
        showNavigation={true}
        projectId={projectId}
        projectName={projectName}
        onAddToProject={handleAddToProject}
      />
    </div>
  );
}

