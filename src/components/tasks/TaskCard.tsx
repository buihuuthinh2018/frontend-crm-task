import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Task } from '@/types';
import { Calendar, User, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
}

export function TaskCard({ task, onDelete, onStatusChange }: TaskCardProps) {
  const statusColors = {
    'todo': 'bg-gray-200 text-gray-800',
    'in-progress': 'bg-blue-200 text-blue-800',
    'done': 'bg-green-200 text-green-800',
  };

  const priorityColors = {
    'low': 'bg-gray-100 text-gray-600',
    'medium': 'bg-yellow-100 text-yellow-600',
    'high': 'bg-red-100 text-red-600',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
                {task.status}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {task.assignedTo && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{task.assignedTo}</span>
            </div>
          )}
        </div>
        {onStatusChange && (
          <div className="mt-4 flex gap-2">
            {(['todo', 'in-progress', 'done'] as const).map((status) => (
              <Button
                key={status}
                variant={task.status === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStatusChange(task.id, status)}
              >
                {status}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
