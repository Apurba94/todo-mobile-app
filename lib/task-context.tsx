import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
  createProject,
  createTask,
  loadTaskState,
  Project,
  ProjectDraft,
  saveTaskState,
  Task,
  TaskDraft,
  TaskState,
  updateTaskFromDraft,
} from "@/lib/tasks";

type TaskContextValue = {
  tasks: Task[];
  projects: Project[];
  isLoading: boolean;
  addTask: (draft: TaskDraft) => Promise<void>;
  updateTask: (taskId: string, draft: TaskDraft) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addProject: (draft: ProjectDraft) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  resetAll: () => Promise<void>;
};

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

const emptyState: TaskState = { tasks: [], projects: [] };

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TaskState>(emptyState);
  const [isLoading, setIsLoading] = useState(true);
  const stateRef = useRef<TaskState>(emptyState);
  // Settles once saved data has been read. Changes wait for it: a change made
  // earlier would be saved on top of the still-empty state and erase every
  // stored task and project.
  const loadedRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    const load = loadTaskState()
      .then((loaded) => {
        if (!active) return;
        stateRef.current = loaded;
        setState(loaded);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    loadedRef.current = load.catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const commit = useCallback(async (transform: (current: TaskState) => TaskState) => {
    await loadedRef.current;
    const next = transform(stateRef.current);
    stateRef.current = next;
    setState(next);
    await saveTaskState(next);
  }, []);

  const addTask = useCallback(async (draft: TaskDraft) => {
    await commit((current) => ({ ...current, tasks: [createTask(draft), ...current.tasks] }));
  }, [commit]);

  const updateTask = useCallback(async (taskId: string, draft: TaskDraft) => {
    await commit((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === taskId ? updateTaskFromDraft(task, draft) : task),
    }));
  }, [commit]);

  const toggleTask = useCallback(async (taskId: string) => {
    await commit((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const completed = !task.completed;
        return {
          ...task,
          completed,
          status: completed ? "completed" : "open",
          completedAt: completed ? new Date().toISOString() : undefined,
        };
      }),
    }));
  }, [commit]);

  const deleteTask = useCallback(async (taskId: string) => {
    await commit((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== taskId) }));
  }, [commit]);

  const addProject = useCallback(async (draft: ProjectDraft) => {
    await commit((current) => ({ ...current, projects: [createProject(draft), ...current.projects] }));
  }, [commit]);

  const deleteProject = useCallback(async (projectId: string) => {
    await commit((current) => ({
      projects: current.projects.filter((project) => project.id !== projectId),
      tasks: current.tasks.map((task) => task.projectId === projectId ? { ...task, projectId: undefined } : task),
    }));
  }, [commit]);

  const clearCompleted = useCallback(async () => {
    await commit((current) => ({ ...current, tasks: current.tasks.filter((task) => !task.completed) }));
  }, [commit]);

  const resetAll = useCallback(async () => {
    await commit(() => emptyState);
  }, [commit]);

  const value = useMemo<TaskContextValue>(() => ({
    tasks: state.tasks,
    projects: state.projects,
    isLoading,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addProject,
    deleteProject,
    clearCompleted,
    resetAll,
  }), [state, isLoading, addTask, updateTask, toggleTask, deleteTask, addProject, deleteProject, clearCompleted, resetAll]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within TaskProvider");
  return context;
}
