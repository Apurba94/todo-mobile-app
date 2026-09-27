import AsyncStorage from "@react-native-async-storage/async-storage";

export type Priority = "low" | "medium" | "high";
export type TaskStatus = "open" | "completed";

export type Task = {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  projectId?: string;
  dueDate?: string;
  estimateMinutes?: number;
  tag?: string;
  status: TaskStatus;
  /** Retained for safe compatibility with data saved by the original project version. */
  completed: boolean;
  createdAt: string;
  completedAt?: string;
};

export type TaskDraft = {
  title: string;
  notes: string;
  priority: Priority;
  projectId?: string;
  dueDate?: string;
  estimateMinutes?: number;
  tag?: string;
};

export type Project = {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
};

export type ProjectDraft = Pick<Project, "name" | "color">;

export type TaskState = {
  tasks: Task[];
  projects: Project[];
};

const TASKS_STORAGE_KEY = "todo-mobile-app.tasks.v1";
const PROJECTS_STORAGE_KEY = "todo-mobile-app.projects.v1";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isPriority(value: unknown): value is Priority {
  return value === "low" || value === "medium" || value === "high";
}

function normalizeTask(value: unknown): Task | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.title !== "string" || !raw.title.trim()) return null;
  const completed = raw.status === "completed" || raw.completed === true;
  return {
    id: typeof raw.id === "string" ? raw.id : makeId("task"),
    title: raw.title.trim(),
    notes: typeof raw.notes === "string" && raw.notes.trim() ? raw.notes.trim() : undefined,
    priority: isPriority(raw.priority) ? raw.priority : "medium",
    projectId: typeof raw.projectId === "string" ? raw.projectId : undefined,
    dueDate: typeof raw.dueDate === "string" ? raw.dueDate : undefined,
    estimateMinutes: typeof raw.estimateMinutes === "number" ? raw.estimateMinutes : undefined,
    tag: typeof raw.tag === "string" && raw.tag.trim() ? raw.tag.trim() : undefined,
    status: completed ? "completed" : "open",
    completed,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : undefined,
  };
}

function normalizeProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.name !== "string" || !raw.name.trim()) return null;
  return {
    id: typeof raw.id === "string" ? raw.id : makeId("project"),
    name: raw.name.trim(),
    color: typeof raw.color === "string" ? raw.color : "#5358A6",
    icon: typeof raw.icon === "string" ? raw.icon : "folder",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

export async function loadTasks(): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeTask).filter((task): task is Task => Boolean(task)) : [];
  } catch {
    return [];
  }
}

export async function saveTasks(tasks: Task[]) {
  await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export async function loadTaskState(): Promise<TaskState> {
  const [tasks, projectsRaw] = await Promise.all([loadTasks(), AsyncStorage.getItem(PROJECTS_STORAGE_KEY)]);
  try {
    const parsed: unknown = projectsRaw ? JSON.parse(projectsRaw) : [];
    const projects = Array.isArray(parsed)
      ? parsed.map(normalizeProject).filter((project): project is Project => Boolean(project))
      : [];
    return { tasks, projects };
  } catch {
    return { tasks, projects: [] };
  }
}

export async function saveTaskState(state: TaskState) {
  await Promise.all([
    AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state.tasks)),
    AsyncStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(state.projects)),
  ]);
}

export function createTask(draft: TaskDraft): Task {
  return {
    id: makeId("task"),
    title: draft.title.trim(),
    notes: draft.notes.trim() || undefined,
    priority: draft.priority,
    projectId: draft.projectId || undefined,
    dueDate: draft.dueDate || undefined,
    estimateMinutes: draft.estimateMinutes || undefined,
    tag: draft.tag?.trim() || undefined,
    status: "open",
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function updateTaskFromDraft(task: Task, draft: TaskDraft): Task {
  return {
    ...task,
    title: draft.title.trim(),
    notes: draft.notes.trim() || undefined,
    priority: draft.priority,
    projectId: draft.projectId || undefined,
    dueDate: draft.dueDate || undefined,
    estimateMinutes: draft.estimateMinutes || undefined,
    tag: draft.tag?.trim() || undefined,
  };
}

export function createProject(draft: ProjectDraft): Project {
  return {
    id: makeId("project"),
    name: draft.name.trim(),
    color: draft.color,
    icon: "folder",
    createdAt: new Date().toISOString(),
  };
}
