import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { storage.set(key, value); }),
  },
}));

import { createProject, createTask, loadTaskState, saveTaskState, updateTaskFromDraft } from "../lib/tasks";

describe("offline task domain", () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  it("creates an open task with optional planning fields", () => {
    const task = createTask({
      title: "  Send project update  ",
      notes: "  Include next steps  ",
      priority: "high",
      projectId: "project-work",
      dueDate: "2026-08-18",
      estimateMinutes: 30,
      tag: "  Work  ",
    });

    expect(task).toMatchObject({
      title: "Send project update",
      notes: "Include next steps",
      priority: "high",
      projectId: "project-work",
      dueDate: "2026-08-18",
      estimateMinutes: 30,
      tag: "Work",
      status: "open",
      completed: false,
    });
  });

  it("preserves completion history when task details are edited", () => {
    const completed = { ...createTask({ title: "Read", notes: "", priority: "low" }), completed: true as const, status: "completed" as const, completedAt: "2026-08-15T09:00:00.000Z" };
    const updated = updateTaskFromDraft(completed, { title: "Read chapter 2", notes: "Notes", priority: "medium", estimateMinutes: 45 });

    expect(updated).toMatchObject({ title: "Read chapter 2", status: "completed", completed: true, completedAt: "2026-08-15T09:00:00.000Z", estimateMinutes: 45 });
  });

  it("round-trips projects and safely migrates legacy tasks", async () => {
    const project = createProject({ name: "Home", color: "#6E8F78" });
    await saveTaskState({
      projects: [project],
      tasks: [{ id: "legacy-1", title: "Legacy task", priority: "medium", completed: false, createdAt: "2026-08-15T09:00:00.000Z", notes: "" } as never],
    });

    const state = await loadTaskState();

    expect(state.projects).toHaveLength(1);
    expect(state.projects[0]).toMatchObject({ name: "Home", color: "#6E8F78" });
    expect(state.tasks[0]).toMatchObject({ id: "legacy-1", status: "open", completed: false });
  });
});
