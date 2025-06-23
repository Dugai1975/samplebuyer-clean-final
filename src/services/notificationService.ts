import React from 'react';
import { notification } from 'antd';
import { SoftLaunchConfig, SoftLaunchResult } from './softLaunchService';
import { errorLogger } from './errorLogger';

/**
 * Notification preferences (mocked for now)
 */
const userNotificationPrefs = {
  inApp: true,
  browser: true,
  email: false // Email is mocked
};

/**
 * Utility to get project name (mocked; replace with real lookup if needed)
 */
async function getProjectName(projectId: string): Promise<string> {
  // In a real app, fetch from store or API
  return `Project ${projectId.substring(0, 6)}`;
}

/**
 * Utility to get review/action URL (mocked)
 */
function getProjectUrl(projectId: string): string {
  // Updated to use projectDetail route instead of deleted /projects/ route
  return `/projectDetail?id=${projectId}`;
}

/**
 * NotificationService handles all soft launch notifications.
 */
class NotificationService {
  async sendSoftLaunchStarted(projectId: string, config: SoftLaunchConfig) {
    const projectName = await getProjectName(projectId);
    const message = `🧪 Soft launch started for ${projectName}`;
    const description = `Monitoring ${config.test_limit} ${config.test_limit_type === 'fixed' ? 'test completes' : '% sample'} with auto-pause ${config.auto_pause ? 'enabled' : 'disabled'}.`;
    const url = getProjectUrl(projectId);
    this.notify({
      message,
      description,
      url,
      icon: '🧪',
      color: '#52c41a',
      type: 'info'
    });
  }

  async sendSoftLaunchPaused(projectId: string, testResults: SoftLaunchResult) {
    const projectName = await getProjectName(projectId);
    const message = `⏸️ Soft launch paused for ${projectName}`;
    const description = `Ready for review. Quality score: ${testResults.quality_score}/10, Avg. response: ${testResults.avg_response_time} min.`;
    const url = getProjectUrl(projectId);
    this.notify({
      message,
      description,
      url,
      icon: '⏸️',
      color: '#faad14',
      type: 'warning'
    });
  }

  async sendSoftLaunchPromoted(projectId: string) {
    const projectName = await getProjectName(projectId);
    const message = `🚀 ${projectName} promoted to full launch`;
    const description = `Collecting remaining sample. Full launch is now live.`;
    const url = getProjectUrl(projectId);
    this.notify({
      message,
      description,
      url,
      icon: '🚀',
      color: '#1890ff',
      type: 'success'
    });
  }

  async sendSoftLaunchError(projectId: string, error: string) {
    const projectName = await getProjectName(projectId);
    const message = `❗ Soft launch error for ${projectName}`;
    const description = error;
    const url = getProjectUrl(projectId);
    this.notify({
      message,
      description,
      url,
      icon: '❗',
      color: '#ff4d4f',
      type: 'error'
    });
  }

  /**
   * Main notification dispatcher
   */
  private notify({ message, description, url, icon, color, type }: {
    message: string;
    description: string;
    url: string;
    icon: string;
    color: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }) {
    // In-app notification
    if (userNotificationPrefs.inApp) {
      try {
        notification[type]({
          message: React.createElement('span', null, icon + ' ', React.createElement('span', { style: { color } }, message)),
          description: React.createElement(
            'span',
            null,
            description,
            ' ',
            React.createElement('a', { href: url, style: { marginLeft: 8 } }, 'Review')
          ),
          duration: 6,
          placement: 'topRight',
        });
      } catch (err) {
        errorLogger.log('NotificationService.notify.inApp', err);
      }
    }
    // Browser notification
    if (userNotificationPrefs.browser && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          new Notification(message, {
            body: description,
            icon: '/favicon.ico',
            data: { url },
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(message, {
                body: description,
                icon: '/favicon.ico',
                data: { url },
              });
            } else {
              errorLogger.reportUserError('NotificationService.notify.browser', 'Browser notification permission denied.');
            }
          }).catch(err => {
            errorLogger.log('NotificationService.notify.browser.requestPermission', err);
          });
        } else {
          errorLogger.reportUserError('NotificationService.notify.browser', 'Browser notification permission denied.');
        }
      } catch (err) {
        errorLogger.log('NotificationService.notify.browser', err);
      }
    }
    // Email notification (mock)
    if (userNotificationPrefs.email) {
      try {
        // Simulate sending email
        console.info(`[EMAIL] ${message}: ${description} (link: ${url})`);
      } catch (err) {
        errorLogger.log('NotificationService.notify.email', err);
      }
    }
  }
}

export const notificationService = new NotificationService();
