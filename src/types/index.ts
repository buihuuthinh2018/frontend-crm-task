/**
 * CRM Task Management API Types
 * Synced from Backend API_TYPES.ts
 */

// ==================== USER ====================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
}

// ==================== AUTH ====================

export interface AuthRegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthGoogleRequest {
  token: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ==================== PROJECT ====================

export const ProjectRole = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
} as const;
export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
  isArchived?: boolean;
}

export interface ProjectMember {
  userId: string;
  projectId: string;
  role: ProjectRole;
  joinedAt: Date;
  user?: User;
}

export interface AddProjectMemberRequest {
  userId: string;
  role?: ProjectRole;
}

export interface UpdateProjectMemberRequest {
  role: ProjectRole;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  members?: ProjectMember[];
  tasks?: Task[];
  _count?: {
    tasks: number;
    members: number;
  };
}

// ==================== TASK ====================

export const TaskStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TaskRole = {
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY',
} as const;
export type TaskRole = (typeof TaskRole)[keyof typeof TaskRole];

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  parentId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
  parentId?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface TaskMember {
  taskId: string;
  userId: string;
  role: TaskRole;
  assignedAt: Date;
  user?: User;
}

export interface AddTaskMemberRequest {
  userId: string;
  role?: TaskRole;
}

export interface UpdateTaskMemberRequest {
  role: TaskRole;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: Date;
  endDate?: Date;
  projectId: string;
  parentId?: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members?: TaskMember[];
  creator?: User;
  subtasks?: Task[];
  project?: Project;
  _count?: {
    subtasks: number;
  };
}

// ==================== ACTIVITY LOG ====================

export const ActivityAction = {
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',
  MEMBER_ADDED: 'MEMBER_ADDED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  MEMBER_ROLE_CHANGED: 'MEMBER_ROLE_CHANGED',
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_DELETED: 'TASK_DELETED',
  TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  TASK_MEMBER_ADDED: 'TASK_MEMBER_ADDED',
  TASK_MEMBER_REMOVED: 'TASK_MEMBER_REMOVED',
  TASK_MEMBER_ROLE_CHANGED: 'TASK_MEMBER_ROLE_CHANGED',
  SUBTASK_CREATED: 'SUBTASK_CREATED',
  COMMENT_ADDED: 'COMMENT_ADDED',
} as const;
export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction];

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
  userId: string;
  projectId: string;
  taskId?: string;
  createdAt: Date;
  user?: User;
  task?: {
    id: string;
    title: string;
  };
}

export interface ActivityLogsResponse {
  data: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}

// ==================== ERROR ====================

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// ==================== UTILITY TYPES ====================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SearchParams {
  q: string;
}

// ==================== HELPER CONSTANTS ====================

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: 'Chưa bắt đầu',
  [TaskStatus.IN_PROGRESS]: 'Đang xử lý',
  [TaskStatus.COMPLETED]: 'Đã hoàn thành',
  [TaskStatus.CANCELLED]: 'Đã hủy',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Thấp',
  [TaskPriority.MEDIUM]: 'Trung bình',
  [TaskPriority.HIGH]: 'Cao',
  [TaskPriority.URGENT]: 'Khẩn cấp',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: 'bg-gray-100 text-gray-700',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [TaskStatus.CANCELLED]: 'bg-red-100 text-red-700',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-gray-100 text-gray-600',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-700',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-700',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-700',
};

export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  [ProjectRole.OWNER]: 'Chủ sở hữu',
  [ProjectRole.MEMBER]: 'Thành viên',
};

export const TASK_ROLE_LABELS: Record<TaskRole, string> = {
  [TaskRole.PRIMARY]: 'Vai trò chính',
  [TaskRole.SECONDARY]: 'Vai trò phụ',
};
