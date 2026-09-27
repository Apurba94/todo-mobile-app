import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TaskCard, TaskComposer } from "@/components/task-ui";
import { useColors } from "@/hooks/use-colors";
import { addDaysKey, dateKey, formatDayNumber, formatWeekday } from "@/lib/task-date";
import { useTasks } from "@/lib/task-context";
import { Task } from "@/lib/tasks";

export default function InsightsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks, projects, updateTask, toggleTask, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => addDaysKey(index - 6)), []);
  const completedThisWeek = tasks.filter((task) => task.completedAt && task.completedAt.slice(0, 10) >= week[0]);
  const createdThisWeek = tasks.filter((task) => task.createdAt.slice(0, 10) >= week[0]);
  const completionRate = createdThisWeek.length ? Math.round((completedThisWeek.length / createdThisWeek.length) * 100) : 0;
  const focusMinutes = completedThisWeek.reduce((total, task) => total + (task.estimateMinutes ?? 0), 0);
  const maxDaily = Math.max(1, ...week.map((day) => completedThisWeek.filter((task) => task.completedAt?.slice(0, 10) === day).length));
  const recent = [...completedThisWeek].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")).slice(0, 4);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}><View><Text style={[styles.overline, { color: colors.primary }]}>WEEKLY REVIEW</Text><Text style={[styles.title, { color: colors.foreground }]}>Insights</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Small progress becomes momentum.</Text></View><Pressable onPress={() => router.push("/settings")} style={({ pressed }) => [styles.settingsButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.opacityPressed]}><IconSymbol name="gearshape.fill" size={20} color={colors.muted} /></Pressable></View>
        <View style={styles.metricsRow}><MetricCard label="Completed" value={`${completedThisWeek.length}`} caption="this week" color={colors.success} icon="checkmark" /><MetricCard label="Focus time" value={focusMinutes ? `${Math.round(focusMinutes / 60 * 10) / 10}h` : "—"} caption="estimated" color="#5358A6" icon="clock.fill" /></View>
        <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.chartHeader}><View><Text style={[styles.chartTitle, { color: colors.foreground }]}>Completion rhythm</Text><Text style={[styles.chartSubtitle, { color: colors.muted }]}>Last 7 days</Text></View><View style={[styles.rateBadge, { backgroundColor: `${colors.primary}16` }]}><Text style={[styles.rateValue, { color: colors.primary }]}>{completionRate}%</Text><Text style={[styles.rateLabel, { color: colors.primary }]}>rate</Text></View></View><View style={styles.bars}>{week.map((day) => { const count = completedThisWeek.filter((task) => task.completedAt?.slice(0, 10) === day).length; const isToday = day === dateKey(); return <View key={day} style={styles.barColumn}><View style={styles.barArea}>{count ? <View style={[styles.bar, { height: `${Math.max(16, (count / maxDaily) * 100)}%`, backgroundColor: isToday ? colors.primary : `${colors.primary}75` }]} /> : <View style={[styles.zeroBar, { backgroundColor: colors.border }]} />}</View><Text style={[styles.barWeekday, { color: isToday ? colors.primary : colors.muted }]}>{formatWeekday(day).slice(0, 1)}</Text><Text style={[styles.barDay, { color: colors.muted }]}>{formatDayNumber(day)}</Text></View>; })}</View></View>
        <View style={styles.sectionHeader}><View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recently completed</Text><Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{recent.length ? "Tap a task to update its details" : "Your wins will appear here"}</Text></View><Pressable onPress={() => router.push("/completed")} style={({ pressed }) => [styles.historyButton, { backgroundColor: `${colors.primary}14` }, pressed && styles.opacityPressed]}><Text style={[styles.historyText, { color: colors.primary }]}>History</Text><IconSymbol name="chevron.right" size={16} color={colors.primary} /></Pressable></View>
        {recent.length ? recent.map((task) => <View key={task.id} style={{ marginBottom: 10 }}><TaskCard task={task} projects={projects} compact onToggle={() => void toggleTask(task.id)} onPress={() => setSelectedTask(task)} /></View>) : <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.emptyIcon, { backgroundColor: `${colors.success}18` }]}><IconSymbol name="sparkles" size={25} color={colors.success} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your review starts with one done task.</Text><Text style={[styles.emptyCopy, { color: colors.muted }]}>Complete something small today and come back to see your rhythm take shape.</Text></View>}
      </ScrollView>
      <TaskComposer visible={Boolean(selectedTask)} task={selectedTask} projects={projects} onClose={() => setSelectedTask(null)} onSave={(draft) => selectedTask ? updateTask(selectedTask.id, draft) : Promise.resolve()} onDelete={deleteTask} />
    </ScreenContainer>
  );
}

function MetricCard({ label, value, caption, color, icon }: { label: string; value: string; caption: string; color: string; icon: "checkmark" | "clock.fill" }) {
  const colors = useColors();
  return <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}><IconSymbol name={icon} size={18} color={color} /></View><Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text><Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.metricCaption, { color: colors.muted }]}>{caption}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 105 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  overline: { fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  title: { fontSize: 30, lineHeight: 37, fontWeight: "900", letterSpacing: -0.8, marginTop: 3 },
  subtitle: { fontSize: 13, lineHeight: 18, fontWeight: "600", marginTop: 1 },
  settingsButton: { height: 42, width: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  metricsRow: { flexDirection: "row", gap: 10 },
  metricCard: { flex: 1, minHeight: 145, borderWidth: 1, borderRadius: 21, padding: 14 },
  metricIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  metricLabel: { fontSize: 11, fontWeight: "800", marginTop: 15 },
  metricValue: { fontSize: 25, lineHeight: 29, fontWeight: "900", letterSpacing: -0.7, marginTop: 2 },
  metricCaption: { fontSize: 11, fontWeight: "600", marginTop: 1 },
  chartCard: { borderWidth: 1, borderRadius: 22, padding: 16, marginTop: 12 },
  chartHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chartTitle: { fontSize: 17, fontWeight: "900", letterSpacing: -0.2 },
  chartSubtitle: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  rateBadge: { alignItems: "center", borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6 },
  rateValue: { fontSize: 13, fontWeight: "900" },
  rateLabel: { fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
  bars: { height: 145, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 17 },
  barColumn: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end" },
  barArea: { height: 96, justifyContent: "flex-end", alignItems: "center", width: "100%" },
  bar: { width: 13, borderRadius: 7 },
  zeroBar: { width: 13, height: 4, borderRadius: 2 },
  barWeekday: { fontSize: 10, fontWeight: "900", marginTop: 8 },
  barDay: { fontSize: 9, fontWeight: "600", marginTop: 1 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 27, marginBottom: 11 },
  sectionTitle: { fontSize: 19, lineHeight: 24, fontWeight: "900", letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 1 },
  historyButton: { minHeight: 34, borderRadius: 11, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 2 },
  historyText: { fontSize: 11, fontWeight: "900" },
  empty: { borderWidth: 1, borderRadius: 20, padding: 20, alignItems: "flex-start" },
  emptyIcon: { height: 44, width: 44, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 16, lineHeight: 21, fontWeight: "900", marginTop: 13, maxWidth: 260 },
  emptyCopy: { fontSize: 12, lineHeight: 18, marginTop: 4, maxWidth: 270 },
  opacityPressed: { opacity: 0.7 },
});
