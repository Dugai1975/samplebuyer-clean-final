"use client";

import React from 'react';
import { SupplierDashboard } from '@/components/suppliers/SupplierDashboard';
import { useSupplierOptimization } from '@/hooks/useSupplierOptimization';
import { SupplierPerformance } from '@/types/enhanced';

interface SupplierOptimizationPanelProps {
  suppliers: SupplierPerformance[];
  projectId: string;
}

export const SupplierOptimizationPanel: React.FC<SupplierOptimizationPanelProps> = ({ suppliers, projectId }) => {
  const { optimizedSuppliers, optimizationSuggestions, applyOptimization, cloneSupplierSettings } = useSupplierOptimization(suppliers || []);

  return (
    <SupplierDashboard
      projectId={projectId}
      suppliers={optimizedSuppliers}
      onSupplierUpdate={applyOptimization}
      onCloneTraffic={(supplierId) => cloneSupplierSettings(supplierId, [])}
    />
  );
};
