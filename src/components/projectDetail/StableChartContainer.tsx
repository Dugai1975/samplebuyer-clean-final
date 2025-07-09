import React from 'react';

interface StableChartContainerProps {
  children: React.ReactNode;
  size?: number;
}

const StableChartContainer: React.FC<StableChartContainerProps> = ({ children, size = 100 }) => {
  return (
    <div style={{
      width: size,
      height: size,
      flexShrink: 0,
      flexGrow: 0,
      minWidth: size,
      minHeight: size,
      maxWidth: size,
      maxHeight: size,
      position: 'relative'
    }}>
      {children}
    </div>
  );
};

export default StableChartContainer;
