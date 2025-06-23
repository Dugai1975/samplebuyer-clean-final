import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { analytics } from '@/services/analytics';
import { useFeatureFlagContext } from '@/components/shared/FeatureFlagProvider';

export const useAnalytics = () => {
  const router = useRouter();
  const { userContext } = useFeatureFlagContext();

  useEffect(() => {
    // Set user ID if available
    if (userContext.userId) {
      analytics.identify(userContext.userId, {
        userId: userContext.userId,
        role: userContext.role,
        email: userContext.email,
        signupDate: new Date().toISOString(),
        lastActive: new Date().toISOString()
      });
    }
  }, [userContext]);

  useEffect(() => {
    // Track route changes
    const handleRouteChange = (url: string) => {
      analytics.trackPageView(url, document.title);
    };

    // Track initial page load
    analytics.trackPageView(window.location.pathname, document.title);

    // Listen for route changes (Next.js doesn't have a global route change event)
    // We'll track this manually in components

    return () => {
      // Cleanup if needed
    };
  }, [router]);

  return {
    track: analytics.track.bind(analytics),
    trackFeature: analytics.trackFeatureUsage.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackJourney: analytics.trackUserJourney.bind(analytics),
    trackProject: analytics.trackProjectEvent.bind(analytics),
    trackSupplier: analytics.trackSupplierEvent.bind(analytics),
    trackQuality: analytics.trackQualityEvent.bind(analytics),
    trackAHa: analytics.trackAHaMoment.bind(analytics)
  };
};

export const usePageTracking = (pageName: string) => {
  const { track } = useAnalytics();

  useEffect(() => {
    track('page_view', {
      page_name: pageName,
      timestamp: new Date().toISOString()
    });

    const startTime = Date.now();

    return () => {
      const timeOnPage = Date.now() - startTime;
      track('page_exit', {
        page_name: pageName,
        time_on_page: timeOnPage
      });
    };
  }, [pageName, track]);
};

export const useFeatureTracking = (featureName: string) => {
  const { trackFeature } = useAnalytics();

  const trackFeatureUse = (action: string, properties?: Record<string, any>) => {
    trackFeature(featureName, action, properties);
  };

  return { trackFeatureUse };
};

export const usePerformanceTracking = () => {
  const { trackPerformance } = useAnalytics();

  const trackLoadTime = (name: string, startTime: number) => {
    const loadTime = Date.now() - startTime;
    trackPerformance(`${name}_load_time`, loadTime);
  };

  const trackApiCall = (endpoint: string, duration: number, success: boolean) => {
    trackPerformance('api_call_duration', duration);
    trackPerformance(`api_${endpoint}_duration`, duration);
    
    if (!success) {
      trackPerformance('api_error', 1, 'count');
    }
  };

  return { trackLoadTime, trackApiCall };
};
