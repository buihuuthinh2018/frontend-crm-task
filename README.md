# Frontend CRM Task Management

Một ứng dụng quản lý công việc (CRM Task Management) được xây dựng với React, TypeScript, TailwindCSS, và các công nghệ hiện đại.

## 🚀 Công Nghệ Sử Dụng

- **React 19** - Thư viện UI
- **TypeScript** - Ngôn ngữ lập trình có kiểu tĩnh
- **Vite** - Build tool và dev server nhanh
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - State management đơn giản và hiệu quả
- **React Query (@tanstack/react-query)** - Data fetching và caching
- **React Router Dom** - Client-side routing
- **Google OAuth (@react-oauth/google)** - Xác thực Google Login
- **shadcn/ui** - Thư viện UI components đẹp và tùy chỉnh
- **Lucide React** - Icon library

## 📁 Cấu Trúc Thư Mục

```
src/
├── components/          # React components
│   ├── ui/             # Shared UI components (Button, Input, Card, etc.)
│   ├── auth/           # Authentication components
│   ├── layouts/        # Layout components
│   └── tasks/          # Task-related components
├── pages/              # Page components
│   ├── DashboardPage.tsx
│   └── TasksPage.tsx
├── stores/             # Zustand stores
│   ├── authStore.ts    # Authentication state
│   └── taskStore.ts    # Task management state
├── services/           # API services
│   ├── api.ts          # Base API client
│   └── taskService.ts  # Task-related API calls
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   └── utils.ts        # Helper functions (cn, etc.)
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
└── utils/              # Additional utilities
```

## 🛠️ Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống

- Node.js >= 18.x
- npm >= 9.x hoặc yarn >= 1.22.x

### Bước 1: Clone Repository

```bash
git clone https://github.com/buihuuthinh2018/frontend-crm-task.git
cd frontend-crm-task
```

### Bước 2: Cài Đặt Dependencies

```bash
npm install
```

### Bước 3: Cấu Hình Environment

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong file `.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_URL=http://localhost:3000/api
```

#### Lấy Google Client ID:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable Google+ API
4. Tạo OAuth 2.0 Client ID
5. Thêm authorized redirect URIs: `http://localhost:5173`
6. Copy Client ID vào file `.env`

### Bước 4: Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### Bước 5: Build cho Production

```bash
npm run build
```

### Bước 6: Preview Production Build

```bash
npm run preview
```

## 📋 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build ứng dụng cho production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint để kiểm tra code

## 🎨 Features

### ✅ Đã Triển Khai

- **Authentication**
  - Google Login integration
  - Protected routes
  - Persistent authentication state

- **Task Management**
  - Tạo, xem, cập nhật, xóa tasks
  - Phân loại theo status (Todo, In Progress, Done)
  - Phân loại theo priority (Low, Medium, High)
  - Due date tracking
  - Task assignment

- **Dashboard**
  - Task statistics overview
  - Recent activity feed
  - Visual task status cards

- **UI/UX**
  - Responsive design
  - Modern và clean interface
  - TailwindCSS styling
  - shadcn/ui components

### 🚧 Tính Năng Có Thể Mở Rộng

- Backend API integration
- Real-time updates với WebSocket
- Task comments và collaboration
- File attachments
- Task search và filtering
- Calendar view
- Notifications
- User roles và permissions
- Team management
- Reports và analytics

## 🏗️ Architecture

### State Management (Zustand)

- **authStore**: Quản lý authentication state (user, token, login/logout)
- **taskStore**: Quản lý tasks (CRUD operations)

### API Services

- **api.ts**: Base API client với fetch wrapper
- **taskService.ts**: Task-specific API calls

### Routing

- `/login` - Login page
- `/dashboard` - Dashboard overview
- `/tasks` - Task management page

## 🎯 Best Practices

- ✅ TypeScript strict mode
- ✅ Component composition
- ✅ Custom hooks cho logic tái sử dụng
- ✅ Path aliases (@/) cho imports sạch hơn
- ✅ Separation of concerns (components, services, stores)
- ✅ Responsive design patterns
- ✅ Error handling
- ✅ Code splitting

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Author

- Bùi Hữu Thịnh
- Email: buihuuthinh2018@gmail.com
- GitHub: [@buihuuthinh2018](https://github.com/buihuuthinh2018)

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query)
