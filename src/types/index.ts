// Re-export types from shared types
export * from '../../../shared/types/project';
export * from '../../../shared/types/enhanced';

// Project creation specific types
export interface ProjectCreationData {
  name?: string;
  description?: string;
  country: string;
  language: string;
  languages: string[];
  completes: number;
  loi_minutes: number;
  incidence_rate: number;
  survey_id?: string;
  demographics?: Record<string, string[]>;
  priority_level?: 'standard' | 'high' | 'rush';
  budget?: number;
  survey_url?: string;
  quotas?: QuotaProgress[];
}

// Feasibility data type
export interface FeasibilityData {
  feasible: boolean;
  estimated_cost: number;
  estimated_time: string;
  available_suppliers: number;
  recommended_cpi: number;
  warnings?: string[];
  recommendations?: string[];
}

// Quota matrix type
export interface QuotaMatrix {
  id: string;
  name: string;
  target: number;
  variables: {
    name: string;
    values: string[];
  }[];
}

// Quota progress type for tracking quota completion
export interface QuotaProgress {
  id: string;
  name: string;
  target: number;
  current: number;
  percentage: number;
  status: 'open' | 'closed' | 'paused' | 'pending';
  demographic_filter?: {
    gender?: string;
    age_range?: string;
    [key: string]: string | undefined;
  };
}
