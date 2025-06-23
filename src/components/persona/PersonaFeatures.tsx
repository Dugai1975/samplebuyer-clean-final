'use client';

import React from 'react';
import { usePersona } from './PersonaAdapter';

interface PersonaFeatureProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PersonaFeature: React.FC<PersonaFeatureProps> = ({ 
  feature, 
  children, 
  fallback = null 
}) => {
  const { features } = usePersona();
  
  if (features.includes(feature)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

// Alias for consistency
export const RoleFeature = PersonaFeature;

interface PersonaComplexityProps {
  level: 'standard' | 'advanced';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PersonaComplexity: React.FC<PersonaComplexityProps> = ({ 
  level, 
  children, 
  fallback = null 
}) => {
  const { complexity } = usePersona();
  
  const complexityLevels = ['standard', 'advanced'];
  const currentLevel = complexityLevels.indexOf(complexity);
  const requiredLevel = complexityLevels.indexOf(level);
  
  if (currentLevel >= requiredLevel) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

// Alias for consistency
export const RoleComplexity = PersonaComplexity;

export const PersonaTooltip: React.FC<{ 
  title: string; 
  content: string; 
  children: React.ReactNode;
}> = ({ title, content, children }) => {
  const { preferences } = usePersona();
  
  if (!preferences.showTooltips) {
    return <>{children}</>;
  }
  
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
        <div className="font-medium">{title}</div>
        {content && <div className="text-xs opacity-90">{content}</div>}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
      </div>
    </div>
  );
};

// Alias for consistency
export const RoleTooltip = PersonaTooltip;
