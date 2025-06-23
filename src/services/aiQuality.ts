// AI Quality Guardian service for fraud detection and quality scoring
interface QualityCheckRequest {
  session_id: string;
  responses: any[];
  completion_time: number;
  device_info: any;
  ip_address?: string;
  user_agent?: string;
}

interface QualityCheckResponse {
  quality_score: number; // 0-100
  risk_level: 'low' | 'medium' | 'high';
  risk_flags: string[];
  recommendations: string[];
  auto_action: 'approve' | 'flag' | 'reject' | 'replace';
  confidence: number;
  explanation: string;
}

interface QualityAlert {
  id: string;
  timestamp: string;
  type: 'fraud_detected' | 'quality_issue' | 'pattern_anomaly' | 'auto_replacement';
  severity: 'low' | 'medium' | 'high';
  description: string;
  action_taken: string;
  respondent_id?: string;
  project_id: string;
  auto_resolved: boolean;
}

class AIQualityService {
  private qualityAlerts: QualityAlert[] = [];
  private qualityThresholds = {
    min_completion_time: 30, // seconds
    max_completion_time: 3600, // 1 hour
    min_quality_score: 75,
    fraud_score_threshold: 80
  };

  // Mock AI quality check - in real implementation this would call ML model
  async checkResponseQuality(request: QualityCheckRequest): Promise<QualityCheckResponse> {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay

    const qualityFactors = this.analyzeQualityFactors(request);
    const qualityScore = this.calculateQualityScore(qualityFactors);
    const riskLevel = this.determineRiskLevel(qualityScore, qualityFactors);
    const riskFlags = this.identifyRiskFlags(qualityFactors);
    
    return {
      quality_score: qualityScore,
      risk_level: riskLevel,
      risk_flags: riskFlags,
      recommendations: this.generateRecommendations(riskLevel, riskFlags),
      auto_action: this.determineAutoAction(qualityScore, riskLevel),
      confidence: Math.min(95, 70 + Math.random() * 25),
      explanation: this.generateExplanation(qualityScore, riskFlags)
    };
  }

  private analyzeQualityFactors(request: QualityCheckRequest) {
    const factors = {
      completion_time_score: this.analyzeCompletionTime(request.completion_time),
      response_pattern_score: this.analyzeResponsePatterns(request.responses),
      device_consistency_score: this.analyzeDeviceConsistency(request.device_info),
      engagement_score: this.analyzeEngagement(request.responses),
      fraud_indicators: this.detectFraudIndicators(request)
    };

    return factors;
  }

  private analyzeCompletionTime(completionTime: number): number {
    // Score based on completion time (too fast or too slow is suspicious)
    if (completionTime < this.qualityThresholds.min_completion_time) {
      return 20; // Too fast - likely speeding
    }
    if (completionTime > this.qualityThresholds.max_completion_time) {
      return 40; // Too slow - might be abandoned/distracted
    }
    
    // Optimal range: 1-20 minutes for typical survey
    const optimalMin = 60;
    const optimalMax = 1200;
    
    if (completionTime >= optimalMin && completionTime <= optimalMax) {
      return 95;
    }
    
    return 70 + Math.random() * 20; // Mock variable score
  }

  private analyzeResponsePatterns(responses: any[]): number {
    // Mock analysis of response patterns
    const patterns = {
      straight_lining: Math.random() < 0.1, // 10% chance of straight-lining
      random_responses: Math.random() < 0.05, // 5% chance of random responses
      inconsistent_answers: Math.random() < 0.15, // 15% chance of inconsistencies
      meaningful_text: Math.random() > 0.2 // 80% chance of meaningful text responses
    };

    let score = 90;
    if (patterns.straight_lining) score -= 30;
    if (patterns.random_responses) score -= 40;
    if (patterns.inconsistent_answers) score -= 20;
    if (!patterns.meaningful_text) score -= 15;

    return Math.max(0, score);
  }

  private analyzeDeviceConsistency(deviceInfo: any): number {
    // Mock device analysis
    return 80 + Math.random() * 20;
  }

  private analyzeEngagement(responses: any[]): number {
    // Mock engagement analysis
    return 75 + Math.random() * 25;
  }

  private detectFraudIndicators(request: QualityCheckRequest): string[] {
    const indicators: string[] = [];
    
    // Mock fraud detection
    if (Math.random() < 0.05) indicators.push('duplicate_ip');
    if (Math.random() < 0.03) indicators.push('bot_behavior');
    if (Math.random() < 0.02) indicators.push('vpn_usage');
    if (Math.random() < 0.04) indicators.push('suspicious_location');
    
    return indicators;
  }

  private calculateQualityScore(factors: any): number {
    const weights = {
      completion_time_score: 0.2,
      response_pattern_score: 0.3,
      device_consistency_score: 0.15,
      engagement_score: 0.25,
      fraud_penalty: 0.1
    };

    let score = 
      factors.completion_time_score * weights.completion_time_score +
      factors.response_pattern_score * weights.response_pattern_score +
      factors.device_consistency_score * weights.device_consistency_score +
      factors.engagement_score * weights.engagement_score;

    // Apply fraud penalty
    const fraudPenalty = factors.fraud_indicators.length * 15;
    score = Math.max(0, score - fraudPenalty);

    return Math.round(score);
  }

  private determineRiskLevel(qualityScore: number, factors: any): 'low' | 'medium' | 'high' {
    if (qualityScore < 50 || factors.fraud_indicators.length > 2) return 'high';
    if (qualityScore < 75 || factors.fraud_indicators.length > 0) return 'medium';
    return 'low';
  }

  private identifyRiskFlags(factors: any): string[] {
    const flags: string[] = [];
    
    if (factors.completion_time_score < 50) flags.push('suspicious_timing');
    if (factors.response_pattern_score < 60) flags.push('poor_response_quality');
    if (factors.engagement_score < 70) flags.push('low_engagement');
    if (factors.fraud_indicators.length > 0) flags.push('fraud_indicators');
    
    return flags;
  }

  private generateRecommendations(riskLevel: string, riskFlags: string[]): string[] {
    const recommendations: string[] = [];
    
    switch (riskLevel) {
      case 'high':
        recommendations.push('Recommend rejection and replacement');
        recommendations.push('Flag for manual review if replacement not available');
        break;
      case 'medium':
        recommendations.push('Consider additional quality checks');
        recommendations.push('Monitor for patterns across project');
        break;
      default:
        recommendations.push('Response meets quality standards');
    }
    
    if (riskFlags.includes('suspicious_timing')) {
      recommendations.push('Review completion time against survey length');
    }
    
    return recommendations;
  }

  private determineAutoAction(qualityScore: number, riskLevel: string): 'approve' | 'flag' | 'reject' | 'replace' {
    if (qualityScore < 40 || riskLevel === 'high') return 'replace';
    if (qualityScore < 60 || riskLevel === 'medium') return 'flag';
    return 'approve';
  }

  private generateExplanation(qualityScore: number, riskFlags: string[]): string {
    if (qualityScore >= 90) {
      return 'Excellent response quality with no significant risk factors detected.';
    }
    if (qualityScore >= 75) {
      return 'Good response quality with minor areas for attention.';
    }
    if (qualityScore >= 50) {
      return `Moderate quality concerns detected: ${riskFlags.join(', ')}. Requires review.`;
    }
    return `Poor response quality with significant issues: ${riskFlags.join(', ')}. Recommended for replacement.`;
  }

  // Quality monitoring and alerts
  async processQualityAlert(alert: Omit<QualityAlert, 'id' | 'timestamp'>): Promise<QualityAlert> {
    const fullAlert: QualityAlert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    this.qualityAlerts.unshift(fullAlert);
    
    // Keep only last 100 alerts
    if (this.qualityAlerts.length > 100) {
      this.qualityAlerts = this.qualityAlerts.slice(0, 100);
    }

    return fullAlert;
  }

  getQualityAlerts(projectId?: string): QualityAlert[] {
    return projectId 
      ? this.qualityAlerts.filter(alert => alert.project_id === projectId)
      : this.qualityAlerts;
  }

  getQualityStats(projectId: string) {
    const alerts = this.getQualityAlerts(projectId);
    const totalAlerts = alerts.length;
    const autoResolved = alerts.filter(a => a.auto_resolved).length;
    const fraudDetected = alerts.filter(a => a.type === 'fraud_detected').length;
    
    return {
      total_alerts: totalAlerts,
      auto_resolved: autoResolved,
      fraud_detected: fraudDetected,
      auto_resolution_rate: totalAlerts > 0 ? (autoResolved / totalAlerts) * 100 : 0,
      fraud_rate: totalAlerts > 0 ? (fraudDetected / totalAlerts) * 100 : 0,
      quality_score: 100 - (totalAlerts > 0 ? (fraudDetected / totalAlerts) * 100 : 0) // Calculate quality score based on fraud rate
    };
  }

  // Simulate ongoing quality monitoring
  startQualityMonitoring(projectId: string) {
    const interval = setInterval(async () => {
      // Simulate random quality events
      if (Math.random() < 0.3) { // 30% chance of quality event
        const eventTypes = ['fraud_detected', 'quality_issue', 'auto_replacement'] as const;
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        let alert: Omit<QualityAlert, 'id' | 'timestamp'>;
        
        switch (eventType) {
          case 'fraud_detected':
            alert = {
              type: 'fraud_detected',
              severity: 'high',
              description: 'AI Guardian detected suspicious response patterns from potential bot',
              action_taken: 'Response rejected and replacement requested',
              project_id: projectId,
              auto_resolved: true,
              respondent_id: `resp_${Date.now()}`
            };
            break;
            
          case 'quality_issue':
            alert = {
              type: 'quality_issue',
              severity: 'medium',
              description: 'Response quality below threshold - straight-line responses detected',
              action_taken: 'Response flagged for manual review',
              project_id: projectId,
              auto_resolved: false,
              respondent_id: `resp_${Date.now()}`
            };
            break;
            
          case 'auto_replacement':
            alert = {
              type: 'auto_replacement',
              severity: 'low',
              description: 'Low quality response automatically replaced with new respondent',
              action_taken: 'Replacement respondent sourced successfully',
              project_id: projectId,
              auto_resolved: true,
              respondent_id: `resp_${Date.now()}`
            };
            break;
        }

        await this.processQualityAlert(alert);
      }
    }, 8000 + Math.random() * 12000); // Random interval 8-20 seconds

    // Store interval for cleanup
    (this as any)[`monitoring_${projectId}`] = interval;
    
    return () => {
      clearInterval(interval);
      delete (this as any)[`monitoring_${projectId}`];
    };
  }

  stopQualityMonitoring(projectId: string) {
    const interval = (this as any)[`monitoring_${projectId}`];
    if (interval) {
      clearInterval(interval);
      delete (this as any)[`monitoring_${projectId}`];
    }
  }
}

export const aiQualityService = new AIQualityService();
