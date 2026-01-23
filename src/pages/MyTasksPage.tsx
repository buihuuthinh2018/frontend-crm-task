import { Link } from 'react-router-dom';
import { useMyTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/spinner';
import { TaskViewToggle } from '@/components/tasks/TaskViewToggle';
import {
  FolderOpen,
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  TaskStatus,
} from '@/types';

export function MyTasksPage() {
  const { data: tasks, isLoading: tasksLoading } = useMyTasks();

  if (tasksLoading) {
    return <Loading text="Đang tải task của bạn..." />;
  }

  const stats = {
    total: tasks?.length || 0,
    notStarted: tasks?.filter((t) => t.status === TaskStatus.NOT_STARTED).length || 0,
    inProgress: tasks?.filter((t) => t.status === TaskStatus.IN_PROGRESS).length || 0,
    completed: tasks?.filter((t) => t.status === TaskStatus.COMPLETED).length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Task của tôi</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý các task được giao cho bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số task</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa bắt đầu</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notStarted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks View - List or Timeline */}
      {!tasks || tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Chưa có task nào</h3>
            <p className="text-muted-foreground text-center mt-1">
              Bạn chưa được giao task nào
            </p>
            <Button className="mt-4" asChild>
              <Link to="/projects">
                <FolderOpen className="h-4 w-4 mr-2" />
                Xem dự án
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TaskViewToggle
          tasks={tasks}
          baseUrl="/my-tasks"
        />
      )}
    </div>
  );
}
