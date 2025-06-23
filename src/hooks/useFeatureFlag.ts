import { useState, useEffect } from 'react';
import { FeatureFlagName, UserContext } from '@/types/featureFlags';
import { defaultFeatureFlags } from '@/config/featureFlags';

export const useFeatureFlag = (
  flagName: FeatureFlagName, 
  userContext?: UserContext
): boolean => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const flag = defaultFeatureFlags[flagName];
    if (!flag) {
      setEnabled(false);
      return;
    }

    // Simple rollout logic based on user ID hash
    let isEnabled = flag.enabled;
    
    if (flag.rolloutPercentage && userContext?.userId) {
      const hash = hashString(userContext.userId);
      const percentage = hash % 100;
      isEnabled = isEnabled && percentage < flag.rolloutPercentage;
    }

    // Beta testers get all features
    if (userContext?.betaTester) {
      isEnabled = true;
    }

    setEnabled(isEnabled);
  }, [flagName, userContext]);

  return enabled;
};

// Simple hash function for consistent user bucketing
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export const useMultipleFeatureFlags = (
  flags: FeatureFlagName[],
  userContext?: UserContext
): Record<string, boolean> => {
  const [enabledFlags, setEnabledFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const results: Record<string, boolean> = {};
    flags.forEach(flag => {
      const flagConfig = defaultFeatureFlags[flag];
      let isEnabled = flagConfig?.enabled || false;

      if (flagConfig?.rolloutPercentage && userContext?.userId) {
        const hash = hashString(userContext.userId);
        const percentage = hash % 100;
        isEnabled = isEnabled && percentage < flagConfig.rolloutPercentage;
      }

      if (userContext?.betaTester) {
        isEnabled = true;
      }

      results[flag] = isEnabled;
    });
    setEnabledFlags(results);
  }, [JSON.stringify(flags), userContext]);

  return enabledFlags;
};
