import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import type { Task, TaskStatus as TaskStatusType } from '@/types';
import {
  TaskStatus,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
} from '@/types';

interface TaskListViewProps {
  tasks: Task[];
  baseUrl?: string; // e.g., "/projects/123/tasks"
  onDelete?: (taskId: string) => void;
  showActions?: boolean;
}

export function TaskListView({
  tasks,
  baseUrl = '',
  onDelete,
  showActions = false,
}: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Không có task nào</p>
        </CardContent>
      </Card>
    );
  }

  // Group by status
  const groupedByStatus = tasks.reduce(
    (acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    },
    {} as Record<TaskStatusType, Task[]>
  );

  const statusOrder = [
    TaskStatus.NOT_STARTED,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.CANCELLED,
  ];

  return (
    <div className="space-y-6">
      {statusOrder.map((status) => {
        const statusTasks = groupedByStatus[status];
        if (!statusTasks || statusTasks.length === 0) return null;

        return (
          <div key={status}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              {TASK_STATUS_LABELS[status]}
              <Badge variant="outline">{statusTasks.length}</Badge>
            </h3>
            <div className="grid gap-3">
              {statusTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`${baseUrl}/${task.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium leading-tight ${
                              task.status === TaskStatus.COMPLETED
                                ? 'line-through text-muted-foreground'
                                : 'text-gray-900'
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <Badge
                              className={TASK_STATUS_COLORS[task.status]}
                              variant="secondary"
                            >
                              {TASK_STATUS_LABELS[task.status]}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {TASK_PRIORITY_LABELS[task.priority]}
                            </Badge>
                            {task.endDate && (
                              <Badge variant="outline" className="text-xs">
                                Hạn: {new Date(task.endDate).toLocaleDateString('vi-VN')}
                              </Badge>
                            )}
                          </div>
                          {task.members && task.members.length > 0 && (
                            <div className="flex gap-1 mt-3">
                              {task.members.slice(0, 3).map((member) => (
                                <div
                                  key={member.userId}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold"
                                  title={member.user?.name}
                                >
                                  {member.user?.name?.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {task.members.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold">
                                  +{task.members.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {showActions && (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                // Handle edit
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                onDelete?.(task.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
