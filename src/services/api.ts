// API service layer that works with existing and enhanced endpoints
import type { Project, EnhancedProject, FeasibilityData, Quota, Buyer, SampleCriteria, LaunchConfig, QuotaProgress, SupplierPerformance, ProjectActivity } from '@/types';
import type { ProjectCreationData } from '@/types';
import type { AIPromptAnalysis, LinkValidationResult, SmartSetupProgress } from '@/types/enhanced';

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Enhanced project fetching (extends existing API)
  async fetchProjects(): Promise<EnhancedProject[]> {
    // Force mock data
    return this.getMockProjects();
  }

  async fetchProjectDetail(projectId: string): Promise<EnhancedProject | null> {
    // Force mock data
    return this.getMockProjectDetail(projectId);
  }

  // New feasibility calculation endpoint
  async calculateFeasibility(criteria: {
    country: string;
    completes: number;
    incidence_rate: number;
    demographics?: any;
  }): Promise<FeasibilityData> {
    // Force mock data
    return this.getMockFeasibility(criteria);
  }

  // Enhanced project creation
  async createProject(data: ProjectCreationData): Promise<EnhancedProject> {
    // Build payload including redirect links mapped to buyer fields
    const payload = {
      ...data,
      buyer: {
        ...(data as any).buyer,
      }
    };
    // TODO: Call real API with payload when backend is ready
    // return await apiService.post('/projects', payload);
    // For now, return mock data
    const mockProjects = this.getMockProjects();
    // Just return the first mock project for demo
    return mockProjects[0];
  }

  // Real-time project monitoring data
  async fetchProjectLiveData(projectId: string): Promise<{
    project: EnhancedProject;
    quotas: QuotaProgress[];
    suppliers: SupplierPerformance[];
    recent_activity: ProjectActivity[];
  }> {
    // Force mock data
    return this.getMockLiveData(projectId);
  }

  // Private helper methods
  private enhanceProjectData(project: any): EnhancedProject {
    const enhanced: EnhancedProject = {
      ...project,
      completion_percentage: project.fielded && project.goal 
        ? Math.round((project.fielded / project.goal) * 100) 
        : 0,
      health_status: this.calculateHealthStatus(project),
      estimated_completion: this.calculateEstimatedCompletion(project),
      budget_used: project.fielded ? project.fielded * (project.current_cpi || 0) : 0,
    };

    return enhanced;
  }

  private calculateHealthStatus(project: any): 'excellent' | 'good' | 'warning' | 'critical' {
    const completion = project.fielded && project.goal ? (project.fielded / project.goal) * 100 : 0;
    const quality = project.quality_score || 100;
    
    if (completion > 90 && quality > 95) return 'excellent';
    if (completion > 70 && quality > 90) return 'good';
    if (completion > 30 && quality > 80) return 'warning';
    return 'critical';
  }

  private calculateEstimatedCompletion(project: any): string {
    // Simple estimation based on current progress
    if (!project.fielded || !project.goal) return 'Unknown';
    
    const remaining = project.goal - project.fielded;
    if (remaining <= 0) return 'Completed';
    
    // Estimate based on historical rate (mock calculation)
    const daysRemaining = Math.ceil(remaining / 10); // Assume 10 completes per day
    return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
  }

  // Mock data methods (fallbacks)
  private getMockProjects(): EnhancedProject[] {
    return [
      {
        uuid: '41164167',
        code: 'P-1001',
        name: 'RH Users_Current',
        state: 'live',
        created_at: '2025-06-06T15:11:45Z',
        fielded: 76,
        goal: 75,
        current_cpi: 9.50,
        average_cpi: 9.50,
        incidence_rate: 8,
        quality_score: 94,
        time_remaining: '2.3 hours',
        supplier_count: 3,
        country: 'Brazil',
        language: 'Portuguese',
        loi_minutes: 26,
        completion_percentage: 101,
        health_status: 'good',
        estimated_completion: 'Completed',
        budget_used: 722.00,
        
        last_activity: '5 minutes ago'
      },
      {
        uuid: '41164285',
        code: 'P-1002', 
        name: 'RH Users_Design 2',
        state: 'paused',
        created_at: '2025-06-05T10:30:00Z',
        fielded: 46,
        goal: 48,
        current_cpi: 9.50,
        average_cpi: 9.50,
        incidence_rate: 6,
        quality_score: 91,
        time_remaining: '1.2 days',
        supplier_count: 2,
        country: 'Brazil',
        language: 'Portuguese', 
        loi_minutes: 25,
        completion_percentage: 96,
        health_status: 'good',
        estimated_completion: '1 day',
        budget_used: 437.00,
        
        last_activity: '2 hours ago'
      }
    ];
  }

  private getMockProjectDetail(projectId: string): EnhancedProject | null {
    const projects = this.getMockProjects();
    return projects.find(p => p.uuid === projectId) || null;
  }

  private getMockFeasibility(criteria: { country: string; completes: number; incidence_rate: number; demographics?: any }): FeasibilityData {
    const baseAvailable = Math.floor(Math.random() * 50000) + 10000;
    const baseCpi = 2.5 + Math.random() * 3;
    
    return {
      
      estimated_cpi: parseFloat(baseCpi.toFixed(2)),
      estimated_timeline_days: Math.ceil(criteria.completes / 50),
      confidence_level: 85 + Math.floor(Math.random() * 15),
      supplier_breakdown: [
        {
          supplier_name: 'PureSpectrum',
          available: Math.floor(baseAvailable * 0.4),
          cpi: parseFloat((baseCpi * 0.9).toFixed(2)),
          quality_rating: 94
        },
        {
          supplier_name: 'Cint', 
          available: Math.floor(baseAvailable * 0.35),
          cpi: parseFloat((baseCpi * 1.1).toFixed(2)),
          quality_rating: 91
        },
        {
          supplier_name: 'Dynata',
          available: Math.floor(baseAvailable * 0.25),
          cpi: parseFloat((baseCpi * 1.2).toFixed(2)),
          quality_rating: 88
        }
      ]
    };
  }

  private getMockLiveData(projectId: string): any {
    const project = this.getMockProjectDetail(projectId);
    
    return {
      project,
      quotas: [
        {
          id: '1',
          name: 'Male 18-34',
          target: 25,
          current: 24,
          percentage: 96,
          status: 'active' as const
        },
        {
          id: '2', 
          name: 'Female 18-34',
          target: 25,
          current: 23,
          percentage: 92,
          status: 'active' as const
        },
        {
          id: '3',
          name: 'Male 35-54', 
          target: 25,
          current: 15,
          percentage: 60,
          status: 'active' as const
        }
      ],
      suppliers: [
        {
          id: '1',
          name: 'PureSpectrum',
          completes: 25,
          quality_score: 94,
          current_cpi: 9.50,
          status: 'active' as const,
          response_time: 1.2,
          reliability_score: 98
        }
      ],
      recent_activity: [
        {
          id: '1',
          timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
          type: 'complete' as const,
          description: 'Auto-replaced 3 fraudulent responses',
          automated: true
        }
      ]
    };
  }
}

export const apiService = new ApiService();
