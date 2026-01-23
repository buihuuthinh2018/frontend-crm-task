import { api } from './api';
import type { ActivityLogsResponse } from '@/types';

export const activityLogService = {
  async getMyActivities(limit = 50, offset = 0): Promise<ActivityLogsResponse> {
    return api.get(`/activity-logs/my-activities?limit=${limit}&offset=${offset}`);
  },

  async getProjectActivities(
    projectId: string,
    limit = 50,
    offset = 0
  ): Promise<ActivityLogsResponse> {
    return api.get(`/activity-logs/project/${projectId}?limit=${limit}&offset=${offset}`);
  },

  async getTaskActivities(
    taskId: string,
    limit = 50,
    offset = 0
  ): Promise<ActivityLogsResponse> {
    return api.get(`/activity-logs/task/${taskId}?limit=${limit}&offset=${offset}`);
  },
};
