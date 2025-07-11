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
  
  console.log('[DEBUG] FeasibilityPage - projectId:', projectId);
  console.log('[DEBUG] FeasibilityPage - projectName:', projectName);

  // Handler for when user wants to add to project
  const handleAddToProject = (criteria: any) => {
    // Make sure we have a valid projectId before redirecting
    if (!projectId) {
      console.error('[ERROR] Cannot add to project: No projectId provided');
      message.error('Cannot add to project: No project ID provided');
      return;
    }
    
    // Add debug info to criteria
    const enhancedCriteria = {
      ...criteria,
      name: criteria.name || 'New Audience',
      description: criteria.description || 'Added from feasibility tool',
      _debug: { addedAt: new Date().toISOString() }
    };
    
    console.log('[DEBUG] Adding to project:', projectId);
    console.log('[DEBUG] Criteria:', enhancedCriteria);
    
    // Safely encode the criteria to prevent URI malformed errors
    try {
      // First stringify the criteria
      const stringifiedCriteria = JSON.stringify(enhancedCriteria);
      console.log('[DEBUG] Stringified criteria length:', stringifiedCriteria.length);
      
      // Use a simpler encoding approach that won't cause decoding issues
      // Just use the raw JSON string without any encoding
      // This works because JSON is already properly escaped
      
      // Send criteria back to project page as URL param
      const url = `/projectDetail?id=${projectId}&newSourceCriteria=${stringifiedCriteria}`;
      console.log('[DEBUG] Redirecting to project detail page with criteria');
      router.push(url);
    } catch (error) {
      console.error('[ERROR] Failed to encode criteria:', error);
      message.error('Failed to add audience to project');
    }
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

  // Force string conversion for projectId to ensure it's properly passed
  const safeProjectId = projectId ? String(projectId) : null;
  const safeProjectName = projectName ? String(projectName) : null;
  
  console.log('[DEBUG] FeasibilityPage render - safeProjectId:', safeProjectId);
  console.log('[DEBUG] FeasibilityPage render - safeProjectName:', safeProjectName);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug info banner */}
      {safeProjectId && (
        <div style={{ padding: '8px', background: '#e6f7ff', borderBottom: '1px solid #91d5ff', fontSize: '12px' }}>
          Debug: Project ID: {safeProjectId} | Name: {safeProjectName || 'Not provided'}
        </div>
      )}

      <UnifiedProjectCreator 
        onCancel={handleCancel} 
        onComplete={handleComplete} 
        showNavigation={true}
        projectId={safeProjectId}
        projectName={safeProjectName}
        onAddToProject={handleAddToProject}
      />
    </div>
  );
}

