import { useState, useEffect, useRef } from 'react';
import { websocketService } from '@/services/websocket';

export const useWebSocket = (projectId?: string) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const subscriptionsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!projectId) return;

    // Connect to WebSocket
    websocketService.connect(projectId);
    setConnectionStatus('connecting');

    // Subscribe to connection events
    const unsubscribeConnect = websocketService.subscribe('connect', () => {
      setConnectionStatus('connected');
    });

    const unsubscribeUpdate = websocketService.subscribe('update', (data: any) => {
      setLastMessage(data);
      setUpdates(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 updates
    });

    // Store unsubscribe functions
    subscriptionsRef.current = [unsubscribeConnect, unsubscribeUpdate];

    return () => {
      // Cleanup subscriptions
      subscriptionsRef.current.forEach(unsub => unsub());
      websocketService.disconnect();
      setConnectionStatus('disconnected');
    };
  }, [projectId]);

  const subscribeToEvent = (event: string, callback: Function) => {
    const unsubscribe = websocketService.subscribe(event, callback);
    subscriptionsRef.current.push(unsubscribe);
    return unsubscribe;
  };

  return {
    connectionStatus,
    lastMessage,
    updates,
    subscribeToEvent
  };
};

export const useProjectUpdates = (projectId?: string) => {
  const [projectData, setProjectData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { connectionStatus, subscribeToEvent } = useWebSocket(projectId);

  useEffect(() => {
    if (!projectId) return;

    // Subscribe to specific project update types
    const unsubscribeCompletion = subscribeToEvent('completion_update', (data: any) => {
      if (data.projectId === projectId) {
        setProjectData((prev: any) => prev ? {
          ...prev,
          fielded: data.data.fielded,
          completion_percentage: prev.goal ? (data.data.fielded / prev.goal) * 100 : 0
        } : null);
        
        setNotifications(prev => [{
          id: Date.now(),
          type: 'completion',
          message: `New completion recorded! Total: ${data.data.fielded}`,
          timestamp: data.data.timestamp
        }, ...prev.slice(0, 9)]);
      }
    });

    const unsubscribeQuality = subscribeToEvent('quality_alert', (data: any) => {
      if (data.projectId === projectId) {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'quality',
          message: data.data.message,
          severity: data.data.severity,
          timestamp: data.data.timestamp
        }, ...prev.slice(0, 9)]);
      }
    });

    const unsubscribeSupplier = subscribeToEvent('supplier_update', (data: any) => {
      if (data.projectId === projectId) {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'supplier',
          message: `${data.data.supplier_name}: +${data.data.new_completes} completes`,
          timestamp: data.data.timestamp
        }, ...prev.slice(0, 9)]);
      }
    });

    return () => {
      unsubscribeCompletion();
      unsubscribeQuality();
      unsubscribeSupplier();
    };
  }, [projectId, subscribeToEvent]);

  return {
    connectionStatus,
    projectData,
    setProjectData,
    notifications
  };
};
