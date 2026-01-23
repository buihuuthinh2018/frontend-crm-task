import { api } from './api';
import type { User, UpdateUserRequest } from '@/types';

export const userService = {
  async getAll(): Promise<User[]> {
    return api.get('/users');
  },

  async search(query: string): Promise<User[]> {
    return api.get(`/users/search?q=${encodeURIComponent(query)}`);
  },

  async getById(id: string): Promise<User> {
    return api.get(`/users/${id}`);
  },

  async update(id: string, data: UpdateUserRequest): Promise<User> {
    return api.patch(`/users/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return api.delete(`/users/${id}`);
  },
};
