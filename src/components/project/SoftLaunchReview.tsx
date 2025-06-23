import React, { useMemo, useRef, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Button,
  Space,
  Spin,
  Typography
} from 'antd';
import { CheckCircleTwoTone, WarningTwoTone, CloseCircleTwoTone, FieldTimeOutlined, LineChartOutlined, ExclamationCircleTwoTone } from '@ant-design/icons';
import { useProjectLiveData } from '@/hooks/useRealTimeUpdates';
import type { SoftLaunchResult } from '@/services/softLaunchService';
import { errorLogger } from '@/services/errorLogger';
import styles from './SoftLaunchMobilePolish.module.css';

const { Title, Text } = Typography;

// Simple confetti animation
const Confetti: React.FC<{ show: boolean }> = React.memo(({ show }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const confettiCount = 120;
    const confetti: {x:number;y:number;r:number;d:number;color:string;tilt:number;tiltAngleIncremental:number;tiltAngle:number;}[] = [];
    const colors = ['#ffec3d','#36cfc9','#ff85c0','#bae637','#ff4d4f','#40a9ff','#9254de'];
    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random()*W,
        y: Math.random()*H - H,
        r: Math.random()*8+4,
        d: Math.random()*confettiCount,
        color: colors[Math.floor(Math.random()*colors.length)],
        tilt: Math.floor(Math.random()*10)-10,
        tiltAngleIncremental: (Math.random()*0.07)+.05,
        tiltAngle: 0
      });
    }
    let angle = 0;
    let animationFrame: number;
    function draw() {
      if (!ctx) return; // Fix: null check for ctx
      ctx.clearRect(0,0,W,H);
      angle += 0.01;
      for (let i = 0; i < confettiCount; i++) {
        let c = confetti[i];
        c.tiltAngle += c.tiltAngleIncremental;
        c.y += (Math.cos(angle+c.d)+3+c.r/2)/2;
        c.x += Math.sin(angle);
        c.tilt = Math.sin(c.tiltAngle- (i%3)) * 15;
        ctx.beginPath();
        ctx.lineWidth = c.r;
        ctx.strokeStyle = c.color;
        ctx.moveTo(c.x+c.tilt+6,c.y);
        ctx.lineTo(c.x,c.y+c.tilt+6);
        ctx.stroke();
      }
      animationFrame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [show]);
  if (!show) return null;
  return <canvas ref={canvasRef} className={styles.softLaunchConfetti} aria-hidden="true" tabIndex={-1}/>;
});

const SoftLaunchSkeleton: React.FC = React.memo(() => (
  <div aria-busy="true" aria-label="Loading soft launch results">
    <div className={styles.softLaunchSkeleton} style={{height: 60, width: '100%', marginBottom: 16}}/>
    <div className={styles.softLaunchSkeleton} style={{height: 120, width: '100%'}}/>
    <div className={styles.softLaunchSkeleton} style={{height: 80, width: '100%', marginTop: 16}}/>
  </div>
));

// ErrorBoundary for runtime errors
class SoftLaunchErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    errorLogger.log('SoftLaunchReview.runtime', {error, info});
  }
  render() {
    if (this.state.hasError) {
      return (
        <Alert
          type="error"
          message="An unexpected error occurred in the review UI."
          description={<span>
            Please refresh the page or <a href="mailto:support@example.com">contact support</a>.<br/>
            <Button onClick={() => window.location.reload()} style={{marginTop: 8}}>Reload Page</Button>
          </span>}
          showIcon
        />
      );
    }
    return this.props.children;
  }
}


export interface SoftLaunchReviewProps {
  projectId: string;
  onPromoteToFullLaunch: () => void;
  onAdjustSettings: () => void;
  onRunAnotherTest: () => void;
}

export const SoftLaunchReview: React.FC<SoftLaunchReviewProps> = React.memo(({ projectId, onPromoteToFullLaunch, onAdjustSettings, onRunAnotherTest }) => {
  const [promotionLoading, setPromotionLoading] = React.useState(false);
  const [promotionSuccess, setPromotionSuccess] = React.useState(false);
  const [promotionError, setPromotionError] = React.useState<string | null>(null);

  const handlePromote = React.useCallback(async () => {
    setPromotionLoading(true);
    setPromotionError(null);
    try {
      await import('@/services/softLaunchService').then(({ softLaunchService }) => softLaunchService.promoteToFullLaunch(projectId));
      setPromotionSuccess(true);
      if (onPromoteToFullLaunch) onPromoteToFullLaunch();
      setTimeout(() => setPromotionSuccess(false), 4000); // Hide after 4s
    } catch (err: any) {
      setPromotionError(err?.message || 'Failed to promote to full launch. Please try again.');
    } finally {
      setPromotionLoading(false);
    }
  }, [projectId, onPromoteToFullLaunch]);
  // Fetch live data (simulate SoftLaunchResult)
  const { liveData, loading, error } = useProjectLiveData(projectId);
  const [retryCount, setRetryCount] = React.useState(0);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const testResults: SoftLaunchResult | null = liveData as SoftLaunchResult;

  React.useEffect(() => {
    if (error) {
      errorLogger.log('SoftLaunchReview.dataFetch', error);
    }
  }, [error]);

  const handleRetry = useCallback(() => {
    setRetryCount(c => c + 1);
    window.location.reload();
  }, []);

  // Derived metrics and recommendations
  const {
    percentComplete,
    qualityStatus,
    qualityColor,
    recommendation,
    costSuggestion,
    riskAssessment,
    performanceAlerts
  } = useMemo(() => {
    if (!testResults) return {
      percentComplete: 0,
      qualityStatus: 'N/A',
      qualityColor: '#d9d9d9',
      recommendation: 'Insufficient data',
      costSuggestion: '',
      riskAssessment: '',
      performanceAlerts: []
    };
    const percentComplete = Math.round((testResults.completes / testResults.test_limit) * 100);
    let qualityStatus = 'Good';
    let qualityColor = '#52c41a';
    let recommendation = 'Ready for Full Launch';
    let costSuggestion = 'No major cost risks detected.';
    let riskAssessment = 'Low risk';
    const performanceAlerts: React.ReactNode[] = [];
    if (testResults.quality_score < 7.5) {
      qualityStatus = 'Warning';
      qualityColor = '#faad14';
      recommendation = 'Needs Review';
      riskAssessment = 'Moderate risk';
      performanceAlerts.push(
        <Alert
          key="quality"
          type="warning"
          message="Quality score below optimal. Review responses for potential issues."
          showIcon
          style={{ marginBottom: 8 }}
        />
      );
    }
    if (testResults.quality_score < 5) {
      qualityStatus = 'Critical';
      qualityColor = '#ff4d4f';
      recommendation = 'Do NOT Launch';
      riskAssessment = 'High risk';
      performanceAlerts.push(
        <Alert
          key="critical"
          type="error"
          message="Critical quality issues detected. Do not proceed without investigation."
          showIcon
          style={{ marginBottom: 8 }}
        />
      );
    }
    if (testResults.avg_response_time > 10) {
      costSuggestion = 'Consider reducing LOI or increasing incentive to improve response time.';
      performanceAlerts.push(
        <Alert
          key="slow"
          type="info"
          message="Average response time is higher than expected."
          showIcon
          style={{ marginBottom: 8 }}
        />
      );
    }
    if (testResults.issues_found && testResults.issues_found.length > 0) {
      recommendation = 'Needs Review';
      riskAssessment = 'Moderate risk';
      performanceAlerts.push(
        <Alert
          key="issues"
          type="warning"
          message={`Issues detected: ${testResults.issues_found.join(', ')}`}
          showIcon
          style={{ marginBottom: 8 }}
        />
      );
    }
    return {
      percentComplete,
      qualityStatus,
      qualityColor,
      recommendation,
      costSuggestion,
      riskAssessment,
      performanceAlerts
    };
  }, [testResults]);

  return (
    <SoftLaunchErrorBoundary>
      <Confetti show={showConfetti} />
      <Card
        title={<span className={styles.softLaunchTitle}><LineChartOutlined className="mr-2" aria-hidden="true" />Soft Launch Test Results</span>}
        bordered={false}
        className={`${styles.softLaunchCard} mb-6`}
        role="region"
        aria-label="Soft Launch Test Results"
      >
        {loading ? (
          <SoftLaunchSkeleton />
        ) : error ? (
          <Alert
            type="error"
            message="Failed to load soft launch results."
            description={<span>
              {typeof error === 'string' ? error : (error as any)?.message || 'A network or server error occurred.'}<br />
              <Button onClick={handleRetry} className={styles.softLaunchButton} style={{ marginTop: 8 }}>Retry</Button>
              <Button type="link" href="mailto:support@example.com" className={styles.softLaunchButton} style={{ marginLeft: 8 }}>Contact Support</Button>
            </span>}
            showIcon
            aria-live="assertive"
          />
        ) : !testResults ? (
          <Alert type="info" message="No test results available yet." showIcon aria-live="polite" />
        ) : (
          <>
            <Row gutter={[16, 16]} className={styles.softLaunchMobileStack}>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" bordered className={styles.softLaunchCard}>
                  <Statistic
                    title={<span id="completes-label">Completes</span>}
                    value={testResults.completes}
                    suffix={`/${testResults.test_limit}`}
                    valueStyle={{ color: '#1890ff' }}
                    aria-labelledby="completes-label"
                  />
                  <Progress percent={percentComplete} size="small" strokeColor="#1890ff" aria-label="Progress" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" bordered className={styles.softLaunchCard}>
                  <Statistic
                    title={<span id="quality-label">Quality Score</span>}
                    value={testResults.quality_score}
                    suffix={<CheckCircleTwoTone twoToneColor={qualityColor} aria-hidden="true" />}
                    precision={1}
                    valueStyle={{ color: qualityColor }}
                    aria-labelledby="quality-label"
                  />
                  <Text type="secondary">out of 10</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" bordered className={styles.softLaunchCard}>
                  <Statistic
                    title={<span id="response-time-label">Avg. Response Time</span>}
                    value={testResults.avg_response_time}
                    suffix={<FieldTimeOutlined aria-hidden="true" />}
                    precision={1}
                    valueStyle={{ color: testResults.avg_response_time > 10 ? '#faad14' : '#52c41a' }}
                    aria-labelledby="response-time-label"
                  />
                  <Text type="secondary">minutes</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" bordered className={styles.softLaunchCard}>
                  <Statistic
                    title={<span id="incidence-label">Incidence Rate</span>}
                    value={typeof (testResults as any).incidence_rate === 'number' ? (testResults as any).incidence_rate : 'N/A'}
                    suffix={typeof (testResults as any).incidence_rate === 'number' ? '%' : ''}
                    valueStyle={{ color: '#1890ff' }}
                    aria-labelledby="incidence-label"
                  />
                  <Text type="secondary">of target</Text>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }} className={styles.softLaunchMobileStack}>
              <Col xs={24} md={16}>
                <Card size="small" bordered className={styles.softLaunchCard} title={<span><ExclamationCircleTwoTone twoToneColor="#1890ff" aria-hidden="true" /> Performance Analysis</span>}>
                  {performanceAlerts.length > 0 ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {performanceAlerts}
                    </Space>
                  ) : (
                    <Alert type="success" message="All metrics within expected range." showIcon aria-live="polite" />
                  )}
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" bordered className={styles.softLaunchCard} title={<span><CheckCircleTwoTone twoToneColor="#52c41a" aria-hidden="true" /> Recommendation</span>}>
                  <Text strong>{recommendation}</Text>
                  <br />
                  <Text type="secondary">{costSuggestion}</Text>
                  <br />
                  <Text type="secondary">Risk: {riskAssessment}</Text>
                  {promotionSuccess && (
                    <Alert
                      type="success"
                      message="Project promoted to full launch!"
                      showIcon
                      style={{ marginTop: 12 }}
                    />
                  )}
                  {promotionError && (
                    <Alert
                      type="error"
                      message={promotionError}
                      showIcon
                      style={{ marginTop: 12 }}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            {testResults.issues_found && testResults.issues_found.length > 0 && (
              <Row style={{ marginTop: 16 }} className={styles.softLaunchMobileStack}>
                <Col span={24}>
                  <Card size="small" bordered className={styles.softLaunchCard} title={<span><WarningTwoTone twoToneColor="#faad14" aria-hidden="true" /> Issues Detected</span>}>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {testResults.issues_found.map((issue, idx) => (
                        <li key={idx} style={{ color: '#faad14' }}>{issue}</li>
                      ))}
                    </ul>
                  </Card>
                </Col>
              </Row>
            )}

            <Row gutter={[16, 16]} style={{ marginTop: 24 }} className={styles.softLaunchMobileStack}>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                  onClick={handlePromote}
                  disabled={promotionLoading || promotionSuccess || recommendation !== 'Ready for Full Launch'}
                  loading={promotionLoading}
                  className={styles.softLaunchButton}
                  aria-label="Proceed to Full Launch"
                >
                  <span>Proceed to Full Launch</span>
                  <span className="sr-only"> (Success celebration will play)</span>
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  block
                  size="large"
                  icon={<WarningTwoTone twoToneColor="#faad14" aria-hidden="true" />}
                  onClick={onAdjustSettings}
                  className={styles.softLaunchButton}
                  aria-label="Adjust Settings"
                >
                  Adjust Settings
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  block
                  size="large"
                  icon={<LineChartOutlined aria-hidden="true" />}
                  onClick={onRunAnotherTest}
                  className={styles.softLaunchButton}
                  aria-label="Run Another Test"
                >
                  Run Another Test
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button block size="large" icon={<FieldTimeOutlined aria-hidden="true" />} disabled className={styles.softLaunchButton} aria-label="View Detailed Reports">
                  View Detailed Reports
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Card>
    </SoftLaunchErrorBoundary>
  );
});

export default SoftLaunchReview;
