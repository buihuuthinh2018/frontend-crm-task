import { api } from './api';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectMember,
  AddProjectMemberRequest,
  ProjectRole,
} from '@/types';

export const projectService = {
  async create(data: CreateProjectRequest): Promise<Project> {
    return api.post('/projects', data);
  },

  async getAll(includeArchived = false): Promise<Project[]> {
    const url = includeArchived ? '/projects?includeArchived=true' : '/projects';
    return api.get(url);
  },

  async getById(id: string): Promise<Project> {
    return api.get(`/projects/${id}`);
  },

  async update(id: string, data: UpdateProjectRequest): Promise<Project> {
    return api.patch(`/projects/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return api.delete(`/projects/${id}`);
  },

  // Member Management
  async getMembers(projectId: string): Promise<ProjectMember[]> {
    return api.get(`/projects/${projectId}/members`);
  },

  async addMember(projectId: string, data: AddProjectMemberRequest): Promise<ProjectMember> {
    return api.post(`/projects/${projectId}/members`, data);
  },

  async updateMemberRole(
    projectId: string,
    memberId: string,
    role: ProjectRole
  ): Promise<ProjectMember> {
    return api.patch(`/projects/${projectId}/members/${memberId}`, { role });
  },

  async removeMember(projectId: string, memberId: string): Promise<{ message: string }> {
    return api.delete(`/projects/${projectId}/members/${memberId}`);
  },
};
