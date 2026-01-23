import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useTask,
  useUpdateTask,
  useUpdateTaskStatus,
  useDeleteTask,
  useTaskMembers,
  useAddTaskMember,
  useRemoveTaskMember,
  useUpdateTaskMemberRole,
  useCreateTask,
} from '@/hooks/useTasks';
import { useTaskActivities } from '@/hooks/useActivities';
import { useProjectMembers } from '@/hooks/useProjects';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Loading } from '@/components/ui/spinner';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Edit,
  Trash2,
  UserPlus,
  ListTodo,
  Activity,
  Users,
  Calendar,
  Plus,
  Check,
} from 'lucide-react';
import {
  TaskStatus,
  TaskPriority,
  TaskRole,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_ROLE_LABELS,
} from '@/types';
import type { Task, UpdateTaskRequest, CreateTaskRequest, TaskMember } from '@/types';

export function TaskDetailPage() {
  const { id: projectId, taskId } = useParams<{ id?: string; taskId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const { data: task, isLoading: taskLoading } = useTask(taskId!);
  const { data: taskMembers } = useTaskMembers(taskId!);
  // Only fetch project members if projectId exists
  const { data: projectMembers } = useProjectMembers(projectId || '');
  const { data: activitiesData } = useTaskActivities(taskId!, 20);

  const updateTask = useUpdateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const addMember = useAddTaskMember();
  const removeMember = useRemoveTaskMember();
  const updateMemberRole = useUpdateTaskMemberRole();
  const createSubtask = useCreateTask();

  const [activeTab, setActiveTab] = useState('details');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCreateSubtaskOpen, setIsCreateSubtaskOpen] = useState(false);
  const [editForm, setEditForm] = useState<UpdateTaskRequest>({});
  const [newSubtask, setNewSubtask] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    projectId: task?.projectId || '',
    parentId: taskId!,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.NOT_STARTED,
  });

  // Check if current user is task creator or member
  const isCreator = task?.creatorId === currentUser?.id;
  const isPrimaryMember = taskMembers?.some(
    (m) => m.userId === currentUser?.id && m.role === TaskRole.PRIMARY
  ) ?? false;
  const canEdit = isCreator || isPrimaryMember;

  if (taskLoading) {
    return <Loading text="Đang tải thông tin task..." />;
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500">Không tìm thấy task</p>
        <Button className="mt-4" onClick={() => navigate(`/projects/${projectId}/tasks`)}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleUpdateTask = async () => {
    try {
      await updateTask.mutateAsync({ id: task.id, data: editForm });
      setIsEditOpen(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleStatusChange = async (status: TaskStatus) => {
    try {
      await updateStatus.mutateAsync({ id: task.id, status });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa task này?')) {
      try {
        await deleteTask.mutateAsync(task.id);
        navigate(`/projects/${projectId}/tasks`);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleAddMember = async (userId: string, role: TaskRole) => {
    try {
      await addMember.mutateAsync({
        taskId: task.id,
        data: { userId, role },
      });
      setIsAddMemberOpen(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      try {
        await removeMember.mutateAsync({ taskId: task.id, memberId });
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: TaskRole) => {
    try {
      await updateMemberRole.mutateAsync({ taskId: task.id, memberId, role });
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleCreateSubtask = async () => {
    if (!newSubtask.title.trim() || !task?.projectId) return;

    try {
      await createSubtask.mutateAsync({
        ...newSubtask,
        projectId: task.projectId,
        parentId: taskId!,
      });
      setIsCreateSubtaskOpen(false);
      setNewSubtask({
        title: '',
        description: '',
        projectId: task.projectId,
        parentId: taskId!,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.NOT_STARTED,
      });
    } catch (error) {
      console.error('Failed to create subtask:', error);
    }
  };

  const existingMemberIds = taskMembers?.map((m) => m.userId) || [];
  const availableMembers = projectMembers?.filter(
    (m) => !existingMemberIds.includes(m.userId)
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (projectId) {
                navigate(`/projects/${projectId}/tasks`);
              } else {
                navigate('/my-tasks');
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{task.title}</h1>
              <Badge className={TASK_STATUS_COLORS[task.status]}>
                {TASK_STATUS_LABELS[task.status]}
              </Badge>
              <Badge className={TASK_PRIORITY_COLORS[task.priority]}>
                {TASK_PRIORITY_LABELS[task.priority]}
              </Badge>
            </div>
            {task.parentId && (
              <p className="text-sm text-muted-foreground">
                Subtask của task #{task.parentId.slice(0, 8)}
              </p>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditForm({
                  title: task.title,
                  description: task.description,
                  priority: task.priority,
                  startDate: task.startDate
                    ? new Date(task.startDate).toISOString().split('T')[0]
                    : undefined,
                  endDate: task.endDate
                    ? new Date(task.endDate).toISOString().split('T')[0]
                    : undefined,
                });
                setIsEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
          </div>
        )}
      </div>

      {/* Status Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Chuyển trạng thái:</span>
            <div className="flex gap-2">
              {Object.entries(TASK_STATUS_LABELS).map(([status, label]) => (
                <Button
                  key={status}
                  size="sm"
                  variant={task.status === status ? 'default' : 'outline'}
                  onClick={() => handleStatusChange(status as TaskStatus)}
                  disabled={task.status === status}
                >
                  {task.status === status && <Check className="h-4 w-4 mr-1" />}
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">
            <ListTodo className="h-4 w-4 mr-2" />
            Chi tiết
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Thành viên ({taskMembers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="subtasks">
            <ListTodo className="h-4 w-4 mr-2" />
            Subtasks ({task.subtasks?.length || task._count?.subtasks || 0})
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Activity className="h-4 w-4 mr-2" />
            Hoạt động
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Mô tả</CardTitle>
              </CardHeader>
              <CardContent>
                {task.description ? (
                  <p className="whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">Chưa có mô tả</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Người tạo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar
                      src={task.creator?.avatar}
                      alt={task.creator?.name}
                      size="sm"
                    />
                    <span>{task.creator?.name}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                  <p>{new Date(task.createdAt).toLocaleString('vi-VN')}</p>
                </div>

                {task.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground">Ngày bắt đầu</Label>
                      <p>{new Date(task.startDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                )}

                {task.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground">Ngày kết thúc</Label>
                      <p>{new Date(task.endDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Thành viên task</CardTitle>
                <CardDescription>
                  Quản lý thành viên và vai trò (chính/phụ)
                </CardDescription>
              </div>
              {canEdit && (
                <Button onClick={() => setIsAddMemberOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Thêm cộng sự
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!taskMembers || taskMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có thành viên nào
                </p>
              ) : (
                <div className="space-y-4">
                  {taskMembers.map((member) => (
                    <TaskMemberRow
                      key={member.userId}
                      member={member}
                      canEdit={canEdit}
                      onUpdateRole={(role) =>
                        handleUpdateMemberRole(member.userId, role)
                      }
                      onRemove={() => handleRemoveMember(member.userId)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subtasks Tab */}
        <TabsContent value="subtasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subtasks</CardTitle>
                <CardDescription>
                  Các tác vụ con của task này
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateSubtaskOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm subtask
              </Button>
            </CardHeader>
            <CardContent>
              {!task.subtasks || task.subtasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có subtask nào
                </p>
              ) : (
                <div className="space-y-3">
                  {task.subtasks.map((subtask) => (
                    <SubtaskRow
                      key={subtask.id}
                      subtask={subtask}
                      projectId={projectId!}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoạt động</CardTitle>
              <CardDescription>
                Theo dõi các thay đổi của task
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!activitiesData?.data || activitiesData.data.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có hoạt động nào
                </p>
              ) : (
                <div className="space-y-4">
                  {activitiesData.data.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 border-b last:border-0"
                    >
                      <Avatar
                        src={activity.user?.avatar}
                        alt={activity.user?.name}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user?.name}</span>{' '}
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Task Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                value={editForm.title || ''}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={editForm.description || ''}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Độ ưu tiên</Label>
              <Select
                value={editForm.priority}
                onChange={(value) =>
                  setEditForm((prev) => ({ ...prev, priority: value as TaskPriority }))
                }
                options={Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={editForm.startDate || ''}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={editForm.endDate || ''}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateTask} disabled={updateTask.isPending}>
              {updateTask.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm cộng sự</DialogTitle>
            <DialogDescription>
              Chọn thành viên từ dự án để thêm vào task
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!availableMembers || availableMembers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Không còn thành viên nào có thể thêm
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-auto">
                {availableMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={member.user?.avatar} alt={member.user?.name} />
                      <div>
                        <p className="font-medium">{member.user?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleAddMember(member.userId, TaskRole.SECONDARY)
                        }
                      >
                        Vai trò phụ
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleAddMember(member.userId, TaskRole.PRIMARY)
                        }
                      >
                        Vai trò chính
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Subtask Dialog */}
      <Dialog open={isCreateSubtaskOpen} onOpenChange={setIsCreateSubtaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo subtask</DialogTitle>
            <DialogDescription>
              Thêm một tác vụ con cho task này
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tiêu đề *</Label>
              <Input
                placeholder="Nhập tiêu đề subtask..."
                value={newSubtask.title}
                onChange={(e) =>
                  setNewSubtask((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                placeholder="Mô tả chi tiết..."
                value={newSubtask.description}
                onChange={(e) =>
                  setNewSubtask((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Độ ưu tiên</Label>
              <Select
                value={newSubtask.priority}
                onChange={(value) =>
                  setNewSubtask((prev) => ({
                    ...prev,
                    priority: value as TaskPriority,
                  }))
                }
                options={Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSubtaskOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateSubtask}
              disabled={!newSubtask.title.trim() || createSubtask.isPending}
            >
              {createSubtask.isPending ? 'Đang tạo...' : 'Tạo subtask'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TaskMemberRowProps {
  member: TaskMember;
  canEdit: boolean;
  onUpdateRole: (role: TaskRole) => void;
  onRemove: () => void;
}

function TaskMemberRow({ member, canEdit, onUpdateRole, onRemove }: TaskMemberRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <Avatar src={member.user?.avatar} alt={member.user?.name} />
        <div>
          <p className="font-medium">{member.user?.name}</p>
          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canEdit ? (
          <>
            <Select
              value={member.role}
              onChange={(value) => onUpdateRole(value as TaskRole)}
              options={Object.entries(TASK_ROLE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <Button variant="ghost" size="icon" onClick={onRemove}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        ) : (
          <Badge variant={member.role === TaskRole.PRIMARY ? 'default' : 'secondary'}>
            {TASK_ROLE_LABELS[member.role]}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface SubtaskRowProps {
  subtask: Task;
  projectId: string;
}

function SubtaskRow({ subtask, projectId }: SubtaskRowProps) {
  const navigate = useNavigate();
  const updateStatus = useUpdateTaskStatus();

  const handleToggleComplete = async () => {
    const newStatus =
      subtask.status === TaskStatus.COMPLETED
        ? TaskStatus.NOT_STARTED
        : TaskStatus.COMPLETED;
    await updateStatus.mutateAsync({ id: subtask.id, status: newStatus });
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleComplete}
          className={`w-5 h-5 rounded border flex items-center justify-center ${
            subtask.status === TaskStatus.COMPLETED
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {subtask.status === TaskStatus.COMPLETED && <Check className="h-3 w-3" />}
        </button>
        <div>
          <p
            className={`font-medium ${
              subtask.status === TaskStatus.COMPLETED ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {subtask.title}
          </p>
          {subtask.endDate && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(subtask.endDate).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={TASK_PRIORITY_COLORS[subtask.priority]}>
          {TASK_PRIORITY_LABELS[subtask.priority]}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${projectId}/tasks/${subtask.id}`)}
        >
          Chi tiết
        </Button>
      </div>
    </div>
  );
}
