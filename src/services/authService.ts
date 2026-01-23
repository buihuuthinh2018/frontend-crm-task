import { api } from './api';
import type {
  AuthResponse,
  AuthRegisterRequest,
  AuthLoginRequest,
  User,
} from '@/types';

export const authService = {
  async register(data: AuthRegisterRequest): Promise<AuthResponse> {
    return api.post('/auth/register', data);
  },

  async login(data: AuthLoginRequest): Promise<AuthResponse> {
    return api.post('/auth/login', data);
  },

  async googleLogin(accessToken: string): Promise<AuthResponse> {
    // Backend expects { accessToken } not { token }
    return api.post('/auth/google', { accessToken });
  },

  async getProfile(): Promise<User> {
    return api.get('/auth/profile');
  },
};
