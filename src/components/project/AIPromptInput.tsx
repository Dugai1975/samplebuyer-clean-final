'use client';

import React, { useState } from 'react';
import { Card, Input, Button, Typography, Alert, Spin, Tag } from 'antd';
import { BulbOutlined, ThunderboltOutlined, SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface AIPromptInputProps {
  onPromptAnalyzed: (analysis: PromptAnalysis) => void;
  onSkip: () => void;
}

interface PromptAnalysis {
  projectName: string;
  country: string;
  audience: {
    ageRange: [number, number];
    gender: string[];
    income?: string;
    interests?: string[];
  };
  surveyType: string;
  completes: number;
  incidenceRate: number;
  loi: number;
  confidence: number;
}

export const AIPromptInput: React.FC<AIPromptInputProps> = ({
  onPromptAnalyzed,
  onSkip
}) => {
  const [prompt, setPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const examplePrompts = [
    "I need 500 US adults aged 25-45 for a 10-minute brand awareness survey about electric vehicles",
    "Looking for 200 UK moms with kids under 12 for a toy preference study, should take 8 minutes",
    "Need 300 working professionals in Canada aged 30-55 for a financial services survey, 15 minutes long",
    "Want to survey 250 US gamers aged 18-35 about mobile gaming habits, quick 5-minute survey"
  ];

  const mockAnalyzePrompt = async (text: string): Promise<PromptAnalysis> => {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI analysis logic
    const analysis: PromptAnalysis = {
      projectName: extractProjectName(text),
      country: extractCountry(text),
      audience: extractAudience(text),
      surveyType: extractSurveyType(text),
      completes: extractCompletes(text),
      incidenceRate: estimateIncidence(text),
      loi: extractLOI(text),
      confidence: 85
    };
    
    return analysis;
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    
    setAnalyzing(true);
    try {
      const analysis = await mockAnalyzePrompt(prompt);
      onPromptAnalyzed(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <BulbOutlined className="text-4xl text-blue-500 mb-4" />
        <Title level={2}>Describe Your Research Project</Title>
        <Text type="secondary" className="text-lg">
          Tell us about your audience and survey needs. Our AI will intelligently set up your project parameters.
        </Text>
      </div>

      <div className="mb-6">
        <TextArea
          rows={4}
          placeholder="Example: I need 500 US adults aged 25-45 for a 10-minute brand awareness survey about electric vehicles. Looking for a mix of genders with household income above $50k."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="text-lg"
          disabled={analyzing}
        />
      </div>

      <div className="mb-6">
        <Text strong className="block mb-3">💡 Try these examples:</Text>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, index) => (
            <Tag
              key={index}
              className="cursor-pointer p-2 text-sm"
              color="blue"
              onClick={() => setPrompt(example)}
            >
              {example.substring(0, 60)}...
            </Tag>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          type="primary"
          size="large"
          icon={analyzing ? <Spin size="small" /> : <ThunderboltOutlined />}
          onClick={handleAnalyze}
          disabled={!prompt.trim() || analyzing}
          loading={analyzing}
          className="px-8"
        >
          {analyzing ? 'Analyzing with AI...' : 'Smart Setup with AI'}
        </Button>
        
        <Button
          size="large"
          onClick={onSkip}
          disabled={analyzing}
          className="px-8"
        >
          Skip & Manual Setup
        </Button>
      </div>

      {analyzing && (
        <Alert
          message="AI is analyzing your project requirements..."
          description="This usually takes a few seconds. We're extracting audience demographics, estimating costs, and setting up optimal parameters."
          type="info"
          showIcon
          className="mt-4"
        />
      )}
    </Card>
  );
};

// Helper functions for mock AI analysis
function extractProjectName(text: string): string {
  const keywords = text.toLowerCase();
  if (keywords.includes('brand')) return 'Brand Research Study';
  if (keywords.includes('product')) return 'Product Feedback Survey';
  if (keywords.includes('market')) return 'Market Research Project';
  return 'Research Survey Project';
}

function extractCountry(text: string): string {
  if (text.toLowerCase().includes('uk') || text.toLowerCase().includes('britain')) return 'UK';
  if (text.toLowerCase().includes('canada')) return 'CA';
  if (text.toLowerCase().includes('australia')) return 'AU';
  return 'US'; // default
}

function extractAudience(text: string): { ageRange: [number, number]; gender: string[]; income?: string; interests?: string[] } {
  const ageMatch = text.match(/(\d+)-(\d+)/);
  const ageRange: [number, number] = ageMatch ? [parseInt(ageMatch[1]), parseInt(ageMatch[2])] : [18, 65];
  
  const gender = [];
  if (text.toLowerCase().includes('men') || text.toLowerCase().includes('male')) gender.push('male');
  if (text.toLowerCase().includes('women') || text.toLowerCase().includes('female')) gender.push('female');
  if (gender.length === 0) gender.push('male', 'female');
  
  return { ageRange, gender };
}

function extractSurveyType(text: string): string {
  if (text.toLowerCase().includes('brand')) return 'Brand Awareness';
  if (text.toLowerCase().includes('product')) return 'Product Research';
  return 'General Survey';
}

function extractCompletes(text: string): number {
  const match = text.match(/(\d+)(?:\s+(?:people|adults|respondents|participants))/i);
  return match ? parseInt(match[1]) : 100;
}

function extractLOI(text: string): number {
  const match = text.match(/(\d+)(?:\s*(?:minute|min))/i);
  return match ? parseInt(match[1]) : 15;
}

function estimateIncidence(text: string): number {
  // Mock logic based on audience specificity
  const specificity = (text.match(/\b(?:aged?|income|profession|with|having)\b/gi) || []).length;
  return Math.max(10, 50 - (specificity * 8));
}
