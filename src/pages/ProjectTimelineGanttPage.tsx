import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { useTasksByProject } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/spinner';
import { HorizontalTimelineView } from '@/components/tasks/HorizontalTimelineView';
import { ArrowLeft } from 'lucide-react';

export function ProjectTimelineGanttPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const { data: tasks, isLoading: tasksLoading } = useTasksByProject(projectId!);
  
  const taskWithMembers = tasks?.filter(t => t.members && t.members.length > 0) || [];

  if (projectLoading || tasksLoading) {
    return <Loading text="Đang tải dữ liệu..." />;
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Không tìm thấy dự án</p>
        <Button onClick={() => navigate('/projects')}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <p className="text-muted-foreground">Gantt Timeline - Quản lý công việc theo thành viên</p>
        </div>
      </div>

      {/* Timeline */}
      {taskWithMembers.length > 0 ? (
        <HorizontalTimelineView
          tasks={tasks || []}
          baseUrl={`/projects/${projectId}/tasks`}
        />
      ) : (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Chưa có task nào được giao cho các thành viên
          </p>
          <Button onClick={() => navigate(`/projects/${projectId}`)}>
            Quay lại dự án
          </Button>
        </div>
      )}
    </div>
  );
}
