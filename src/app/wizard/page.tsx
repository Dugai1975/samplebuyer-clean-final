"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { UnifiedProjectCreator } from "@/components/project/UnifiedProjectCreator";

export default function WizardPage() {
  const router = useRouter();

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
      />
    </div>
  );
}

