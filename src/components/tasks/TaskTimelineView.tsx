import { useMemo } from 'react';
import { format, isToday, startOfDay, isBefore } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import type { Task } from '@/types';
import {
  TaskStatus,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from '@/types';

interface TaskTimelineViewProps {
  tasks: Task[];
  baseUrl?: string; // e.g., "/projects/123/tasks"
}

export function TaskTimelineView({ tasks, baseUrl = '' }: TaskTimelineViewProps) {
  const timelineData = useMemo(() => {
    // Group tasks by date
    const grouped: Record<string, Task[]> = {};
    const today = startOfDay(new Date());

    tasks.forEach((task) => {
      const taskDate = task.endDate ? startOfDay(new Date(task.endDate)) : today;
      const dateKey = format(taskDate, 'yyyy-MM-dd');

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });

    // Sort by date and create timeline
    const sortedDates = Object.keys(grouped).sort();
    return sortedDates.map((dateKey) => ({
      date: new Date(dateKey),
      dateKey,
      tasks: grouped[dateKey].sort((a, b) => {
        // Sort by status: NOT_STARTED -> IN_PROGRESS -> COMPLETED -> CANCELLED
        const statusOrder = {
          [TaskStatus.NOT_STARTED]: 0,
          [TaskStatus.IN_PROGRESS]: 1,
          [TaskStatus.COMPLETED]: 2,
          [TaskStatus.CANCELLED]: 3,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }),
    }));
  }, [tasks]);

  const getDayOfWeek = (date: Date) => {
    return format(date, 'EEEE', { locale: vi });
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-blue-600" />;
      case TaskStatus.NOT_STARTED:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (timelineData.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Không có task nào</h3>
          <p className="text-muted-foreground text-center mt-1">
            Tất cả task của bạn đã được hoàn thành
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {timelineData.map(({ date, dateKey, tasks: dateTasks }) => {
        const dayOfWeek = getDayOfWeek(date);
        const today = startOfDay(new Date());
        const isOverdue = isBefore(date, today);
        const isPastDue =
          dateTasks.some((t) => t.status !== TaskStatus.COMPLETED) && isOverdue;

        return (
          <div key={dateKey}>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {dayOfWeek}
                  </h3>
                  {isPastDue && (
                    <Badge variant="destructive" className="text-xs">
                      Quá hạn
                    </Badge>
                  )}
                  {isToday(date) && (
                    <Badge className="text-xs bg-blue-100 text-blue-700">
                      Hôm nay
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(date, 'd MMMM yyyy', { locale: vi })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {dateTasks.length} task
                </p>
                <p className="text-xs text-muted-foreground">
                  {dateTasks.filter((t) => t.status === TaskStatus.COMPLETED).length} hoàn thành
                </p>
              </div>
            </div>

            <div className="grid gap-3 ml-4 border-l-2 border-gray-200 pl-4">
              {dateTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`${baseUrl}/${task.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
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
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs">
                                {TASK_STATUS_LABELS[task.status]}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {TASK_PRIORITY_LABELS[task.priority]}
                              </Badge>
                            </div>
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
