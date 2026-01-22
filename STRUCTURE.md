# Hướng Dẫn Cấu Trúc Dự Án

## Tổng Quan

Dự án Frontend CRM Task Management được thiết kế với cấu trúc module rõ ràng, dễ mở rộng và bảo trì.

## Cấu Trúc Chi Tiết

### 1. `/src/components` - Components

#### `/src/components/ui`
Chứa các UI components cơ bản được tái sử dụng (dựa trên shadcn/ui):
- `button.tsx` - Button component với nhiều variants
- `input.tsx` - Input field component
- `card.tsx` - Card container components

**Mở rộng thêm**: Dialog, Dropdown, Select, Checkbox, Radio, Tabs, Modal, v.v.

#### `/src/components/auth`
Chứa các components liên quan đến authentication:
- `LoginPage.tsx` - Trang đăng nhập với Google OAuth
- `ProtectedRoute.tsx` - HOC để bảo vệ routes yêu cầu authentication

#### `/src/components/layouts`
Chứa các layout components:
- `MainLayout.tsx` - Layout chính với header, navigation, và outlet cho nested routes

#### `/src/components/tasks`
Chứa các components liên quan đến task management:
- `TaskCard.tsx` - Card hiển thị thông tin task

**Mở rộng thêm**: TaskList, TaskForm, TaskFilters, TaskSearch, v.v.

### 2. `/src/pages` - Pages

Chứa các page components (route-level components):
- `DashboardPage.tsx` - Trang dashboard với tổng quan tasks
- `TasksPage.tsx` - Trang quản lý tasks

**Mở rộng thêm**: ProfilePage, SettingsPage, ReportsPage, CalendarPage, v.v.

### 3. `/src/stores` - Zustand Stores

Quản lý global state với Zustand:
- `authStore.ts` - Authentication state (user, token, login/logout)
- `taskStore.ts` - Task management state (tasks, CRUD operations)

**Mở rộng thêm**: uiStore (theme, sidebar), notificationStore, teamStore, v.v.

### 4. `/src/services` - API Services

Chứa logic gọi API:
- `api.ts` - Base API client với fetch wrapper (GET, POST, PUT, DELETE)
- `taskService.ts` - Task-specific API calls

**Mở rộng thêm**: authService, userService, teamService, commentService, v.v.

### 5. `/src/types` - TypeScript Types

Định nghĩa các types và interfaces:
- `index.ts` - Shared types (User, Task, AuthState)

**Mở rộng thêm**: Thêm types cho Comment, Team, Project, Notification, v.v.

### 6. `/src/lib` - Utilities

Chứa các utility functions:
- `utils.ts` - Helper functions (cn - className merger)

**Mở rộng thêm**: formatDate, validation helpers, string formatters, v.v.

### 7. `/src/hooks` - Custom Hooks

Thư mục để chứa custom React hooks:

**Mở rộng thêm**: 
- `useDebounce.ts`
- `useLocalStorage.ts`
- `useAuth.ts`
- `useTasks.ts` (với React Query)
- `useNotifications.ts`

## State Management Architecture

### Zustand Stores
- **Local state**: Sử dụng React useState/useReducer
- **Global state**: Sử dụng Zustand stores
- **Server state**: Sử dụng React Query

### Khi nào dùng gì?

- **Local State (useState)**: Component-specific state không cần share
- **Zustand**: Global UI state, authentication, client-side data cần sync giữa components
- **React Query**: Server data, caching, background refetch, optimistic updates

## Routing Structure

```
/ (ProtectedRoute)
├── /dashboard - Dashboard overview
├── /tasks - Task management
├── /profile - User profile (future)
├── /settings - Settings (future)
└── /calendar - Calendar view (future)

/login - Login page (public)
```

## API Integration Pattern

1. Define service in `/src/services/`
2. Use React Query hooks trong components:
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';

const { data, isLoading } = useQuery({
  queryKey: ['tasks'],
  queryFn: () => taskService.getTasks(token),
});

const mutation = useMutation({
  mutationFn: taskService.createTask,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
});
```

## Styling Guide

### TailwindCSS + shadcn/ui

- Sử dụng Tailwind utility classes
- shadcn/ui components đã được pre-styled
- CSS variables cho theming (trong `/src/index.css`)
- Sử dụng `cn()` utility để merge className

### Theme Customization

Chỉnh sửa CSS variables trong `/src/index.css`:
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  ...
}
```

## Best Practices

1. **Component Naming**: PascalCase cho components, camelCase cho functions
2. **File Organization**: Một component/store/service per file
3. **Type Safety**: Luôn define types cho props, state, API responses
4. **Error Handling**: Wrap API calls với try-catch, hiển thị error states
5. **Code Splitting**: Sử dụng lazy loading cho routes nếu cần
6. **Testing**: (Chưa setup) - Khuyến khích dùng Vitest + React Testing Library

## Environment Variables

Tạo `.env` file từ `.env.example`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:3000/api
```

**Lưu ý**: Biến environment trong Vite phải bắt đầu với `VITE_`

## Scripts

- `npm run dev` - Development server (http://localhost:5173)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Các Tính Năng Có Thể Mở Rộng

### Backend Integration
1. Kết nối với REST API hoặc GraphQL
2. Implement React Query mutations
3. Add error handling và loading states
4. Implement optimistic updates

### Real-time Updates
1. WebSocket integration với Socket.io
2. Live task updates
3. Real-time notifications

### Advanced Features
1. Task comments và mentions
2. File uploads (AWS S3/Cloudinary)
3. Advanced search và filtering
4. Kanban board view
5. Calendar integration
6. Email notifications
7. Team collaboration
8. Role-based access control
9. Activity logs
10. Reports và analytics

### Performance Optimization
1. React.memo cho expensive components
2. Virtual scrolling cho large lists
3. Image optimization
4. Code splitting
5. Service worker cho PWA

## Troubleshooting

### Common Issues

1. **Build fails**: Check TypeScript errors, lint errors
2. **TailwindCSS not working**: Check postcss.config.js và tailwind.config.js
3. **Google Login not working**: Check VITE_GOOGLE_CLIENT_ID trong .env
4. **Path aliases not working**: Check tsconfig và vite.config paths

## Support

- GitHub Issues: [Create an issue](https://github.com/buihuuthinh2018/frontend-crm-task/issues)
- Email: buihuuthinh2018@gmail.com
