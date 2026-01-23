import { useQuery } from '@tanstack/react-query';
import { activityLogService } from '@/services/activityLogService';

export const activityKeys = {
  all: ['activities'] as const,
  myActivities: (limit?: number, offset?: number) =>
    [...activityKeys.all, 'my', { limit, offset }] as const,
  projectActivities: (projectId: string, limit?: number, offset?: number) =>
    [...activityKeys.all, 'project', projectId, { limit, offset }] as const,
  taskActivities: (taskId: string, limit?: number, offset?: number) =>
    [...activityKeys.all, 'task', taskId, { limit, offset }] as const,
};

export function useMyActivities(limit = 50, offset = 0) {
  return useQuery({
    queryKey: activityKeys.myActivities(limit, offset),
    queryFn: () => activityLogService.getMyActivities(limit, offset),
  });
}

export function useProjectActivities(projectId: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: activityKeys.projectActivities(projectId, limit, offset),
    queryFn: () => activityLogService.getProjectActivities(projectId, limit, offset),
    enabled: !!projectId,
  });
}

export function useTaskActivities(taskId: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: activityKeys.taskActivities(taskId, limit, offset),
    queryFn: () => activityLogService.getTaskActivities(taskId, limit, offset),
    enabled: !!taskId,
  });
}
