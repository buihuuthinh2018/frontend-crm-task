import { api } from './api';
import type { Task } from '@/types';

export const taskService = {
  getTasks: async (token: string) => {
    return api.get('/tasks', token);
  },

  getTask: async (id: string, token: string) => {
    return api.get(`/tasks/${id}`, token);
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, token: string) => {
    return api.post('/tasks', task, token);
  },

  updateTask: async (id: string, task: Partial<Task>, token: string) => {
    return api.put(`/tasks/${id}`, task, token);
  },

  deleteTask: async (id: string, token: string) => {
    return api.delete(`/tasks/${id}`, token);
  },
};
