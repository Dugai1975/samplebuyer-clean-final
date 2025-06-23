'use client';

import React, { useState } from 'react';
import { Card, Input, Button, Spin, Typography } from 'antd';
import { SendOutlined, LoadingOutlined, BulbOutlined, ThunderboltOutlined, AimOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface AIProjectDescriberProps {
  onDescriptionGenerated?: (description: string, projectName: string) => void;
  compact?: boolean;
}

export const AIProjectDescriber: React.FC<AIProjectDescriberProps> = ({ 
  onDescriptionGenerated,
  compact = false 
}) => {
  const [prompt, setPrompt] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock AI generation - in a real app, this would call an API
  const generateDescription = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a description based on the prompt
    // Create more specific audience marketplace descriptions and project names
    let aiGeneratedDescription = '';
    let projectName = '';
    
    if (prompt.toLowerCase().includes('mom') || prompt.toLowerCase().includes('parent')) {
      // For parents/moms
      projectName = prompt.toLowerCase().includes('brazil') ? 'Brazilian Mothers Market Study' : 
                   prompt.toLowerCase().includes('organic') ? 'Organic Shoppers Parenting Study' : 
                   'Working Mothers Consumer Insights';
                   
      aiGeneratedDescription = `${prompt} targeting working mothers aged 28-42 with children under 12, household income $50K+, with 24% incidence rate. The study will measure brand perception, purchase behaviors, and product satisfaction through a 15-minute mobile-optimized survey with both quantitative ratings and open-ended feedback components.`;
    } else if (prompt.toLowerCase().includes('teen') || prompt.toLowerCase().includes('young')) {
      // For teens/young adults
      projectName = prompt.toLowerCase().includes('social') ? 'Gen-Z Social Media Behavior Study' : 
                   prompt.toLowerCase().includes('gaming') ? 'Youth Gaming Habits Research' : 
                   'Young Adult Consumer Trends Analysis';
                   
      aiGeneratedDescription = `${prompt} focusing on Gen-Z consumers aged 16-24 who are active social media users with 35% incidence rate. The research will explore digital consumption habits, brand affinity, and purchase drivers through a 12-minute mobile-first survey with interactive media elements and behavior tracking.`;
    } else if (prompt.toLowerCase().includes('senior') || prompt.toLowerCase().includes('elder')) {
      // For seniors/elderly
      projectName = prompt.toLowerCase().includes('health') ? 'Senior Health Decision Makers Study' : 
                   prompt.toLowerCase().includes('tech') ? 'Elder Tech Adoption Research' : 
                   'Senior Consumer Preferences Analysis';
                   
      aiGeneratedDescription = `${prompt} targeting adults 65+ who are active online shoppers with 18% incidence rate. The study will evaluate healthcare decision-making, technology adoption patterns, and service preferences through a 20-minute desktop-optimized survey with simplified navigation and larger text options.`;
    } else {
      // Default case
      const keywords = ['professionals', 'consumers', 'shoppers', 'buyers', 'audience', 'users'];
      const foundKeyword = keywords.find(keyword => prompt.toLowerCase().includes(keyword)) || 'Consumers';
      
      // Extract location if present
      let location = '';
      const countries = ['US', 'USA', 'United States', 'UK', 'Britain', 'Canada', 'Australia', 'Germany', 'France', 'Brazil', 'Japan', 'China', 'India'];
      for (const country of countries) {
        if (prompt.toLowerCase().includes(country.toLowerCase())) {
          location = country + ' ';
          break;
        }
      }
      
      // Extract product/category if present
      let category = '';
      const categories = ['food', 'tech', 'beauty', 'fashion', 'health', 'fitness', 'travel', 'auto', 'finance', 'entertainment'];
      for (const cat of categories) {
        if (prompt.toLowerCase().includes(cat.toLowerCase())) {
          category = cat.charAt(0).toUpperCase() + cat.slice(1) + ' ';
          break;
        }
      }
      
      projectName = `${location}${category}${foundKeyword.charAt(0).toUpperCase() + foundKeyword.slice(1)} Market Research`;
      aiGeneratedDescription = `${prompt} targeting urban professionals aged 25-45 with disposable income $75K+ and 28% incidence rate. The study will measure brand awareness, purchase intent, and customer satisfaction through a 15-minute cross-device survey with both quantitative and qualitative components.`;
    }
    
    setDescription(aiGeneratedDescription);
    setLoading(false);
    
    if (onDescriptionGenerated) {
      onDescriptionGenerated(aiGeneratedDescription, projectName);
    }
  };

  return (
    <Card 
      className={`${compact ? 'border border-blue-200' : 'shadow-md border-2 border-blue-200'} overflow-hidden`}
      title={
        <div className="flex items-center space-x-2">
          <AimOutlined className="text-purple-500" />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
            Audience Wizard
          </span>
        </div>
      }
      styles={{ 
        header: { background: 'linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%)', borderBottom: '1px solid #dbeafe' },
        body: { padding: compact ? '12px' : '16px', background: 'linear-gradient(135deg, #f8fafc 0%, #faf5ff 100%)' }
      }}
    >
      <div className="space-y-3">
        {!compact && (
          <div className="flex items-center space-x-2 mb-2">
            <ThunderboltOutlined className="text-amber-500" />
            <Text className="text-gray-700 text-sm font-medium">
              Describe your ideal audience and we'll craft the perfect targeting strategy
            </Text>
          </div>
        )}
        
        <div className="flex space-x-2">
          <TextArea
            placeholder={compact ? 
              "e.g., Working moms in Brazil who purchase organic food..." : 
              "e.g., I need working mothers in Brazil, aged 25-40, who purchase organic food products at least twice monthly with household income above $45K..."}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            autoSize={{ minRows: compact ? 1 : 2, maxRows: compact ? 2 : 4 }}
            className="flex-grow border-purple-200 hover:border-purple-300 focus:border-purple-400"
          />
          <Button 
            type="primary" 
            icon={<BulbOutlined />} 
            onClick={generateDescription}
            loading={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 flex-shrink-0 shadow-md hover:shadow-lg transition-all"
          >
            {compact ? '' : 'Create'}
          </Button>
        </div>
        
        {loading && (
          <div className="flex justify-center py-3">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          </div>
        )}
        
        {description && !loading && (
          <div className="mt-3">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Text strong className="text-sm text-gray-700 block">Perfect Match Found:</Text>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-md text-sm border border-purple-100 shadow-inner">
              {description}
            </div>
            <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
              <span>Estimated incidence rate shown in description</span>
              <span className="text-green-600 font-medium">✓ Feasible</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
