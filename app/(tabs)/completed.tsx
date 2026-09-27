import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TaskCard, TaskComposer } from "@/components/task-ui";
import { useColors } from "@/hooks/use-colors";
import { useTasks } from "@/lib/task-context";
import { Task } from "@/lib/tasks";

export default function CompletedScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks, projects, updateTask, toggleTask, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const completedTasks = useMemo(() => tasks.filter((task) => task.completed).sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")), [tasks]);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.opacityPressed]}><IconSymbol name="chevron.left" size={22} color={colors.foreground} /></Pressable>
        <View style={styles.headerText}><Text style={[styles.overline, { color: colors.primary }]}>TASK HISTORY</Text><Text style={[styles.title, { color: colors.foreground }]}>Completed</Text></View>
        <View style={[styles.count, { backgroundColor: `${colors.success}16` }]}><Text style={[styles.countText, { color: colors.success }]}>{completedTasks.length}</Text></View>
      </View>
      <FlatList data={completedTasks} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={completedTasks.length ? styles.listContent : styles.emptyContent} renderItem={({ item }) => <View style={{ marginBottom: 10 }}><TaskCard task={item} projects={projects} onToggle={() => void toggleTask(item.id)} onPress={() => setSelectedTask(item)} /></View>} ListEmptyComponent={<View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.emptyIcon, { backgroundColor: `${colors.success}18` }]}><IconSymbol name="checkmark" size={24} color={colors.success} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing completed yet.</Text><Text style={[styles.emptyCopy, { color: colors.muted }]}>Completed tasks stay here so your progress remains visible.</Text></View>} />
      <TaskComposer visible={Boolean(selectedTask)} task={selectedTask} projects={projects} onClose={() => setSelectedTask(null)} onSave={(draft) => selectedTask ? updateTask(selectedTask.id, draft) : Promise.resolve()} onDelete={deleteTask} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 14, paddingBottom: 20, flexDirection: "row", alignItems: "center" },
  back: { height: 42, width: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerText: { marginLeft: 12, flex: 1 },
  overline: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  title: { fontSize: 27, lineHeight: 32, fontWeight: "900", letterSpacing: -0.6, marginTop: 2 },
  count: { minWidth: 37, height: 32, borderRadius: 11, paddingHorizontal: 9, alignItems: "center", justifyContent: "center" },
  countText: { fontSize: 13, fontWeight: "900" },
  listContent: { paddingBottom: 95 },
  emptyContent: { flexGrow: 1, justifyContent: "center", paddingBottom: 100 },
  empty: { borderWidth: 1, borderRadius: 21, padding: 24, alignItems: "center" },
  emptyIcon: { height: 54, width: 54, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900", marginTop: 14 },
  emptyCopy: { fontSize: 13, lineHeight: 19, marginTop: 5, maxWidth: 250, textAlign: "center" },
  opacityPressed: { opacity: 0.7 },
});
