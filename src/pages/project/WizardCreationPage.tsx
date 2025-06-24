"use client";

import React from 'react';
// import { ProjectCreationWizard } from '@/components/project/ProjectCreationWizard';
import { useRouter } from 'next/navigation';
import { ProjectCreationData } from '@/types';

const WizardCreationPage: React.FC = () => {
  const router = useRouter();

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const handleComplete = (data: ProjectCreationData) => {
    console.log('Project created:', data);
    // Navigate to the project details page or dashboard
    router.push('/dashboard');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* <ProjectCreationWizard
        onCancel={handleCancel}
        onComplete={handleComplete}
      /> */}
      <div className="p-8 text-center text-red-600 font-semibold">ProjectCreationWizard component has been removed.</div>
    </div>
  );
};

export default WizardCreationPage;
