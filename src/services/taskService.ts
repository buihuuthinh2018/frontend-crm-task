import { api } from './api';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskMember,
  AddTaskMemberRequest,
  TaskRole,
  TaskStatus,
} from '@/types';

export const taskService = {
  async create(data: CreateTaskRequest): Promise<Task> {
    return api.post('/tasks', data);
  },

  async getMyTasks(): Promise<Task[]> {
    return api.get('/tasks/my-tasks');
  },

  async getByProject(projectId: string): Promise<Task[]> {
    return api.get(`/tasks/project/${projectId}`);
  },

  async getById(id: string): Promise<Task> {
    return api.get(`/tasks/${id}`);
  },

  async update(id: string, data: UpdateTaskRequest): Promise<Task> {
    return api.patch(`/tasks/${id}`, data);
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    return api.patch(`/tasks/${id}/status`, { status });
  },

  async delete(id: string): Promise<{ message: string }> {
    return api.delete(`/tasks/${id}`);
  },

  // Member Management
  async getMembers(taskId: string): Promise<TaskMember[]> {
    return api.get(`/tasks/${taskId}/members`);
  },

  async addMember(taskId: string, data: AddTaskMemberRequest): Promise<TaskMember> {
    return api.post(`/tasks/${taskId}/members`, data);
  },

  async updateMemberRole(taskId: string, memberId: string, role: TaskRole): Promise<TaskMember> {
    return api.patch(`/tasks/${taskId}/members/${memberId}`, { role });
  },

  async removeMember(taskId: string, memberId: string): Promise<{ message: string }> {
    return api.delete(`/tasks/${taskId}/members/${memberId}`);
  },
};
