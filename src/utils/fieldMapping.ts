import { OriginalProject, OriginalQuota, OriginalSupplier } from '@/types/original';
import type { EnhancedProject, Quota, SupplierPerformance } from '@project-types';

export class FieldMapper {
  /**
   * Convert original system project to enhanced format
   */
  static mapOriginalToEnhanced(original: OriginalProject): EnhancedProject {
    return {
      uuid: original.uuid,
      code: original.code,
      name: original.name,
      state: original.state as any,
      created_at: original.created_at,
      fielded: original.count_complete || 0,
      goal: original.total_available || 0,
      current_cpi: original.cpi_buyer ? original.cpi_buyer / 100 : 0,
      completion_percentage: this.calculateCompletion(original),
      quality_score: this.calculateQuality(original),
      health_status: this.calculateHealth(original),
      estimated_completion: this.calculateEstimatedCompletion(original),
      budget_used: (original.count_complete || 0) * (original.cpi_buyer ? original.cpi_buyer / 100 : 0),
      budget_total: (original.total_available || 0) * (original.cpi_buyer ? original.cpi_buyer / 100 : 0),
      country: 'US',
      language: 'en',
      supplier_count: 2,
      last_activity: this.calculateLastActivity(original)
    };
  }

  /**
   * Convert enhanced project back to original format
   */
  static mapEnhancedToOriginal(enhanced: EnhancedProject): OriginalProject {
    return {
      uuid: enhanced.uuid,
      code: enhanced.code,
      name: enhanced.name,
      state: enhanced.state as 'active' | 'closed',
      created_at: enhanced.created_at,
      total_available: enhanced.goal,
      count_complete: enhanced.fielded,
      cpi_buyer: enhanced.current_cpi ? Math.round(enhanced.current_cpi * 100) : 0,
      count_accept: Math.floor((enhanced.fielded || 0) * 0.8),
      count_reject: Math.floor((enhanced.fielded || 0) * 0.15),
      count_terminate: Math.floor((enhanced.fielded || 0) * 0.05),
      count_over_quota: 0
    };
  }

  /**
   * Map original quotas to enhanced quota progress
   */
  static mapQuotasToProgress(quotas: OriginalQuota[]): QuotaProgress[] {
    return quotas.map((quota, index) => ({
      id: `quota-${index}`,
      name: quota.name,
      target: quota.target,
      current: quota.complete,
      percentage: quota.target > 0 ? Math.round((quota.complete / quota.target) * 100) : 0,
      status: this.getQuotaStatus(quota.complete, quota.target)
    }));
  }

  /**
   * Map original suppliers to enhanced supplier performance
   */
  static mapSuppliersToPerformance(suppliers: OriginalSupplier[]): SupplierPerformance[] {
    return suppliers.map(supplier => ({
      id: supplier.uuid,
      name: supplier.name,
      completes: Math.floor(Math.random() * 50) + 10,
      quality_score: 85 + Math.floor(Math.random() * 15),
      current_cpi: 8.5 + Math.random() * 3,
      status: 'active' as const,
      response_time: 1 + Math.random() * 2,
      reliability_score: 90 + Math.floor(Math.random() * 10)
    }));
  }

  // Helper calculation methods
  private static calculateCompletion(project: OriginalProject): number {
    if (!project.total_available || !project.count_complete) return 0;
    return Math.round((project.count_complete / project.total_available) * 100);
  }

  private static calculateQuality(project: OriginalProject): number {
    const total = (project.count_complete || 0) + (project.count_reject || 0) + (project.count_terminate || 0);
    if (total === 0) return 100;
    return Math.round(((project.count_complete || 0) / total) * 100);
  }

  private static calculateHealth(project: OriginalProject): 'excellent' | 'good' | 'warning' | 'critical' {
    const completion = this.calculateCompletion(project);
    const quality = this.calculateQuality(project);
    if (completion >= 90 && quality >= 95) return 'excellent';
    if (completion >= 70 && quality >= 85) return 'good';
    if (completion >= 50 && quality >= 70) return 'warning';
    return 'critical';
  }

  private static calculateEstimatedCompletion(project: OriginalProject): string {
    const completion = this.calculateCompletion(project);
    if (completion >= 100) return 'Completed';
    if (completion >= 80) return '1-2 hours';
    if (completion >= 50) return '4-6 hours';
    if (completion >= 20) return '1-2 days';
    return '3-5 days';
  }

  private static calculateLastActivity(project: OriginalProject): string {
    if (project.state === 'active') {
      return Math.random() > 0.5 ? '5 minutes ago' : '1 hour ago';
    }
    return '1 day ago';
  }

  private static getQuotaStatus(current: number, target: number): 'pending' | 'active' | 'completed' | 'overdelivered' {
    if (current === 0) return 'pending';
    if (current >= target) return current > target ? 'overdelivered' : 'completed';
    return 'active';
  }
}
