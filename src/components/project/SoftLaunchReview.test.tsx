import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SoftLaunchReview } from './SoftLaunchReview';

// Mock softLaunchService to avoid real API calls
jest.mock('@/services/softLaunchService', () => ({
  softLaunchService: {
    promoteToFullLaunch: jest.fn(() => Promise.resolve()),
  },
}));

const mockTestResults = {
  percentComplete: 100,
  qualityStatus: 'excellent',
  recommendation: 'Ready for Full Launch',
  costSuggestion: 'Within budget',
  riskAssessment: 'Low',
  issues_found: [],
  performance_alerts: [],
};

jest.mock('@/hooks/useRealTimeUpdates', () => ({
  useProjectLiveData: () => ({
    liveData: mockTestResults,
    loading: false,
    error: null,
  }),
}));

describe('SoftLaunchReview', () => {
  it('renders recommendation and enables promotion button', () => {
    render(
      <SoftLaunchReview
        projectId="test-id"
        onPromoteToFullLaunch={jest.fn()}
        onAdjustSettings={jest.fn()}
        onRunAnotherTest={jest.fn()}
      />
    );
    expect(screen.getByText(/Ready for Full Launch/)).toBeInTheDocument();
    const promoteBtn = screen.getByRole('button', { name: /Proceed to Full Launch/i });
    expect(promoteBtn).toBeEnabled();
  });

  it('calls promoteToFullLaunch and shows success alert', async () => {
    const onPromote = jest.fn();
    render(
      <SoftLaunchReview
        projectId="test-id"
        onPromoteToFullLaunch={onPromote}
        onAdjustSettings={jest.fn()}
        onRunAnotherTest={jest.fn()}
      />
    );
    const promoteBtn = screen.getByRole('button', { name: /Proceed to Full Launch/i });
    fireEvent.click(promoteBtn);
    await waitFor(() => {
      expect(screen.getByText(/Project promoted to full launch/i)).toBeInTheDocument();
      expect(onPromote).toHaveBeenCalled();
    });
  });
});
