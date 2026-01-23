import { useState } from 'react';
import { useMyActivities, useProjectActivities } from '@/hooks/useActivities';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/spinner';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Activity, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActivityAction } from '@/types';
import type { ActivityLog } from '@/types';

const ACTION_LABELS: Record<ActivityAction, string> = {
  [ActivityAction.PROJECT_CREATED]: 'Tạo dự án',
  [ActivityAction.PROJECT_UPDATED]: 'Cập nhật dự án',
  [ActivityAction.PROJECT_DELETED]: 'Xóa dự án',
  [ActivityAction.MEMBER_ADDED]: 'Thêm thành viên',
  [ActivityAction.MEMBER_REMOVED]: 'Xóa thành viên',
  [ActivityAction.MEMBER_ROLE_CHANGED]: 'Thay đổi vai trò',
  [ActivityAction.TASK_CREATED]: 'Tạo task',
  [ActivityAction.TASK_UPDATED]: 'Cập nhật task',
  [ActivityAction.TASK_DELETED]: 'Xóa task',
  [ActivityAction.TASK_STATUS_CHANGED]: 'Thay đổi trạng thái',
  [ActivityAction.TASK_MEMBER_ADDED]: 'Thêm cộng sự',
  [ActivityAction.TASK_MEMBER_REMOVED]: 'Xóa cộng sự',
  [ActivityAction.TASK_MEMBER_ROLE_CHANGED]: 'Thay đổi vai trò cộng sự',
  [ActivityAction.SUBTASK_CREATED]: 'Tạo subtask',
  [ActivityAction.COMMENT_ADDED]: 'Thêm bình luận',
};

const ACTION_COLORS: Record<string, string> = {
  PROJECT_CREATED: 'bg-green-100 text-green-700',
  PROJECT_UPDATED: 'bg-blue-100 text-blue-700',
  PROJECT_DELETED: 'bg-red-100 text-red-700',
  MEMBER_ADDED: 'bg-purple-100 text-purple-700',
  MEMBER_REMOVED: 'bg-red-100 text-red-700',
  TASK_CREATED: 'bg-green-100 text-green-700',
  TASK_UPDATED: 'bg-blue-100 text-blue-700',
  TASK_DELETED: 'bg-red-100 text-red-700',
  TASK_STATUS_CHANGED: 'bg-yellow-100 text-yellow-700',
};

const LIMIT = 20;

export function ActivityLogsPage() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [offset, setOffset] = useState(0);

  const { data: projects } = useProjects();
  const { data: myActivitiesData, isLoading: myLoading } = useMyActivities(LIMIT, offset);
  const { data: projectActivitiesData, isLoading: projectLoading } = useProjectActivities(
    selectedProject,
    LIMIT,
    offset
  );

  const isLoading = selectedProject ? projectLoading : myLoading;
  const activitiesData = selectedProject ? projectActivitiesData : myActivitiesData;

  const totalPages = Math.ceil((activitiesData?.total || 0) / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  const handlePageChange = (newPage: number) => {
    setOffset((newPage - 1) * LIMIT);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử hoạt động</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi tất cả hoạt động trong các dự án
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-64">
          <Select
            placeholder="Tất cả dự án"
            value={selectedProject}
            onChange={(value) => {
              setSelectedProject(value);
              setOffset(0);
            }}
            options={[
              { value: '', label: 'Hoạt động của tôi' },
              ...(projects?.map((p) => ({ value: p.id, label: p.name })) || []),
            ]}
          />
        </div>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {selectedProject
              ? `Hoạt động trong dự án`
              : 'Hoạt động của tôi'}
          </CardTitle>
          <CardDescription>
            Tổng cộng {activitiesData?.total || 0} hoạt động
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading text="Đang tải hoạt động..." />
          ) : !activitiesData?.data || activitiesData.data.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có hoạt động nào</p>
            </div>
          ) : (
            <>
              <div className="space-y-0">
                {activitiesData.data.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    isLast={index === activitiesData.data.length - 1}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Trang {currentPage} / {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ActivityItemProps {
  activity: ActivityLog;
  isLast: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const actionColor = ACTION_COLORS[activity.action] || 'bg-gray-100 text-gray-700';

  return (
    <div className="flex gap-4 relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Avatar */}
      <div className="relative z-10">
        <Avatar
          src={activity.user?.avatar}
          alt={activity.user?.name}
          size="md"
          className="border-2 border-white shadow-sm"
        />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{activity.user?.name}</span>
              <Badge className={actionColor}>
                {ACTION_LABELS[activity.action] || activity.action}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
            {activity.task && (
              <p className="text-sm text-muted-foreground mt-1">
                Task: <span className="font-medium">{activity.task.title}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <Calendar className="h-3 w-3" />
            {formatRelativeTime(new Date(activity.createdAt))}
          </div>
        </div>
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
