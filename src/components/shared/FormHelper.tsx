"use client";

import React from 'react';
import { Tooltip, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface FormHelperProps {
  title: string;
  content: string | React.ReactNode;
}

export const FormHelper: React.FC<FormHelperProps> = ({ title, content }) => {
  return (
    <Tooltip title={content} placement="top">
      <Button 
        type="text" 
        icon={<QuestionCircleOutlined />} 
        size="small"
        className="text-gray-400 hover:text-blue-500"
      />
    </Tooltip>
  );
};

// Helper text content
export const FORM_HELP_TEXT = {
  incidenceRate: "Percentage of people who qualify for your survey. Lower rates require more screening and higher costs.",
  surveyLength: "Average time to complete your survey. Longer surveys typically have lower completion rates.",
  targetCompletes: "Number of completed responses needed. Consider your margin of error and confidence level requirements.",
  priorityLevel: "Rush projects use premium pricing for faster delivery. Economy options take longer but cost less.",
  surveyUrl: "Link to your survey platform (Qualtrics, SurveyMonkey, etc.). We'll redirect qualified respondents here."
};
