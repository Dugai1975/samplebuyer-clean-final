export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  userSegments?: string[];
  rolloutPercentage?: number;
}

export interface UserContext {
  userId?: string;
  email?: string;
  role?: 'internal' | 'client';
  betaTester?: boolean;
}

export type FeatureFlagName = 
  | 'new_dashboard_ui'
  | 'modern_project_cards'
  | 'real_time_updates'
  | 'instant_feasibility'
  | 'ai_quality_features'
  | 'role_adaptation';
