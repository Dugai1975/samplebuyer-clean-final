import { FeatureFlag } from '@/types/featureFlags';

export const defaultFeatureFlags: Record<string, FeatureFlag> = {
  new_dashboard_ui: {
    name: 'new_dashboard_ui',
    enabled: process.env.NODE_ENV === 'development', // Enable in dev by default
    description: 'Modern dashboard with enhanced UX',
    rolloutPercentage: 20,
  },
  modern_project_cards: {
    name: 'modern_project_cards',
    enabled: true,
    description: 'Enhanced project card design',
    rolloutPercentage: 50,
  },
  real_time_updates: {
    name: 'real_time_updates',
    enabled: false,
    description: 'Real-time project monitoring',
    rolloutPercentage: 10,
  },
  instant_feasibility: {
    name: 'instant_feasibility',
    enabled: true,
    description: 'Instant feasibility calculations',
    rolloutPercentage: 30,
  },
};
