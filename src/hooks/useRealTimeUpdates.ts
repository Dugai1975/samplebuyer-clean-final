import { useState, useEffect, useRef } from 'react';
import type { EnhancedProject } from '@project-types';
import { apiService } from '@/services/api';
import { softLaunchService } from '@/services/softLaunchService';

export const useRealTimeUpdates = (
  projects: EnhancedProject[],
  intervalMs: number = 10000 // 10 seconds
) => {
  const [updatedProjects, setUpdatedProjects] = useState<EnhancedProject[]>(projects);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setUpdatedProjects(projects);
  }, [projects]);

  useEffect(() => {
    // Only poll for live projects
    const liveProjects = projects.filter(p => p.state === 'live');
    
    if (liveProjects.length === 0) {
      return;
    }

    const pollUpdates = async () => {
      try {
        const updates = await Promise.allSettled(
          liveProjects.map(project => 
            apiService.fetchProjectDetail(project.uuid)
          )
        );

        const updatedData: EnhancedProject[] = [];
        updates.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            updatedData.push(result.value);
          }
        });

        if (updatedData.length > 0) {
          setUpdatedProjects(prev => 
            prev.map(project => {
              const updated = updatedData.find(u => u.uuid === project.uuid);
              return updated || project;
            })
          );
          setLastUpdate(new Date());
        }
        setIsOnline(true);

        // --- Soft Launch Monitoring ---
        const softLaunchProjects = (updatedData.length > 0 ? updatedData : updatedProjects).filter(
          p => p.state === 'soft_launch' && p.soft_launch_config?.auto_pause
        );
        for (const project of softLaunchProjects) {
          try {
            const limitReached = await softLaunchService.monitorProgress(project.uuid);
            let shouldPause = false;
            if (project.soft_launch_config?.test_limit_type === 'fixed') {
              shouldPause = (project.fielded ?? 0) >= (project.soft_launch_config.test_limit ?? 0);
            } else if (project.soft_launch_config?.test_limit_type === 'percentage') {
              const percent = project.goal ? ((project.fielded ?? 0) / project.goal) * 100 : 0;
              shouldPause = percent >= (project.soft_launch_config.test_limit ?? 0);
            }
            if (limitReached && shouldPause && project.soft_launch_config?.auto_pause && project.state === 'soft_launch') {
              // Prevent multiple triggers: check if already paused
              // Optionally, you could add a local flag or check project.state
              await softLaunchService.pauseForReview(project.uuid);
              // Optionally, update project state locally to 'soft_paused' (if backend does not push update)
              setUpdatedProjects(prev => prev.map(p => {
  if (p.uuid !== project.uuid) return p;
  // Ensure type safety for EnhancedProject
  const config: Partial<import('@/services/softLaunchService').SoftLaunchConfig> = p.soft_launch_config || {};
  return {
    ...p,
    state: 'soft_paused',
    soft_launch_config: {
      ...config,
      test_limit: typeof config?.test_limit === 'number' ? config.test_limit : 5,
      test_limit_type: config?.test_limit_type || 'fixed',
      auto_pause: typeof config?.auto_pause === 'boolean' ? config.auto_pause : true,
      started_at: config?.started_at || new Date().toISOString(),
      paused_at: new Date().toISOString(),

    }
  };
}));
            }
          } catch (error) {
            console.error(`Soft launch monitoring failed for ${project.uuid}:`, error);
            // Do not break polling or updates
          }
        }
      } catch (error) {
        console.error('Real-time update failed:', error);
        setIsOnline(false);
      }
    };

    // Initial update
    pollUpdates();

    // Set up polling
    intervalRef.current = setInterval(pollUpdates, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [projects, intervalMs]);

  // Detect when user comes back to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && intervalRef.current) {
        // Immediate update when tab becomes visible
        const liveProjects = projects.filter(p => p.state === 'live');
        if (liveProjects.length > 0) {
          Promise.allSettled(
            liveProjects.map(project => 
              apiService.fetchProjectDetail(project.uuid)
            )
          ).then(updates => {
            const updatedData: EnhancedProject[] = [];
            updates.forEach((result) => {
              if (result.status === 'fulfilled' && result.value) {
                updatedData.push(result.value);
              }
            });

            if (updatedData.length > 0) {
              setUpdatedProjects(prev => 
                prev.map(project => {
                  const updated = updatedData.find(u => u.uuid === project.uuid);
                  return updated || project;
                })
              );
              setLastUpdate(new Date());
            }
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [projects]);

  return {
    projects: updatedProjects,
    lastUpdate,
    isOnline
  };
};

export const useProjectLiveData = (projectId: string | null) => {
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchLiveData = async () => {
      try {
        setLoading(true);
        const data = await apiService.fetchProjectLiveData(projectId);
        setLiveData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch live data');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();

    // Poll every 5 seconds for live project data
    const interval = setInterval(fetchLiveData, 5000);

    return () => clearInterval(interval);
  }, [projectId]);

  return { liveData, loading, error };
};
