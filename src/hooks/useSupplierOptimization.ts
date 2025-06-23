import { useState, useEffect } from 'react';
import { SupplierPerformance } from '@/types/enhanced';

export const useSupplierOptimization = (suppliers: SupplierPerformance[]) => {
  const [optimizedSuppliers, setOptimizedSuppliers] = useState<SupplierPerformance[]>(suppliers);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<any[]>([]);

  useEffect(() => {
    // Generate AI optimization suggestions
    const suggestions = generateOptimizationSuggestions(suppliers);
    setOptimizationSuggestions(suggestions);
  }, [suppliers]);

  const generateOptimizationSuggestions = (suppliers: SupplierPerformance[]) => {
    const suggestions: any[] = [];

    suppliers.forEach(supplier => {
      // Quality-based suggestions
      if (supplier.quality_score < 80) {
        suggestions.push({
          type: 'quality_improvement',
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          action: 'pause_or_optimize',
          description: `Quality score of ${supplier.quality_score}% is below threshold`,
          impact: 'medium',
          recommendation: 'Consider pausing or reducing CPI to improve quality'
        });
      }

      // Performance-based suggestions
      if (supplier.quality_score > 90 && supplier.completes < 20) {
        suggestions.push({
          type: 'scale_high_performer',
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          action: 'increase_capacity',
          description: `High quality (${supplier.quality_score}%) but low volume`,
          impact: 'high',
          recommendation: 'Increase CPI or capacity to scale this high performer'
        });
      }

      // Cost optimization
      if (supplier.current_cpi > 10 && supplier.quality_score < 85) {
        suggestions.push({
          type: 'cost_optimization',
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          action: 'reduce_cpi',
          description: `High CPI ($${supplier.current_cpi}) with moderate quality`,
          impact: 'medium',
          recommendation: 'Reduce CPI to improve cost efficiency'
        });
      }
    });

    return suggestions;
  };

  const applyOptimization = (supplierId: string, optimization: any) => {
    setOptimizedSuppliers(prev => prev.map(supplier => {
      if (supplier.id === supplierId) {
        switch (optimization.action) {
          case 'increase_capacity':
            return { ...supplier, current_cpi: supplier.current_cpi + 1 };
          case 'reduce_cpi':
            return { ...supplier, current_cpi: supplier.current_cpi - 0.5 };
          case 'pause_or_optimize':
            return { ...supplier, status: 'paused' };
          default:
            return supplier;
        }
      }
      return supplier;
    }));

    // Remove applied suggestion
    setOptimizationSuggestions(prev => 
      prev.filter(s => s.supplier_id !== supplierId || s.action !== optimization.action)
    );
  };

  const cloneSupplierSettings = (sourceId: string, targetIds: string[]) => {
    const sourceSupplier = suppliers.find(s => s.id === sourceId);
    if (!sourceSupplier) return;

    setOptimizedSuppliers(prev => prev.map(supplier => {
      if (targetIds.includes(supplier.id)) {
        return {
          ...supplier,
          current_cpi: sourceSupplier.current_cpi,
          // Clone other settings like targeting criteria in real implementation
        };
      }
      return supplier;
    }));
  };

  return {
    optimizedSuppliers,
    optimizationSuggestions,
    applyOptimization,
    cloneSupplierSettings
  };
};
