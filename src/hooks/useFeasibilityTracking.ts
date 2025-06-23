import { useState, useRef } from 'react';

export const useFeasibilityTracking = () => {
  const [ahaTriggered, setAhaTriggered] = useState(false);
  const startTimeRef = useRef<number>();

  const startTracking = () => {
    startTimeRef.current = Date.now();
    setAhaTriggered(false);
  };

  const completeTracking = (userId?: string) => {
    if (startTimeRef.current && !ahaTriggered) {
      const duration = Date.now() - startTimeRef.current;
      
      if (duration < 10000) { // Under 10 seconds = A-Ha moment
        console.log('🎉 A-Ha Moment: 10-Second Quote achieved!', duration + 'ms');
        setAhaTriggered(true);
        
        // Track the moment
        if (typeof window !== 'undefined') {
          // Store A-Ha moment for analytics
          localStorage.setItem('lastAhaMoment', JSON.stringify({
            type: 'instant_quote',
            duration,
            timestamp: new Date().toISOString(),
            userId: userId || 'anonymous'
          }));
        }
        
        return true;
      }
    }
    return false;
  };

  return {
    startTracking,
    completeTracking,
    ahaTriggered
  };
};
