import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProjectComposer, TaskCard, TaskComposer } from "@/components/task-ui";
import { useColors } from "@/hooks/use-colors";
import { useTasks } from "@/lib/task-context";
import { Project, Task } from "@/lib/tasks";

export default function ProjectsScreen() {
  const colors = useColors();
  const { tasks, projects, addProject, addTask, updateTask, toggleTask, deleteTask, deleteProject } = useTasks();
  const [projectComposerOpen, setProjectComposerOpen] = useState(false);
  const [taskComposerOpen, setTaskComposerOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const projectTasks = useMemo(
    () => selectedProject ? tasks.filter((task) => task.projectId === selectedProject.id && !task.completed) : [],
    [tasks, selectedProject],
  );

  function openNewTask() {
    setSelectedTask(null);
    setTaskComposerOpen(true);
  }

  function openTask(task: Task) {
    setSelectedTask(task);
    setTaskComposerOpen(true);
  }

  function confirmProjectDelete(project: Project) {
    Alert.alert("Delete project?", `Tasks in “${project.name}” will be kept but removed from this project.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { void deleteProject(project.id); setSelectedProjectId(null); } },
    ]);
  }

  const projectRail = (
    <FlatList
      horizontal
      data={projects}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.projectRail}
      renderItem={({ item }) => {
        const isSelected = item.id === selectedProject?.id;
        const total = tasks.filter((task) => task.projectId === item.id).length;
        const completed = tasks.filter((task) => task.projectId === item.id && task.completed).length;
        return (
          <Pressable
            onPress={() => setSelectedProjectId(item.id)}
            onLongPress={() => confirmProjectDelete(item)}
            style={({ pressed }) => [styles.projectCard, { backgroundColor: isSelected ? item.color : colors.surface, borderColor: isSelected ? item.color : colors.border }, pressed && styles.opacityPressed]}
          >
            <View style={[styles.projectIcon, { backgroundColor: isSelected ? "rgba(255,255,255,0.18)" : `${item.color}18` }]}><IconSymbol name="folder.fill" size={21} color={isSelected ? "#FFFFFF" : item.color} /></View>
            <Text numberOfLines={1} style={[styles.projectName, { color: isSelected ? "#FFFFFF" : colors.foreground }]}>{item.name}</Text>
            <Text style={[styles.projectMeta, { color: isSelected ? "rgba(255,255,255,0.8)" : colors.muted }]}>{total ? `${completed}/${total} done` : "Ready to plan"}</Text>
            <View style={[styles.projectTrack, { backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : colors.border }]}><View style={[styles.projectProgress, { width: `${total ? (completed / total) * 100 : 0}%`, backgroundColor: isSelected ? "#FFFFFF" : item.color }]} /></View>
          </Pressable>
        );
      }}
      ListEmptyComponent={(
        <Pressable onPress={() => setProjectComposerOpen(true)} style={({ pressed }) => [styles.firstProject, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.opacityPressed]}>
          <View style={[styles.firstProjectIcon, { backgroundColor: `${colors.primary}18` }]}><IconSymbol name="folder.fill" size={25} color={colors.primary} /></View>
          <Text style={[styles.firstProjectTitle, { color: colors.foreground }]}>Start with a project</Text>
          <Text style={[styles.firstProjectCopy, { color: colors.muted }]}>Group tasks by what matters: work, home, studies, or anything else.</Text>
        </Pressable>
      )}
    />
  );

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View style={styles.header}>
        <View><Text style={[styles.overline, { color: colors.primary }]}>ORGANIZE YOUR WORK</Text><Text style={[styles.title, { color: colors.foreground }]}>Projects</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{projects.length ? `${projects.length} active project${projects.length === 1 ? "" : "s"}` : "Create a home for related tasks"}</Text></View>
        <Pressable onPress={() => setProjectComposerOpen(true)} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary }, pressed && styles.opacityPressed]}><IconSymbol name="plus" size={21} color="#FFFFFF" /></Pressable>
      </View>
      <FlatList
        data={selectedProject ? projectTasks : []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={(
          <>
            {projectRail}
            {selectedProject ? <View style={styles.sectionHeading}><View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{selectedProject.name}</Text><Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{projectTasks.length} open task{projectTasks.length === 1 ? "" : "s"}</Text></View><Pressable onPress={openNewTask} style={({ pressed }) => [styles.projectAdd, { backgroundColor: `${selectedProject.color}16` }, pressed && styles.opacityPressed]}><IconSymbol name="plus" size={18} color={selectedProject.color} /></Pressable></View> : null}
          </>
        )}
        renderItem={({ item }) => <View style={{ marginBottom: 10 }}><TaskCard task={item} projects={projects} onToggle={() => void toggleTask(item.id)} onPress={() => openTask(item)} /></View>}
        ListEmptyComponent={selectedProject ? <View style={[styles.emptyTask, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.emptyTaskTitle, { color: colors.foreground }]}>A clean slate</Text><Text style={[styles.emptyTaskCopy, { color: colors.muted }]}>Add the first task for this project and make a small start.</Text><Pressable onPress={openNewTask} style={({ pressed }) => [styles.emptyTaskAction, { backgroundColor: selectedProject.color }, pressed && styles.opacityPressed]}><Text style={styles.emptyTaskActionText}>Add project task</Text></Pressable></View> : null}
      />
      <ProjectComposer visible={projectComposerOpen} onClose={() => setProjectComposerOpen(false)} onSave={addProject} />
      <TaskComposer visible={taskComposerOpen} task={selectedTask} projects={projects} onClose={() => setTaskComposerOpen(false)} onSave={(draft) => selectedTask ? updateTask(selectedTask.id, draft) : addTask({ ...draft, projectId: draft.projectId ?? selectedProject?.id })} onDelete={deleteTask} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 14, paddingBottom: 19, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  overline: { fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  title: { fontSize: 30, lineHeight: 37, fontWeight: "900", letterSpacing: -0.8, marginTop: 3 },
  subtitle: { fontSize: 13, lineHeight: 18, fontWeight: "600", marginTop: 1 },
  addButton: { height: 43, width: 43, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  listContent: { paddingBottom: 100 },
  projectRail: { gap: 11, paddingBottom: 25, paddingRight: 16 },
  projectCard: { width: 166, minHeight: 162, borderRadius: 21, borderWidth: 1, padding: 14, justifyContent: "space-between" },
  projectIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  projectName: { fontSize: 16, lineHeight: 20, fontWeight: "900", marginTop: 17 },
  projectMeta: { fontSize: 11, lineHeight: 15, fontWeight: "700", marginTop: 2 },
  projectTrack: { height: 5, borderRadius: 3, overflow: "hidden", marginTop: 12 },
  projectProgress: { height: "100%", borderRadius: 3 },
  firstProject: { width: 270, minHeight: 162, borderWidth: 1, borderRadius: 21, padding: 16 },
  firstProjectIcon: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  firstProjectTitle: { fontSize: 16, fontWeight: "900", marginTop: 12 },
  firstProjectCopy: { fontSize: 12, lineHeight: 17, marginTop: 4, maxWidth: 215 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 11 },
  sectionTitle: { fontSize: 19, fontWeight: "900", letterSpacing: -0.35 },
  sectionSubtitle: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  projectAdd: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  emptyTask: { borderWidth: 1, borderRadius: 20, padding: 23 },
  emptyTaskTitle: { fontSize: 17, fontWeight: "900" },
  emptyTaskCopy: { fontSize: 13, lineHeight: 19, marginTop: 4, maxWidth: 235 },
  emptyTaskAction: { minHeight: 41, borderRadius: 13, paddingHorizontal: 13, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", marginTop: 15 },
  emptyTaskActionText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  opacityPressed: { opacity: 0.7 },
});
