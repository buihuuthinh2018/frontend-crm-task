import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useProject,
  useProjectMembers,
  useUpdateProject,
  useAddProjectMember,
  useRemoveProjectMember,
  useUpdateProjectMemberRole,
} from '@/hooks/useProjects';
import { useTasksByProject } from '@/hooks/useTasks';
import { useProjectActivities } from '@/hooks/useActivities';
import { useSearchUsers } from '@/hooks/useUsers';
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
  Users,
  ListTodo,
  Activity,
  Settings,
  UserPlus,
  Trash2,
  Crown,
  Calendar,
} from 'lucide-react';
import {
  ProjectRole,
  PROJECT_ROLE_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_COLORS,
} from '@/types';
import type { ProjectMember, UpdateProjectRequest, Task } from '@/types';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const { data: project, isLoading: projectLoading } = useProject(id!);
  const { data: members, isLoading: membersLoading } = useProjectMembers(id!);
  const { data: tasks } = useTasksByProject(id!);
  const { data: activitiesData } = useProjectActivities(id!, 20);

  const updateProject = useUpdateProject();
  const addMember = useAddProjectMember();
  const removeMember = useRemoveProjectMember();
  const updateMemberRole = useUpdateProjectMemberRole();

  const [activeTab, setActiveTab] = useState('overview');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editForm, setEditForm] = useState<UpdateProjectRequest>({});

  const { data: searchResults } = useSearchUsers(searchQuery);

  // Check if current user is owner
  const currentMember = members?.find((m) => m.userId === currentUser?.id);
  const isOwner = currentMember?.role === ProjectRole.OWNER;

  if (projectLoading || membersLoading) {
    return <Loading text="Đang tải thông tin dự án..." />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500">Không tìm thấy dự án</p>
        <Button className="mt-4" onClick={() => navigate('/projects')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleUpdateProject = async () => {
    try {
      await updateProject.mutateAsync({ id: project.id, data: editForm });
      setIsEditOpen(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await addMember.mutateAsync({
        projectId: project.id,
        data: { userId, role: ProjectRole.MEMBER },
      });
      setSearchQuery('');
      setIsAddMemberOpen(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      try {
        await removeMember.mutateAsync({ projectId: project.id, memberId });
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  };

  const handleUpdateRole = async (memberId: string, role: ProjectRole) => {
    try {
      await updateMemberRole.mutateAsync({ projectId: project.id, memberId, role });
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const existingMemberIds = members?.map((m) => m.userId) || [];
  const filteredSearchResults = searchResults?.filter(
    (u) => !existingMemberIds.includes(u.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color || '#3B82F6' }}
            />
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
            </div>
          </div>
        </div>
        {isOwner && (
          <Button
            variant="outline"
            onClick={() => {
              setEditForm({
                name: project.name,
                description: project.description,
                color: project.color,
              });
              setIsEditOpen(true);
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <ListTodo className="h-4 w-4 mr-2" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Thành viên ({members?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Activity className="h-4 w-4 mr-2" />
            Hoạt động
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tổng số task</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{tasks?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Thành viên</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{members?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ngày tạo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">
                  {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tasks */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Task gần đây</CardTitle>
                <CardDescription>Các task mới nhất trong dự án</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to={`/projects/${project.id}/timeline`} className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Gantt
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={`/projects/${project.id}/tasks`}>Xem tất cả</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!tasks || tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có task nào trong dự án
                </p>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <TaskRow key={task.id} task={task} projectId={project.id} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Thành viên dự án</CardTitle>
                <CardDescription>
                  Quản lý thành viên và phân quyền
                </CardDescription>
              </div>
              {isOwner && (
                <Button onClick={() => setIsAddMemberOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Thêm thành viên
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members?.map((member) => (
                  <MemberRow
                    key={member.userId}
                    member={member}
                    isOwner={isOwner}
                    isCurrentUser={member.userId === currentUser?.id}
                    onUpdateRole={(role) => handleUpdateRole(member.userId, role)}
                    onRemove={() => handleRemoveMember(member.userId)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoạt động</CardTitle>
              <CardDescription>
                Theo dõi các thay đổi trong dự án
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

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm thành viên</DialogTitle>
            <DialogDescription>
              Tìm kiếm và thêm thành viên vào dự án
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              placeholder="Tìm kiếm theo email hoặc tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {filteredSearchResults && filteredSearchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-auto">
                {filteredSearchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted cursor-pointer"
                    onClick={() => handleAddMember(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} alt={user.name} />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && filteredSearchResults?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Không tìm thấy người dùng
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dự án</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên dự án</Label>
              <Input
                value={editForm.name || ''}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateProject} disabled={updateProject.isPending}>
              {updateProject.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  projectId: string;
}

function TaskRow({ task, projectId }: TaskRowProps) {
  return (
    <Link
      to={`/projects/${projectId}/tasks/${task.id}`}
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-3">
        <div>
          <p className="font-medium">{task.title}</p>
          {task.endDate && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.endDate).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={TASK_PRIORITY_COLORS[task.priority]}>
          {task.priority}
        </Badge>
        <Badge className={TASK_STATUS_COLORS[task.status]}>
          {TASK_STATUS_LABELS[task.status]}
        </Badge>
      </div>
    </Link>
  );
}

interface MemberRowProps {
  member: ProjectMember;
  isOwner: boolean;
  isCurrentUser: boolean;
  onUpdateRole: (role: ProjectRole) => void;
  onRemove: () => void;
}

function MemberRow({
  member,
  isOwner,
  isCurrentUser,
  onUpdateRole,
  onRemove,
}: MemberRowProps) {
  const canEdit = isOwner && !isCurrentUser && member.role !== ProjectRole.OWNER;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <Avatar src={member.user?.avatar} alt={member.user?.name} />
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{member.user?.name}</p>
            {member.role === ProjectRole.OWNER && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canEdit ? (
          <>
            <Select
              value={member.role}
              onChange={(value) => onUpdateRole(value as ProjectRole)}
              options={Object.entries(PROJECT_ROLE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <Button variant="ghost" size="icon" onClick={onRemove}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        ) : (
          <Badge variant={member.role === ProjectRole.OWNER ? 'default' : 'secondary'}>
            {PROJECT_ROLE_LABELS[member.role]}
          </Badge>
        )}
      </div>
    </div>
  );
}
