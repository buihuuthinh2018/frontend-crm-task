import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectTasksPage } from './pages/ProjectTasksPage';
import { ProjectTimelineGanttPage } from './pages/ProjectTimelineGanttPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="projects/:id/tasks" element={<ProjectTasksPage />} />
            <Route path="projects/:id/timeline" element={<ProjectTimelineGanttPage />} />
            <Route path="projects/:id/tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="my-tasks" element={<MyTasksPage />} />
            <Route path="my-tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="activities" element={<ActivityLogsPage />} />
            {/* Legacy route redirect */}
            <Route path="tasks" element={<Navigate to="/my-tasks" replace />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

