'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useFeatureFlagContext } from '@/components/shared/FeatureFlagProvider';

interface PersonaContextType {
  userRole: 'internal' | 'client';
  complexity: 'standard' | 'advanced';
  features: string[];
  preferences: {
    showAdvancedOptions: boolean;
    enableKeyboardShortcuts: boolean;
    showTooltips: boolean;
    autoSave: boolean;
    compactMode: boolean;
  };
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within PersonaAdapter');
  }
  return context;
};

// Add alias for consistency
export const useRole = usePersona;

interface PersonaAdapterProps {
  children: ReactNode;
}

export const PersonaAdapter: React.FC<PersonaAdapterProps> = ({ children }) => {
  const { userContext } = useFeatureFlagContext();
  const userRole = userContext.role || 'client';

  const getRoleConfig = (role: 'internal' | 'client'): PersonaContextType => {
    switch (role) {
      case 'internal':
        return {
          userRole: 'internal',
          complexity: 'advanced',
          features: [
            'compliance_tracking',
            'audit_trails',
            'approval_workflows',
            'governance_controls',
            'executive_reporting',
            'budget_controls',
            'security_features',
            'power_controls',
            'api_access',
            'custom_fields',
            'advanced_filters',
            'bulk_operations',
            'data_exports',
            'integration_tools',
            'custom_dashboards',
            'supplier_management',
            'platform_analytics'
          ],
          preferences: {
            showAdvancedOptions: true,
            enableKeyboardShortcuts: true,
            showTooltips: false,
            autoSave: true,
            compactMode: true
          }
        };

      case 'client':
        return {
          userRole: 'client',
          complexity: 'standard',
          features: [
            'guided_setup',
            'templates',
            'help_tooltips',
            'error_prevention',
            'simplified_ui',
            'smart_defaults',
            'bulk_actions',
            'keyboard_shortcuts',
            'margin_tracking',
            'efficiency_metrics',
            'quick_clone',
            'batch_operations'
          ],
          preferences: {
            showAdvancedOptions: false,
            enableKeyboardShortcuts: false,
            showTooltips: true,
            autoSave: true,
            compactMode: false
          }
        };

      default:
        return getRoleConfig('client');
    }
  };

  const config = getRoleConfig(userRole);

  return (
    <PersonaContext.Provider value={config}>
      {children}
    </PersonaContext.Provider>
  );
};
