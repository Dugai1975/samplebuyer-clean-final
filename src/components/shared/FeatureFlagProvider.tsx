'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserContext } from '@/types/featureFlags';

interface FeatureFlagContextType {
  userContext: UserContext;
  updateUserContext: (context: Partial<UserContext>) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const useFeatureFlagContext = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlagContext must be used within FeatureFlagProvider');
  }
  return context;
};

interface FeatureFlagProviderProps {
  children: React.ReactNode;
  initialUserContext?: UserContext;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
  children,
  initialUserContext = {}
}) => {
  const [isClient, setIsClient] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({
  userId: 'demo-user-stable',
  email: 'elena.gaiduk@riwi.com',
  role: 'client',
  ...initialUserContext
});

  // Detect user persona based on URL params or localStorage for demo
  useEffect(() => {
  setIsClient(true);
  
  // Only run client-side logic after hydration
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role') as UserContext['role'];
  const betaTester = urlParams.get('beta') === 'true';

  setUserContext(prev => ({
    ...prev,
    role: role || prev.role || 'client',
    betaTester: betaTester || prev.betaTester,
    userId: 'demo-user-stable',
    email: 'elena.gaiduk@riwi.com'
  }));
}, []);

  const updateUserContext = (newContext: Partial<UserContext>) => {
    setUserContext(prev => ({ ...prev, ...newContext }));
  };

  if (!isClient) {
  return (
    <FeatureFlagContext.Provider value={{ 
      userContext: { userId: 'demo-user-stable', email: 'elena.gaiduk@riwi.com', role: 'client' }, 
      updateUserContext: () => {} 
    }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

return (
  <FeatureFlagContext.Provider value={{ userContext, updateUserContext }}>
    {children}
  </FeatureFlagContext.Provider>
);
};
