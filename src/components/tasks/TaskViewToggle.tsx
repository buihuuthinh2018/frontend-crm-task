import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { List, Calendar, BarChart3 } from 'lucide-react';
import { TaskListView } from './TaskListView';
import { TaskTimelineView } from './TaskTimelineView';
import { HorizontalTimelineView } from './HorizontalTimelineView';
import type { Task } from '@/types';

interface TaskViewToggleProps {
  tasks: Task[];
  baseUrl?: string;
  onDelete?: (taskId: string) => void;
  showActions?: boolean;
}

export type ViewMode = 'list' | 'timeline' | 'gantt';

export function TaskViewToggle({
  tasks,
  baseUrl = '',
  onDelete,
  showActions = false,
}: TaskViewToggleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-4 flex-wrap">
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
          className="flex gap-2"
        >
          <List className="h-4 w-4" />
          Danh sách
        </Button>
        <Button
          variant={viewMode === 'timeline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('timeline')}
          className="flex gap-2"
        >
          <Calendar className="h-4 w-4" />
          Timeline (Ngày)
        </Button>
        <Button
          variant={viewMode === 'gantt' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('gantt')}
          className="flex gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Gantt
        </Button>
      </div>

      {viewMode === 'list' && (
        <TaskListView
          tasks={tasks}
          baseUrl={baseUrl}
          onDelete={onDelete}
          showActions={showActions}
        />
      )}
      {viewMode === 'timeline' && (
        <TaskTimelineView tasks={tasks} baseUrl={baseUrl} />
      )}
      {viewMode === 'gantt' && (
        <HorizontalTimelineView tasks={tasks} baseUrl={baseUrl} />
      )}
    </div>
  );
}
