// Analytics service for tracking user behavior and platform metrics
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
  sessionId?: string;
}

interface UserProperties {
  userId: string;
  role?: 'internal' | 'client';
  email?: string;
  signupDate?: string;
  totalProjects?: number;
  lastActive?: string;
}

interface PageView {
  path: string;
  title?: string;
  referrer?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

class AnalyticsService {
  private sessionId: string;
  private userId: string | undefined = undefined;
  private events: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];
  private isEnabled = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private initializeTracking() {
    // Track page views automatically
    if (typeof window !== 'undefined') {
      this.trackPageView(window.location.pathname, document.title);
      
      // Track session start
      this.track('session_start', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      });
    }
  }

  // Core tracking methods
  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        platform: 'sample_marketplace',
        version: '1.0.0'
      },
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.events.push(analyticsEvent);
    
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event, properties);
    }

    // In production, send to analytics service
    this.sendToAnalyticsService(analyticsEvent);
    
    // Store locally for demo purposes
    this.storeLocally(analyticsEvent);
  }

  trackPageView(path: string, title?: string, referrer?: string) {
    if (!this.isEnabled) return;

    const pageView: PageView = {
      path,
      title,
      referrer: referrer || document.referrer,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.pageViews.push(pageView);
    this.track('page_view', { path, title, referrer });
  }

  // User identification
  identify(userId: string, properties?: UserProperties) {
    this.userId = userId;
    
    this.track('user_identified', {
      userId,
      ...properties
    });
  }

  // A-Ha moment tracking
  trackAHaMoment(type: string, duration?: number, data?: any) {
    const impactLevel = this.getAHaMomentImpact(type);
    this.track('aha_moment', {
      moment_type: type,
      duration_ms: duration,
      ...data,
      impact_level: impactLevel
    });
  }

  private getAHaMomentImpact(type: string): 'low' | 'medium' | 'high' {
    const impactLevels: Record<string, 'low' | 'medium' | 'high'> = {
      'instant_quote': 'high',
      'quality_shield': 'medium',
      'quota_glow': 'low',
      'confetti_export': 'high',
      'ai_suggestion': 'medium',
      'savings_counter': 'medium'
    };
    return impactLevels[type] || 'low';
  }

  // Feature usage tracking
  trackFeatureUsage(feature: string, action: string, properties?: Record<string, any>) {
    this.track('feature_usage', {
      feature_name: feature,
      action,
      ...properties
    });
  }

  // Performance tracking
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.track('performance_metric', {
      metric_name: metric,
      value,
      unit,
      user_agent: navigator.userAgent
    });
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context
    });
  }

  // Conversion tracking
  trackConversion(event: string, value?: number, currency?: string) {
    this.track('conversion', {
      conversion_event: event,
      value,
      currency: currency || 'USD',
      conversion_timestamp: new Date().toISOString()
    });
  }

  // User journey tracking
  trackUserJourney(step: string, flow: string, properties?: Record<string, any>) {
    this.track('user_journey', {
      journey_step: step,
      journey_flow: flow,
      step_timestamp: new Date().toISOString(),
      ...properties
    });
  }

  // Project lifecycle tracking
  trackProjectEvent(projectId: string, event: string, properties?: Record<string, any>) {
    this.track('project_event', {
      project_id: projectId,
      project_event: event,
      ...properties
    });
  }

  // Supplier performance tracking
  trackSupplierEvent(supplierId: string, event: string, properties?: Record<string, any>) {
    this.track('supplier_event', {
      supplier_id: supplierId,
      supplier_event: event,
      ...properties
    });
  }

  // Quality events tracking
  trackQualityEvent(type: string, severity: string, properties?: Record<string, any>) {
    this.track('quality_event', {
      quality_type: type,
      severity,
      ...properties
    });
  }
  
  // AI prompt usage tracking
  trackAIPromptUsage(used: boolean, confidence?: number) {
    this.track('ai_prompt_usage', {
      used_ai_prompt: used,
      ai_confidence: confidence,
      step: 'project_creation'
    });
  }

  // Link validation tracking
  trackLinkValidation(linkType: string, isValid: boolean, autoGenerated: boolean) {
    this.track('link_validation', {
      link_type: linkType,
      is_valid: isValid,
      auto_generated: autoGenerated
    });
  }

  // Project setup progress tracking
  trackProjectSetupProgress(step: string, completion_percentage: number) {
    this.track('project_setup_progress', {
      current_step: step,
      completion_percentage,
      timestamp: new Date().toISOString()
    });
  }

  // Private methods for sending data
  private async sendToAnalyticsService(event: AnalyticsEvent) {
    try {
      // In real implementation, send to your analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  private storeLocally(event: AnalyticsEvent) {
    if (typeof window === 'undefined') return;

    try {
      const stored = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      stored.unshift(event);
      
      // Keep only last 1000 events
      if (stored.length > 1000) {
        stored.splice(1000);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to store analytics locally:', error);
    }
  }

  // Analytics dashboard data
  getAnalyticsSummary() {
    const events = this.getStoredEvents();
    const last24Hours = events.filter(e => 
      Date.now() - new Date(e.timestamp!).getTime() < 24 * 60 * 60 * 1000
    );

    const eventCounts = events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ahaEvents = events.filter(e => e.event === 'aha_moment');
    const performanceEvents = events.filter(e => e.event === 'performance_metric');

    return {
      totalEvents: events.length,
      eventsLast24h: last24Hours.length,
      topEvents: Object.entries(eventCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      ahaEventCount: ahaEvents.length,
      avgSessionDuration: this.calculateAvgSessionDuration(events),
      performanceMetrics: this.summarizePerformanceMetrics(performanceEvents)
    };
  }

  private getStoredEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  private calculateAvgSessionDuration(events: AnalyticsEvent[]): number {
    const sessions = events.reduce((acc, event) => {
      if (!event.sessionId) return acc;
      
      if (!acc[event.sessionId]) {
        acc[event.sessionId] = {
          start: new Date(event.timestamp!).getTime(),
          end: new Date(event.timestamp!).getTime()
        };
      } else {
        acc[event.sessionId].end = Math.max(
          acc[event.sessionId].end,
          new Date(event.timestamp!).getTime()
        );
      }
      
      return acc;
    }, {} as Record<string, { start: number; end: number }>);

    const durations = Object.values(sessions).map(s => s.end - s.start);
    return durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length / 1000 / 60 // minutes
      : 0;
  }

  private summarizePerformanceMetrics(events: AnalyticsEvent[]) {
    const metrics = events.reduce((acc, event) => {
      const metricName = event.properties?.metric_name;
      const value = event.properties?.value;
      
      if (metricName && typeof value === 'number') {
        if (!acc[metricName]) acc[metricName] = [];
        acc[metricName].push(value);
      }
      
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(metrics).reduce((acc, [name, values]) => {
      acc[name] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
      return acc;
    }, {} as Record<string, any>);
  }

  // Utility methods
  setUserId(userId: string) {
    this.userId = userId;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  reset() {
    this.sessionId = this.generateSessionId();
    this.userId = undefined;
    this.events = [];
    this.pageViews = [];
  }
}

export const analytics = new AnalyticsService();
