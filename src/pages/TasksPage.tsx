import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Plus } from 'lucide-react';
import type { Task } from '@/types';

export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      priority: newTask.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addTask(task);
    setNewTask({ title: '', description: '', priority: 'medium' });
    setShowForm(false);
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    updateTask(id, { status, updatedAt: new Date() });
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Task</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No tasks yet. Create your first task!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
