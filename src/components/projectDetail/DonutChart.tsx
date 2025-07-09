"use client";
import dynamic from "next/dynamic";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);
import React from "react";
import type { ChartData, ChartOptions } from "chart.js";

// Dynamically import Doughnut from react-chartjs-2 for SSR safety
const Doughnut = dynamic(
  () => import("react-chartjs-2").then(mod => mod.Doughnut),
  { ssr: false }
);

interface DonutChartProps {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, options, size = 200 }) => {
  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      style={{ flex: 'none' }}
    >
      <Doughnut
        data={data}
        options={{
          cutout: "75%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          animation: false,
          maintainAspectRatio: false,
          ...options,
        }}
        width={undefined}
        height={undefined}
        style={{ width: "100%", height: "100%" }}
      />
      {/* Center content can be placed here if needed */}
    </div>
  );
};

export default DonutChart;
