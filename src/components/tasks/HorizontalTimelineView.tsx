import { useMemo, useState } from "react";
import {
  format,
  differenceInDays,
  addDays,
  startOfDay,
  isBefore,
  isAfter,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Task } from "@/types";
import { TaskStatus, TaskPriority } from "@/types";

interface HorizontalTimelineViewProps {
  tasks: Task[];
  baseUrl: string;
}

const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: "bg-gray-300",
  [TaskStatus.IN_PROGRESS]: "bg-blue-400",
  [TaskStatus.COMPLETED]: "bg-green-400",
  [TaskStatus.CANCELLED]: "bg-red-300",
};

const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: "text-blue-600",
  [TaskPriority.MEDIUM]: "text-yellow-600",
  [TaskPriority.HIGH]: "text-red-600",
  [TaskPriority.URGENT]: "text-red-800",
};

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: "Chưa bắt đầu",
  [TaskStatus.IN_PROGRESS]: "Đang xử lý",
  [TaskStatus.COMPLETED]: "Đã hoàn thành",
  [TaskStatus.CANCELLED]: "Đã hủy",
};

const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: "Thấp",
  [TaskPriority.MEDIUM]: "Trung bình",
  [TaskPriority.HIGH]: "Cao",
  [TaskPriority.URGENT]: "Khẩn cấp",
};

export function HorizontalTimelineView({
  tasks,
  baseUrl,
}: HorizontalTimelineViewProps) {
  const today = startOfDay(new Date());
  const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(
    format(addDays(today, 60), "yyyy-MM-dd"),
  );
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(
    new Set(),
  );

  const timelineStart = startOfDay(new Date(startDate));
  const timelineEnd = startOfDay(new Date(endDate));
  const totalDays = differenceInDays(timelineEnd, timelineStart) + 1;

  // Group tasks by member
  const tasksByMember = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      if (!task.startDate && !task.endDate) return;

      const taskStart = task.startDate
        ? startOfDay(new Date(task.startDate))
        : timelineStart;
      const taskEnd = task.endDate
        ? startOfDay(new Date(task.endDate))
        : taskStart;

      // Filter tasks within timeline range
      if (isBefore(taskEnd, timelineStart) || isAfter(taskStart, timelineEnd)) {
        return;
      }

      const memberLabel =
        task.members && task.members.length > 0
          ? task.members.map((m) => m.user?.name || "Unknown").join(", ")
          : "Không giao cho ai";

      if (!grouped[memberLabel]) {
        grouped[memberLabel] = [];
      }
      grouped[memberLabel].push(task);
    });

    return grouped;
  }, [tasks, timelineStart, timelineEnd]);

  const getTaskPosition = (task: Task) => {
    const taskStart = task.startDate
      ? startOfDay(new Date(task.startDate))
      : timelineStart;
    const taskEnd = task.endDate
      ? startOfDay(new Date(task.endDate))
      : taskStart;

    const startPos = Math.max(0, differenceInDays(taskStart, timelineStart));
    const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1);

    return {
      left: (startPos / totalDays) * 100,
      width: (duration / totalDays) * 100,
    };
  };

  const toggleMember = (memberLabel: string) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(memberLabel)) {
      newExpanded.delete(memberLabel);
    } else {
      newExpanded.add(memberLabel);
    }
    setExpandedMembers(newExpanded);
  };

  const isOverdue = (task: Task) => {
    if (!task.endDate) return false;
    return (
      isBefore(new Date(task.endDate), today) &&
      task.status !== TaskStatus.COMPLETED
    );
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="h-3 w-3 text-blue-600" />;
      case TaskStatus.NOT_STARTED:
        return <AlertCircle className="h-3 w-3 text-yellow-600" />;
      default:
        return <AlertCircle className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-4 text-gray-900">
          Chọn khoảng thời gian
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Ngày bắt đầu</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">Ngày kết thúc</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Hiển thị {totalDays} ngày (
          {format(timelineStart, "d MMM", { locale: vi })} -{" "}
          {format(timelineEnd, "d MMM yyyy", { locale: vi })})
        </p>
      </div>

      {/* Timeline Header with Months/Weeks */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <div className="min-w-max">
          {/* Member column and timeline header */}
          <div className="flex">
            <div className="w-48 flex-shrink-0 border-r bg-gray-50">
              <div className="h-16 flex items-center px-4 font-semibold text-sm">
                Thành viên
              </div>
            </div>
            <div className="flex-1">
              {/* Week headers */}
              <div
                className="flex h-16 border-b"
                style={{
                  display: "flex",
                  minWidth: `${totalDays * 30}px`,
                  width: "100%",
                }}
              >
                {Array.from({ length: totalDays }).map((_, i) => {
                  const date = addDays(timelineStart, i);
                  const isWeekStart = date.getDay() === 1;
                  const isSunday = date.getDay() === 0;

                  return (
                    <div
                      key={i}
                      className={`flex-1 flex-shrink-0 flex flex-col items-center justify-center text-xs border-r ${
                        isSunday
                          ? "bg-red-50"
                          : isWeekStart
                            ? "bg-blue-50"
                            : "bg-white"
                      }`}
                      style={{ minWidth: "30px", height: "100%" }}
                      title={format(date, "EEEE, d MMM", { locale: vi })}
                    >
                      <span
                        className={
                          isSunday ? "text-red-600 font-bold" : "text-gray-700"
                        }
                      >
                        {format(date, "d")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(date, "EEE", { locale: vi }).substring(0, 2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timeline rows for each member */}
          {Object.entries(tasksByMember).map(([memberLabel, memberTasks]) => {
            const isExpanded = expandedMembers.has(memberLabel);
            const displayTasks = isExpanded
              ? memberTasks
              : memberTasks.slice(0, 1);

            return (
              <div key={memberLabel} className="border-b">
                {/* Member row */}
                <div className="flex">
                  <div className="w-48 flex-shrink-0 border-r bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="truncate">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {memberLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {memberTasks.length} task
                      </p>
                    </div>
                    {memberTasks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2"
                        onClick={() => toggleMember(memberLabel)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <div
                    className="flex-1 relative flex"
                    style={{
                      minWidth: `${totalDays * 30}px`,
                      width: "100%",
                      minHeight: isExpanded
                        ? `${Math.max(40 * memberTasks.length, 60)}px`
                        : "60px",
                    }}
                  >
                    {/* Timeline today indicator */}
                    {isBefore(today, timelineEnd) &&
                      isAfter(today, timelineStart) && (
                        <div
                          className="absolute top-0 bottom-0 border-l-2 border-red-500"
                          style={{
                            left: `${differenceInDays(today, timelineStart) * 30}px`,
                          }}
                        />
                      )}

                    {/* Task bars */}
                    {displayTasks.map((task, taskIndex) => {
                      const position = getTaskPosition(task);
                      const overdue = isOverdue(task);

                      return (
                        <Link
                          key={task.id}
                          to={`${baseUrl}/${task.id}`}
                          className="absolute group"
                          style={{
                            left: `${position.left}%`,
                            width: `${position.width}%`,
                            top: `${10 + taskIndex * 35}px`,
                            minWidth: "2px",
                          }}
                        >
                          <div
                            className={`h-8 rounded px-2 py-1 text-xs text-white font-medium flex items-center gap-1 truncate cursor-pointer transition-all group-hover:shadow-lg group-hover:z-10 ${
                              TASK_STATUS_COLORS[task.status]
                            } ${overdue ? "ring-2 ring-red-500" : ""}`}
                            title={task.title}
                          >
                            {getStatusIcon(task.status)}
                            <span className="truncate">{task.title}</span>
                          </div>
                          {/* Tooltip on hover */}
                          <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-50 pointer-events-none">
                            <p className="font-semibold">{task.title}</p>
                            <p>{TASK_STATUS_LABELS[task.status]}</p>
                            {task.startDate && (
                              <p>
                                {format(new Date(task.startDate), "d MMM", {
                                  locale: vi,
                                })}{" "}
                                -
                                {task.endDate &&
                                  format(new Date(task.endDate), "d MMM", {
                                    locale: vi,
                                  })}
                              </p>
                            )}
                            {task.priority && (
                              <p
                                className={TASK_PRIORITY_COLORS[task.priority]}
                              >
                                Độ ưu tiên:{" "}
                                {TASK_PRIORITY_LABELS[task.priority]}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Show collapsed indicator */}
                {!isExpanded && memberTasks.length > 1 && (
                  <div className="flex">
                    <div className="w-48 flex-shrink-0 border-r"></div>
                    <div className="flex-1 px-4 py-2 text-xs text-muted-foreground">
                      +{memberTasks.length - 1} task khác
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {Object.keys(tasksByMember).length === 0 && (
            <div className="flex">
              <div className="w-full py-8 text-center text-muted-foreground">
                Không có task trong khoảng thời gian này
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(TASK_STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded ${TASK_STATUS_COLORS[status as TaskStatus]}`}
              />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
