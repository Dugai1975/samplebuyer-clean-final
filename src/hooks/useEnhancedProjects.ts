import { useState, useEffect } from 'react';
import { EnhancedProject } from '@/types/enhanced';
import { apiService } from '@/services/api';

export const useEnhancedProjects = () => {
  const [projects, setProjects] = useState<EnhancedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.fetchProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const refreshProjects = () => {
    fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    refreshProjects
  };
};

export const useEnhancedProject = (projectId: string | null) => {
  const [project, setProject] = useState<EnhancedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.fetchProjectDetail(projectId);
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return {
    project,
    loading,
    error
  };
};
