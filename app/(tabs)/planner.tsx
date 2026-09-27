import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TaskCard, TaskComposer } from "@/components/task-ui";
import { useColors } from "@/hooks/use-colors";
import { addDaysKey, dateKey, formatDateHeading, formatDayNumber, formatWeekday } from "@/lib/task-date";
import { useTasks } from "@/lib/task-context";
import { Task } from "@/lib/tasks";

const priorityOrder = { high: 0, medium: 1, low: 2 };

export default function PlannerScreen() {
  const colors = useColors();
  const { tasks, projects, addTask, updateTask, toggleTask, deleteTask } = useTasks();
  const [selectedDate, setSelectedDate] = useState(dateKey());
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDaysKey(index - 2)), []);
  const planned = useMemo(() => tasks.filter((task) => !task.completed && task.dueDate === selectedDate).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]), [tasks, selectedDate]);
  const overdue = useMemo(() => selectedDate === dateKey() ? tasks.filter((task) => !task.completed && task.dueDate && task.dueDate < dateKey()).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!)) : [], [tasks, selectedDate]);
  const backlog = useMemo(() => tasks.filter((task) => !task.completed && !task.dueDate).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 4), [tasks]);

  function openNewTask() { setSelectedTask(null); setComposerOpen(true); }
  function openTask(task: Task) { setSelectedTask(task); setComposerOpen(true); }

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View style={styles.header}><Text style={[styles.overline, { color: colors.primary }]}>PLAN AHEAD</Text><View style={styles.headerRow}><View><Text style={[styles.title, { color: colors.foreground }]}>Planner</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{formatDateHeading(selectedDate)}</Text></View><Pressable onPress={openNewTask} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary }, pressed && styles.opacityPressed]}><IconSymbol name="plus" size={21} color="#FFFFFF" /></Pressable></View></View>
      <View style={[styles.weekStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}>{days.map((day) => { const selected = selectedDate === day; const isToday = day === dateKey(); return <Pressable key={day} onPress={() => setSelectedDate(day)} style={({ pressed }) => [styles.dayButton, selected && { backgroundColor: colors.foreground }, pressed && styles.opacityPressed]}><Text style={[styles.weekday, { color: selected ? colors.background : colors.muted }]}>{formatWeekday(day).slice(0, 1)}</Text><Text style={[styles.dayNumber, { color: selected ? colors.background : colors.foreground }]}>{formatDayNumber(day)}</Text>{isToday && !selected ? <View style={[styles.todayDot, { backgroundColor: colors.primary }]} /> : <View style={styles.dayDotPlaceholder} />}</Pressable>; })}</View>
      <FlatList
        data={planned}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<><View style={styles.sectionHeading}><View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{selectedDate === dateKey() ? "Today’s plan" : "Scheduled work"}</Text><Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{planned.length ? `${planned.length} task${planned.length === 1 ? "" : "s"} planned` : "Keep this day spacious"}</Text></View><IconSymbol name="calendar" size={20} color={colors.muted} /></View>{overdue.length ? <View style={[styles.overdueBlock, { backgroundColor: `${colors.primary}0F`, borderColor: `${colors.primary}38` }]}><View style={styles.overdueHeading}><IconSymbol name="sparkles" size={17} color={colors.primary} /><Text style={[styles.overdueTitle, { color: colors.primary }]}>{overdue.length} overdue task{overdue.length === 1 ? "" : "s"}</Text></View>{overdue.map((task) => <TaskCard key={task.id} task={task} projects={projects} compact onToggle={() => void toggleTask(task.id)} onPress={() => openTask(task)} />)}</View> : null}</>}
        renderItem={({ item }) => <TaskCard task={item} projects={projects} onToggle={() => void toggleTask(item.id)} onPress={() => openTask(item)} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing scheduled</Text><Text style={[styles.emptyCopy, { color: colors.muted }]}>Use the add button to give this day a clear intention.</Text><Pressable onPress={openNewTask} style={({ pressed }) => [styles.emptyAction, { backgroundColor: `${colors.primary}18` }, pressed && styles.opacityPressed]}><Text style={[styles.emptyActionText, { color: colors.primary }]}>Schedule a task</Text></Pressable></View>}
        ListFooterComponent={backlog.length ? <View style={styles.backlog}><View style={styles.sectionHeading}><View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Unscheduled backlog</Text><Text style={[styles.sectionSubtitle, { color: colors.muted }]}>Tasks waiting for a home</Text></View><IconSymbol name="clock.fill" size={20} color={colors.muted} /></View>{backlog.map((task) => <View key={task.id} style={{ marginBottom: 10 }}><TaskCard task={task} projects={projects} compact onToggle={() => void toggleTask(task.id)} onPress={() => openTask(task)} /></View>)}</View> : null}
      />
      <TaskComposer visible={composerOpen} task={selectedTask} projects={projects} defaultDueDate={selectedDate} onClose={() => setComposerOpen(false)} onSave={(draft) => selectedTask ? updateTask(selectedTask.id, draft) : addTask(draft)} onDelete={deleteTask} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 14, paddingBottom: 18 },
  overline: { fontSize: 11, fontWeight: "900", letterSpacing: 1.15 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  title: { fontSize: 30, lineHeight: 37, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  addButton: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  weekStrip: { minHeight: 76, borderRadius: 20, borderWidth: 1, padding: 6, flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  dayButton: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 14, minHeight: 62 },
  weekday: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  dayNumber: { fontSize: 15, fontWeight: "900", marginTop: 2 },
  todayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },
  dayDotPlaceholder: { height: 4, marginTop: 4 },
  listContent: { paddingBottom: 100 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 11 },
  sectionTitle: { fontSize: 19, lineHeight: 24, fontWeight: "900", letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 12, lineHeight: 17, marginTop: 1, fontWeight: "600" },
  overdueBlock: { borderWidth: 1, borderRadius: 19, padding: 12, gap: 8, marginBottom: 17 },
  overdueHeading: { flexDirection: "row", gap: 7, alignItems: "center" },
  overdueTitle: { fontSize: 12, fontWeight: "900" },
  empty: { borderWidth: 1, borderRadius: 21, padding: 24, alignItems: "flex-start" },
  emptyTitle: { fontSize: 17, fontWeight: "900" },
  emptyCopy: { fontSize: 13, lineHeight: 19, marginTop: 5, maxWidth: 235 },
  emptyAction: { minHeight: 39, borderRadius: 12, justifyContent: "center", paddingHorizontal: 12, marginTop: 15 },
  emptyActionText: { fontSize: 12, fontWeight: "900" },
  backlog: { marginTop: 28 },
  opacityPressed: { opacity: 0.7 },
});
