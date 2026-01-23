import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useTasksByProject,
  useCreateTask,
  useDeleteTask,
} from '@/hooks/useTasks';
import { useProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/spinner';
import { Select } from '@/components/ui/select';
import { TaskViewToggle } from '@/components/tasks/TaskViewToggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Plus,
  AlertCircle,
} from 'lucide-react';
import {
  TaskStatus,
  TaskPriority,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from '@/types';
import type { CreateTaskRequest } from '@/types';

export function ProjectTasksPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const { data: tasks, isLoading: tasksLoading } = useTasksByProject(projectId!);
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [newTask, setNewTask] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    projectId: projectId!,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.NOT_STARTED,
  });

  const isLoading = projectLoading || tasksLoading;

  if (isLoading) {
    return <Loading text="Đang tải danh sách task..." />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500">Không tìm thấy dự án</p>
        <Button className="mt-4" onClick={() => navigate('/projects')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Filter only main tasks (not subtasks)
  const mainTasks = tasks?.filter((t) => !t.parentId) || [];

  // Apply filters
  const filteredTasks = mainTasks.filter((task) => {
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterPriority && task.priority !== filterPriority) return false;
    return true;
  });

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      await createTask.mutateAsync(newTask);
      setIsCreateDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        projectId: projectId!,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.NOT_STARTED,
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa task này?')) {
      try {
        await deleteTask.mutateAsync(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.color || '#3B82F6' }}
              />
              <h1 className="text-2xl font-bold">{project.name}</h1>
            </div>
            <p className="text-muted-foreground">Quản lý task</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-48">
          <Select
            placeholder="Lọc theo trạng thái"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              ...Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </div>
        <div className="w-48">
          <Select
            placeholder="Lọc theo độ ưu tiên"
            value={filterPriority}
            onChange={setFilterPriority}
            options={[
              { value: '', label: 'Tất cả độ ưu tiên' },
              ...Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </div>
      </div>

      {/* Task View Toggle - List or Timeline */}
      <TaskViewToggle
        tasks={filteredTasks}
        baseUrl={`/projects/${projectId}/tasks`}
        onDelete={handleDeleteTask}
      />

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo task mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo một task mới trong dự án
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                placeholder="Nhập tiêu đề task..."
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết task..."
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Độ ưu tiên</Label>
                <Select
                  value={newTask.priority}
                  onChange={(value) =>
                    setNewTask((prev) => ({ ...prev, priority: value as TaskPriority }))
                  }
                  options={Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={newTask.status}
                  onChange={(value) =>
                    setNewTask((prev) => ({ ...prev, status: value as TaskStatus }))
                  }
                  options={Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={newTask.startDate || ''}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={newTask.endDate || ''}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTask.title.trim() || createTask.isPending}
            >
              {createTask.isPending ? 'Đang tạo...' : 'Tạo task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
