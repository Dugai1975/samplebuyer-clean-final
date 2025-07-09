import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
    }[];
  };
  size?: number;
  cutout?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  maintainAspectRatio?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  size = 200, 
  cutout = '70%', 
  showLegend = false, 
  showTooltip = false,
  maintainAspectRatio = false 
}) => {
  const options = {
    cutout,
    maintainAspectRatio,
    plugins: {
      legend: { display: showLegend },
      tooltip: { enabled: showTooltip }
    }
  };

  return (
    <div style={{ width: size, height: size }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DonutChart;
