// WebSocket service for real-time updates
class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnecting = false;

  connect(projectId?: string) {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    // Connect to original system WebSocket endpoint
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001'}/projects/${projectId}`;
    try {
      this.socket = new WebSocket(wsUrl);
      this.socket.onopen = () => {
        console.log('🔌 Connected to original system WebSocket');
        this.isConnecting = false;
        this.emit('connect', { projectId });
      };
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Map original system WebSocket messages to enhanced format
          const mappedData = this.mapOriginalWebSocketData(data);
          this.emit(mappedData.type, mappedData);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      this.socket.onerror = () => {
        console.log('WebSocket connection failed, falling back to mock updates');
        this.setupMockWebSocket(projectId);
      };
    } catch (error) {
      console.log('WebSocket not supported, using mock updates');
      this.setupMockWebSocket(projectId);
    }
  }

  private setupMockWebSocket(projectId?: string) {
    // Simulate WebSocket connection with periodic updates
    console.log('🔌 Mock WebSocket connected for project:', projectId);
    
    // Simulate connection success
    setTimeout(() => {
      this.isConnecting = false;
      this.emit('connect', { projectId });
      
      // Start sending mock updates
      this.startMockUpdates(projectId);
    }, 1000);
  }

  private startMockUpdates(projectId?: string) {
    // Simulate real-time project updates
    const updateInterval = setInterval(() => {
      if (!projectId) return;

      // Simulate different types of updates
      const updateTypes = [
        'completion_update',
        'quality_alert',
        'supplier_update',
        'quota_progress'
      ];

      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      
      let mockData;
      switch (randomType) {
        case 'completion_update':
          mockData = {
            type: 'completion_update',
            projectId,
            data: {
              fielded: Math.floor(Math.random() * 5) + 70, // Random between 70-75
              timestamp: new Date().toISOString(),
              respondent_id: `resp_${Date.now()}`
            }
          };
          break;
          
        case 'quality_alert':
          mockData = {
            type: 'quality_alert',
            projectId,
            data: {
              message: 'AI Guardian flagged suspicious response pattern',
              severity: 'medium',
              action_taken: 'auto_replaced',
              timestamp: new Date().toISOString()
            }
          };
          break;
          
        case 'supplier_update':
          mockData = {
            type: 'supplier_update',
            projectId,
            data: {
              supplier_name: ['PureSpectrum', 'Cint', 'Dynata'][Math.floor(Math.random() * 3)],
              new_completes: Math.floor(Math.random() * 3) + 1,
              quality_score: Math.floor(Math.random() * 10) + 90,
              timestamp: new Date().toISOString()
            }
          };
          break;
          
        case 'quota_progress':
          mockData = {
            type: 'quota_progress',
            projectId,
            data: {
              quota_name: 'Male 25-34',
              current: Math.floor(Math.random() * 5) + 20,
              target: 25,
              timestamp: new Date().toISOString()
            }
          };
          break;
      }

      if (mockData) {
        this.emit(randomType, mockData);
        this.emit('update', mockData);
      }
    }, 5000 + Math.random() * 10000); // Random interval between 5-15 seconds

    // Store interval for cleanup
    (this as any).mockInterval = updateInterval;
  }

  disconnect() {
    if ((this as any).mockInterval) {
      clearInterval((this as any).mockInterval);
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.isConnecting = false;
    console.log('🔌 WebSocket disconnected');
  }

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  getConnectionStatus() {
    return this.socket?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected';
  }
  private mapOriginalWebSocketData(originalData: any) {
    // Map original system WebSocket messages to enhanced format
    switch (originalData.type) {
      case 'project_update':
        return {
          type: 'completion_update',
          projectId: originalData.project_id,
          data: {
            fielded: originalData.count_complete,
            goal: originalData.total_available,
            timestamp: originalData.timestamp || new Date().toISOString()
          }
        };
      case 'quality_alert':
        return {
          type: 'quality_alert',
          projectId: originalData.project_id,
          data: {
            message: originalData.message,
            severity: originalData.severity || 'medium',
            quality_score: originalData.quality_score
          }
        };
      default:
        return originalData;
    }
  }
}

export const websocketService = new WebSocketService();
