import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TaskCard, TaskComposer } from "@/components/task-ui";
import { useColors } from "@/hooks/use-colors";
import { dateKey, formatDateHeading } from "@/lib/task-date";
import { useTasks } from "@/lib/task-context";
import { Task } from "@/lib/tasks";

type Filter = "all" | "focus" | "due";

const priorityOrder = { high: 0, medium: 1, low: 2 };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function byPriorityAndDate(a: Task, b: Task) {
  const aDate = a.dueDate ?? "9999-12-31";
  const bDate = b.dueDate ?? "9999-12-31";
  return aDate.localeCompare(bDate) || priorityOrder[a.priority] - priorityOrder[b.priority] || b.createdAt.localeCompare(a.createdAt);
}

export default function TodayScreen() {
  const colors = useColors();
  const { tasks, projects, isLoading, addTask, updateTask, toggleTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState<Filter>("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const today = dateKey();
  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const doneToday = useMemo(() => tasks.filter((task) => task.completedAt?.slice(0, 10) === today).length, [tasks, today]);
  const visibleTasks = useMemo(() => activeTasks.filter((task) => {
    if (filter === "focus") return task.priority === "high";
    if (filter === "due") return Boolean(task.dueDate && task.dueDate <= today);
    return true;
  }).sort(byPriorityAndDate), [activeTasks, filter, today]);
  const scheduledToday = activeTasks.filter((task) => task.dueDate === today).length;
  const progress = tasks.length ? Math.round((tasks.filter((task) => task.completed).length / tasks.length) * 100) : 0;

  function openNewTask() {
    setSelectedTask(null);
    setComposerOpen(true);
  }

  function openTask(task: Task) {
    setSelectedTask(task);
    setComposerOpen(true);
  }

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.greeting, { color: colors.muted }]}>{greeting()}</Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>Plan with purpose.</Text>
          <Text style={[styles.date, { color: colors.muted }]}>{formatDateHeading()}</Text>
        </View>
        <View style={[styles.progressBadge, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
          <Text style={[styles.progressValue, { color: colors.foreground }]}>{progress}%</Text>
          <Text style={[styles.progressLabel, { color: colors.muted }]}>all time</Text>
        </View>
      </View>

      <View style={[styles.dayCard, { backgroundColor: colors.primary }]}>
        <View style={styles.dayCardTop}><View><Text style={styles.dayEyebrow}>YOUR DAILY RHYTHM</Text><Text style={styles.dayTitle}>{activeTasks.length ? `${activeTasks.length} open task${activeTasks.length === 1 ? "" : "s"}` : "Everything is clear"}</Text></View><View style={styles.dayIcon}><IconSymbol name={activeTasks.length ? "sparkles" : "checkmark"} size={21} color="#FFFFFF" /></View></View>
        <View style={styles.dayCardBottom}><Text style={styles.daySubtext}>{scheduledToday ? `${scheduledToday} planned for today` : doneToday ? `${doneToday} completed today` : "Choose one task to begin"}</Text><View style={styles.dayTrack}><View style={[styles.dayFill, { width: `${Math.min(progress || (activeTasks.length ? 10 : 100), 100)}%` }]} /></View></View>
      </View>

      <View style={styles.filterRow}>
        {([
          ["all", "All tasks"],
          ["focus", "High focus"],
          ["due", "Due now"],
        ] as [Filter, string][]).map(([value, label]) => <Pressable key={value} onPress={() => setFilter(value)} style={({ pressed }) => [styles.filterChip, { backgroundColor: filter === value ? colors.foreground : colors.surface, borderColor: filter === value ? colors.foreground : colors.border }, pressed && styles.opacityPressed]}><Text style={[styles.filterText, { color: filter === value ? colors.background : colors.muted }]}>{label}</Text></Pressable>)}
      </View>

      <View style={styles.sectionHeading}><View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{filter === "all" ? "Up next" : filter === "focus" ? "High-priority focus" : "Needs attention"}</Text><Text style={[styles.sectionSubtext, { color: colors.muted }]}>{isLoading ? "Syncing your workspace" : `${visibleTasks.length} task${visibleTasks.length === 1 ? "" : "s"} in view`}</Text></View><Pressable onPress={openNewTask} accessibilityLabel="Add task" style={({ pressed }) => [styles.smallAdd, { backgroundColor: `${colors.primary}18` }, pressed && styles.opacityPressed]}><IconSymbol name="plus" size={20} color={colors.primary} /></Pressable></View>

      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={visibleTasks.length ? styles.listContent : styles.emptyContent}
        renderItem={({ item }) => <TaskCard task={item} projects={projects} onToggle={() => void toggleTask(item.id)} onPress={() => openTask(item)} />}
        ListEmptyComponent={<View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.emptyIcon, { backgroundColor: `${colors.success}18` }]}><IconSymbol name="checkmark.circle.fill" size={29} color={colors.success} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{filter === "all" ? "A little room to breathe." : "Nothing needs your attention."}</Text><Text style={[styles.emptyCopy, { color: colors.muted }]}>{filter === "all" ? "Capture a task whenever it crosses your mind." : "Try another filter or add a fresh task."}</Text><Pressable onPress={openNewTask} style={({ pressed }) => [styles.emptyButton, { backgroundColor: colors.primary }, pressed && styles.opacityPressed]}><Text style={styles.emptyButtonText}>Add task</Text></Pressable></View>}
      />

      <Pressable accessibilityRole="button" accessibilityLabel="Add a new task" onPress={openNewTask} style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary }, pressed && styles.pressed]}><IconSymbol name="plus" size={28} color="#FFFFFF" /></Pressable>
      <TaskComposer visible={composerOpen} task={selectedTask} projects={projects} onClose={() => setComposerOpen(false)} onSave={(draft) => selectedTask ? updateTask(selectedTask.id, draft) : addTask(draft)} onDelete={deleteTask} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 14, paddingBottom: 21 },
  headerCopy: { flex: 1, paddingRight: 16 },
  greeting: { fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  heading: { fontSize: 30, lineHeight: 37, fontWeight: "900", letterSpacing: -0.8, marginTop: 4 },
  date: { fontSize: 13, lineHeight: 18, marginTop: 3, fontWeight: "600" },
  progressBadge: { width: 66, height: 66, borderRadius: 21, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  progressValue: { fontSize: 17, fontWeight: "900", letterSpacing: -0.2 },
  progressLabel: { fontSize: 9, fontWeight: "800", marginTop: 1, textTransform: "uppercase", letterSpacing: 0.45 },
  dayCard: { borderRadius: 23, padding: 17, minHeight: 138, marginBottom: 17, overflow: "hidden" },
  dayCardTop: { flexDirection: "row", justifyContent: "space-between" },
  dayEyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, color: "rgba(255,255,255,0.78)" },
  dayTitle: { color: "#FFFFFF", fontSize: 20, lineHeight: 25, fontWeight: "900", marginTop: 5, letterSpacing: -0.35 },
  dayIcon: { height: 36, width: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)" },
  dayCardBottom: { marginTop: "auto", paddingTop: 17 },
  daySubtext: { color: "rgba(255,255,255,0.88)", fontSize: 12, fontWeight: "700" },
  dayTrack: { height: 5, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.25)", marginTop: 8, overflow: "hidden" },
  dayFill: { height: "100%", borderRadius: 4, backgroundColor: "#FFFFFF" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 21 },
  filterChip: { minHeight: 36, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, justifyContent: "center" },
  filterText: { fontSize: 12, fontWeight: "800" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 11 },
  sectionTitle: { fontSize: 20, lineHeight: 25, fontWeight: "900", letterSpacing: -0.35 },
  sectionSubtext: { fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 1 },
  smallAdd: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  listContent: { gap: 10, paddingBottom: 120 },
  emptyContent: { flexGrow: 1, paddingBottom: 120, justifyContent: "center" },
  empty: { borderRadius: 22, borderWidth: 1, padding: 25, alignItems: "center", marginTop: 16 },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900", letterSpacing: -0.2, textAlign: "center", marginTop: 15 },
  emptyCopy: { fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6, maxWidth: 240 },
  emptyButton: { marginTop: 18, minHeight: 43, borderRadius: 13, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" },
  emptyButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  fab: { position: "absolute", right: 22, bottom: 20, width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center", shadowColor: "#201E1B", shadowOpacity: 0.22, shadowRadius: 11, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  opacityPressed: { opacity: 0.7 },
});
