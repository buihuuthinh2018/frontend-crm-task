import { useState } from "react";
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  FolderOpen,
  Users,
  ListTodo,
  Trash2,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Project, CreateProjectRequest } from "@/types";

const PROJECT_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
];

export function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<CreateProjectRequest>({
    name: "",
    description: "",
    color: PROJECT_COLORS[0],
  });

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    try {
      await createProject.mutateAsync(newProject);
      setIsCreateDialogOpen(false);
      setNewProject({ name: "", description: "", color: PROJECT_COLORS[0] });
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dự án này?")) {
      try {
        await deleteProject.mutateAsync(projectId);
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  if (isLoading) {
    return <Loading text="Đang tải danh sách dự án..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500">Có lỗi xảy ra khi tải dự án</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dự án</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các dự án của bạn
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo dự án
        </Button>
      </div>

      {projects && projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Chưa có dự án nào</h3>
            <p className="text-muted-foreground text-center mt-1">
              Bắt đầu bằng cách tạo dự án đầu tiên của bạn
            </p>
            <Button
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo dự án đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo dự án mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo một dự án mới
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên dự án *</Label>
              <Input
                id="name"
                placeholder="Nhập tên dự án..."
                value={newProject.name}
                onChange={(e) =>
                  setNewProject((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả ngắn về dự án..."
                value={newProject.description}
                onChange={(e) =>
                  setNewProject((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Màu sắc</Label>
              <div className="flex gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    title="Chọn màu"
                    key={color}
                    type="button"
                    onClick={() =>
                      setNewProject((prev) => ({ ...prev, color }))
                    }
                    className={`w-8 h-8 rounded-full transition-transform ${
                      newProject.color === color
                        ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProject.name.trim() || createProject.isPending}
            >
              {createProject.isPending ? "Đang tạo..." : "Tạo dự án"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
}

function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color || "#3B82F6" }}
            />
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              {project.isArchived && (
                <Badge variant="secondary" className="mt-1">
                  Đã lưu trữ
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/projects/${project.id}/settings`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <CardDescription className="mb-4 line-clamp-2">
            {project.description}
          </CardDescription>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            <span>{project._count?.tasks || 0} task</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{project._count?.members || 0} thành viên</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to={`/projects/${project.id}`}>Xem chi tiết</Link>
          </Button>
          <Button size="sm" asChild className="flex-1">
            <Link to={`/projects/${project.id}/tasks`}>Quản lý task</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
