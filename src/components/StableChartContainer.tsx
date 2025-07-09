import React, { useRef, useEffect, useState } from 'react';

interface StableChartContainerProps {
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
}

/**
 * A container component that provides a stable environment for Chart.js charts
 * to prevent unnecessary re-renders and flickering
 */
const StableChartContainer: React.FC<StableChartContainerProps> = ({ 
  children, 
  width = '100%', 
  height = '100%' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      });
      
      resizeObserver.observe(containerRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width, 
        height,
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
};

export default StableChartContainer;
