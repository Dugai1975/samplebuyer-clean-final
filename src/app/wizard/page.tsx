"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { message } from "antd";
import { UnifiedProjectCreator } from "@/components/project/UnifiedProjectCreator";

export default function WizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Defensive: fallback to empty searchParams if null
  const safeSearchParams = searchParams ?? new URLSearchParams();

  // Parse feasibility-related parameters from URL
  const feasibilityFlag = safeSearchParams.get('feasibility') === 'true';
  const completes = safeSearchParams.get('completes');
  const country = safeSearchParams.get('country');
  const incidence_rate = safeSearchParams.get('incidence_rate');
  const loi_minutes = safeSearchParams.get('loi_minutes');
  const estimated_cpi = safeSearchParams.get('estimated_cpi') || '0';

  const feasibilityParams = {
    from_feasibility: feasibilityFlag,
    completes: parseInt(completes || '100'),
    country: country || 'US',
    incidence_rate: parseInt(incidence_rate || '25'),
    loi_minutes: parseInt(loi_minutes || '10'),
    estimated_cpi: parseFloat(estimated_cpi)
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
        initialData={feasibilityParams.from_feasibility ? feasibilityParams : undefined}
      />
    </div>
  );
}

