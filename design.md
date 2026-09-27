# Taskly Interface Design

## Product direction

**Taskly** extends the existing calm task-manager direction into an offline-first daily planning companion. It remains optimized for a 9:16 portrait display and one-handed use, but adds the planning structure expected from a more capable Play Store offering: projects, scheduled work, effort estimates, task filters, and a compact productivity review. The interface avoids account walls and keeps all data on-device by default.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Today | A personal greeting, date label, daily completion progress, quick filters, an “up next” task section, and a compact task list. A floating action gives one-tap task capture. |
| Add or edit task sheet | A focused, keyboard-friendly form for task title, notes, project, priority, due date, estimate, and optional tag. The sheet supports saving new tasks and editing existing ones. |
| Planner | A date-driven agenda with an overdue callout, a seven-day selector, scheduled task groups, and an unscheduled backlog. Users can move their planning horizon without leaving the tab. |
| Projects | Project cards displaying a color cue, task count, and completion progress. Users can filter the task view to a project and create lightweight task groupings. |
| Insights | A concise weekly productivity review: completed-task count, focus minutes inferred from estimates, completion rate, daily activity bars, and a recent-completions list. |
| Settings | Local preference controls, completed-task cleanup, seed-data reset, app information, and an explanation that data remains on device. |

## Key user flows

1. The user opens **Today**, selects a context filter such as “High priority” or “Due soon,” and completes the next most relevant task directly from its card.
2. The user taps the floating add button, enters a task title, assigns a project and priority, optionally schedules it or sets an estimate, then saves. The task appears in the correct Today or Planner section.
3. The user opens **Planner**, selects a day from the horizontal week selector, and reviews scheduled work alongside the unscheduled backlog. Tapping a task opens the same edit sheet for quick rescheduling.
4. The user opens **Projects**, selects a project card, and narrows the task list to that project to reduce cognitive load. Project progress updates when its tasks are completed.
5. The user checks off a task from any task list. The app gives subtle confirmation feedback, preserves it in completion history, and updates both progress and Insights immediately.
6. The user opens **Insights** to review the past seven days, then clears completed history only from Settings after a confirmation prompt.

## Data model

```ts
type Priority = "low" | "medium" | "high";
type TaskStatus = "open" | "completed";

type Project = {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  projectId?: string;
  dueDate?: string;
  estimateMinutes?: number;
  tag?: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
};
```

Tasks and projects are persisted through AsyncStorage. New fields remain optional where appropriate so existing locally stored task records can be safely normalized as the app is upgraded.

## Color choices

| Token | Light value | Usage |
|---|---|---|
| Ink | `#1D2421` | Primary headings, task titles, and strong contrast text |
| Canvas | `#F7F6F2` | Warm, low-glare application background |
| Card | `#FFFFFF` | Task, project, and analytics surfaces |
| Coral | `#F26B5E` | Primary action, overdue emphasis, and high priority |
| Sage | `#6E8F78` | Completion, positive progress, and low priority |
| Indigo | `#5358A6` | Planner state, project accents, and information cues |
| Sand | `#E9E3D8` | Borders, inactive chips, and muted surface detail |
| Muted | `#7C857F` | Supporting copy and secondary metadata |

## Interaction and accessibility

The four-item tab bar is anchored at the bottom, with the primary capture action floating just above it. All repeated controls use a minimum 44-point target; priority is communicated by text and color; swipe-style gestures are not required for any essential action; and destructive settings actions require confirmation. The form is presented as an adaptable sheet so it stays reachable with the keyboard open. Typography maintains generous line height, and completed tasks remain discoverable in history instead of disappearing without explanation.
