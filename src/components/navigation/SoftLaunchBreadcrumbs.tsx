import React from "react";
import { Breadcrumb } from "antd";
import { useParams, useRouter } from "next/navigation";

interface SoftLaunchBreadcrumbsProps {
  projectId?: string;
  currentStep?: "config" | "test" | "review" | "launch";
}

const stepMap = {
  config: "Soft Launch Config",
  test: "Test Running",
  review: "Review Results",
  launch: "Full Launch"
};

const SoftLaunchBreadcrumbs: React.FC<SoftLaunchBreadcrumbsProps> = ({ projectId, currentStep }) => {
  const router = useRouter();
  const params = useParams();
  const pid = projectId || (params?.id as string);

  const items = [
    { title: <a href="/projects">Projects</a> },
    { title: <a href={`/projects/${pid}`}>Project Detail</a> },
  ];
  if (currentStep && stepMap[currentStep]) {
    items.push({ title: <span>{stepMap[currentStep]}</span> });
  }

  return <Breadcrumb items={items} className="mb-4" />;
};

export default SoftLaunchBreadcrumbs;
