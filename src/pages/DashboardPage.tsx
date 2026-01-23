import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/spinner';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { useProjects } from '@/hooks/useProjects';
import { useMyTasks } from '@/hooks/useTasks';
import { useMyActivities } from '@/hooks/useActivities';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  FolderOpen,
  Plus,
  Activity,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  TaskStatus,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_COLORS,
} from '@/types';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useMyTasks();
  const { data: activitiesData } = useMyActivities(10, 0);

  const isLoading = projectsLoading || tasksLoading;

  if (isLoading) {
    return <Loading text="Đang tải dữ liệu..." />;
  }

  const stats = {
    totalProjects: projects?.length || 0,
    totalTasks: tasks?.length || 0,
    notStarted: tasks?.filter((t) => t.status === TaskStatus.NOT_STARTED).length || 0,
    inProgress: tasks?.filter((t) => t.status === TaskStatus.IN_PROGRESS).length || 0,
    completed: tasks?.filter((t) => t.status === TaskStatus.COMPLETED).length || 0,
  };

  // Get urgent tasks (high/urgent priority and not completed)
  const urgentTasks = tasks
    ?.filter(
      (t) =>
        (t.priority === 'HIGH' || t.priority === 'URGENT') &&
        t.status !== TaskStatus.COMPLETED &&
        t.status !== TaskStatus.CANCELLED
    )
    .slice(0, 5);

  // Get tasks due soon (within 7 days)
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const tasksDueSoon = tasks
    ?.filter((t) => {
      if (!t.endDate || t.status === TaskStatus.COMPLETED || t.status === TaskStatus.CANCELLED)
        return false;
      const dueDate = new Date(t.endDate);
      return dueDate <= weekFromNow;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Xin chào, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Đây là tổng quan về công việc của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dự án</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">dự án đang tham gia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Task</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">task được giao</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa bắt đầu</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notStarted}</div>
            <p className="text-xs text-muted-foreground">task chờ xử lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">task đang làm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">task đã xong</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dự án của bạn</CardTitle>
              <CardDescription>Các dự án bạn đang tham gia</CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link to="/projects">
                <Plus className="h-4 w-4 mr-1" />
                Tạo dự án
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!projects || projects.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Chưa có dự án nào. Bắt đầu bằng cách tạo dự án mới!
              </p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color || '#3B82F6' }}
                      />
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project._count?.tasks || 0} task •{' '}
                          {project._count?.members || 0} thành viên
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks Due Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Task sắp đến hạn
            </CardTitle>
            <CardDescription>Task cần hoàn thành trong 7 ngày tới</CardDescription>
          </CardHeader>
          <CardContent>
            {!tasksDueSoon || tasksDueSoon.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Không có task nào sắp đến hạn
              </p>
            ) : (
              <div className="space-y-3">
                {tasksDueSoon.map((task) => (
                  <Link
                    key={task.id}
                    to={`/projects/${task.projectId}/tasks/${task.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Hạn: {new Date(task.endDate!).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Badge className={TASK_STATUS_COLORS[task.status]}>
                      {TASK_STATUS_LABELS[task.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Urgent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              Task ưu tiên cao
            </CardTitle>
            <CardDescription>Task cần xử lý gấp</CardDescription>
          </CardHeader>
          <CardContent>
            {!urgentTasks || urgentTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Không có task ưu tiên cao
              </p>
            ) : (
              <div className="space-y-3">
                {urgentTasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/projects/${task.projectId}/tasks/${task.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.project?.name || 'Dự án'}
                      </p>
                    </div>
                    <Badge className={TASK_PRIORITY_COLORS[task.priority]}>
                      {task.priority}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Hoạt động gần đây
              </CardTitle>
              <CardDescription>Các hoạt động mới nhất của bạn</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/activities">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!activitiesData?.data || activitiesData.data.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Chưa có hoạt động nào
              </p>
            ) : (
              <div className="space-y-4">
                {activitiesData.data.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3"
                  >
                    <Avatar
                      src={activity.user?.avatar}
                      alt={activity.user?.name}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">
                        <span className="font-medium">{activity.user?.name}</span>{' '}
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(new Date(activity.createdAt))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN');
}
