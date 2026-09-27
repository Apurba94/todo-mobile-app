import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { addDaysKey, dateKey, formatTaskDate } from "@/lib/task-date";
import { Priority, Project, Task, TaskDraft } from "@/lib/tasks";
import { useColors } from "@/hooks/use-colors";

const priorityLabels: Record<Priority, string> = { low: "Low", medium: "Medium", high: "High" };
const priorityColors: Record<Priority, string> = { low: "#6E8F78", medium: "#C88A38", high: "#F26B5E" };
const projectColors = ["#5358A6", "#F26B5E", "#6E8F78", "#C88A38", "#A06A9C"];
type DueChoice = "none" | "today" | "tomorrow" | "week";

function feedback(kind: "tap" | "success") {
  if (Platform.OS === "web") return;
  if (kind === "success") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

function dueChoiceFromDate(dueDate?: string): DueChoice {
  if (!dueDate) return "none";
  if (dueDate === dateKey()) return "today";
  if (dueDate === addDaysKey(1)) return "tomorrow";
  return "week";
}

function dateFromChoice(choice: DueChoice) {
  if (choice === "today") return dateKey();
  if (choice === "tomorrow") return addDaysKey(1);
  if (choice === "week") return addDaysKey(7);
  return undefined;
}

export function TaskCard({
  task,
  projects,
  onToggle,
  onPress,
  compact = false,
}: {
  task: Task;
  projects: Project[];
  onToggle: () => void;
  onPress: () => void;
  compact?: boolean;
}) {
  const colors = useColors();
  const project = projects.find((item) => item.id === task.projectId);
  const dueIsOverdue = Boolean(task.dueDate && task.dueDate < dateKey() && !task.completed);
  const priorityColor = priorityColors[task.priority];

  return (
    <View style={[styles.taskCard, compact && styles.taskCardCompact, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={task.completed ? `Restore ${task.title}` : `Complete ${task.title}`}
        onPress={() => { feedback(task.completed ? "tap" : "success"); onToggle(); }}
        style={({ pressed }) => [styles.check, { borderColor: task.completed ? colors.success : priorityColor, backgroundColor: task.completed ? colors.success : "transparent" }, pressed && styles.pressed]}
      >
        {task.completed && <IconSymbol name="checkmark" size={15} color="#FFFFFF" />}
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${task.title}`} onPress={onPress} style={({ pressed }) => [styles.taskBody, pressed && styles.opacityPressed]}>
        <Text numberOfLines={compact ? 1 : 2} style={[styles.taskTitle, { color: colors.foreground }, task.completed && styles.completedText]}>{task.title}</Text>
        {!compact && task.notes ? <Text numberOfLines={1} style={[styles.taskNotes, { color: colors.muted }]}>{task.notes}</Text> : null}
        <View style={styles.metadataRow}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={[styles.metaText, { color: colors.muted }]}>{priorityLabels[task.priority]}</Text>
          {project ? <><View style={styles.metaDivider} /><View style={[styles.projectDot, { backgroundColor: project.color }]} /><Text style={[styles.metaText, { color: colors.muted }]}>{project.name}</Text></> : null}
          {task.dueDate ? <><View style={styles.metaDivider} /><IconSymbol name="calendar" size={13} color={dueIsOverdue ? colors.primary : colors.muted} /><Text style={[styles.metaText, { color: dueIsOverdue ? colors.primary : colors.muted, fontWeight: dueIsOverdue ? "800" : "600" }]}>{dueIsOverdue ? "Overdue" : formatTaskDate(task.dueDate)}</Text></> : null}
          {task.estimateMinutes ? <><View style={styles.metaDivider} /><IconSymbol name="clock.fill" size={13} color={colors.muted} /><Text style={[styles.metaText, { color: colors.muted }]}>{task.estimateMinutes}m</Text></> : null}
        </View>
      </Pressable>
      <View style={[styles.priorityRail, { backgroundColor: priorityColor }]} />
    </View>
  );
}

export function TaskComposer({
  visible,
  task,
  projects,
  defaultDueDate,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  task?: Task | null;
  projects: Project[];
  defaultDueDate?: string;
  onClose: () => void;
  onSave: (draft: TaskDraft) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
}) {
  const colors = useColors();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [projectId, setProjectId] = useState<string | undefined>();
  const [dueChoice, setDueChoice] = useState<DueChoice>("today");
  const [estimate, setEstimate] = useState("30");
  const [tag, setTag] = useState("");

  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
    setPriority(task?.priority ?? "medium");
    setProjectId(task?.projectId);
    setDueChoice(dueChoiceFromDate(task?.dueDate ?? defaultDueDate));
    setEstimate(task?.estimateMinutes ? `${task.estimateMinutes}` : "30");
    setTag(task?.tag ?? "");
  }, [task, visible, defaultDueDate]);

  async function save() {
    if (!title.trim()) return;
    feedback("tap");
    await onSave({
      title,
      notes,
      priority,
      projectId,
      dueDate: dateFromChoice(dueChoice),
      estimateMinutes: Number(estimate) > 0 ? Math.min(Number(estimate), 480) : undefined,
      tag,
    });
    onClose();
  }

  function confirmDelete() {
    if (!task || !onDelete) return;
    Alert.alert("Delete task?", `“${task.title}” will be removed permanently.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { void onDelete(task.id); onClose(); } },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.background }]}> 
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View><Text style={[styles.sheetOverline, { color: colors.primary }]}>{task ? "TASK DETAILS" : "QUICK CAPTURE"}</Text><Text style={[styles.sheetTitle, { color: colors.foreground }]}>{task ? "Edit task" : "Add a task"}</Text></View>
            <Pressable accessibilityLabel="Close task editor" onPress={onClose} style={({ pressed }) => [styles.closeButton, { backgroundColor: colors.surface }, pressed && styles.opacityPressed]}><IconSymbol name="xmark" size={21} color={colors.muted} /></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
            <TextInput autoFocus value={title} onChangeText={setTitle} placeholder="What needs doing?" placeholderTextColor={colors.muted} style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]} returnKeyType="next" />
            <TextInput value={notes} onChangeText={setNotes} placeholder="Add notes, links, or a little context" placeholderTextColor={colors.muted} style={[styles.notesInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} multiline textAlignVertical="top" />
            <FieldLabel label="Priority" />
            <View style={styles.optionRow}>{(Object.keys(priorityLabels) as Priority[]).map((value) => <Pressable key={value} onPress={() => setPriority(value)} style={({ pressed }) => [styles.choice, { borderColor: priority === value ? priorityColors[value] : colors.border, backgroundColor: priority === value ? `${priorityColors[value]}18` : colors.surface }, pressed && styles.opacityPressed]}><View style={[styles.choiceDot, { backgroundColor: priorityColors[value] }]} /><Text style={{ color: priority === value ? priorityColors[value] : colors.muted, fontWeight: "800" }}>{priorityLabels[value]}</Text></Pressable>)}</View>
            <FieldLabel label="Schedule" />
            <View style={styles.optionRow}>{(["today", "tomorrow", "week", "none"] as DueChoice[]).map((value) => <Pressable key={value} onPress={() => setDueChoice(value)} style={({ pressed }) => [styles.choice, { borderColor: dueChoice === value ? colors.primary : colors.border, backgroundColor: dueChoice === value ? `${colors.primary}14` : colors.surface }, pressed && styles.opacityPressed]}><Text style={{ color: dueChoice === value ? colors.primary : colors.muted, fontWeight: "800" }}>{value === "week" ? "Next week" : value === "none" ? "Later" : value === "today" ? "Today" : "Tomorrow"}</Text></Pressable>)}</View>
            <FieldLabel label="Project" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChoices}>{[{ id: undefined, name: "No project", color: colors.border }, ...projects].map((project) => <Pressable key={project.id ?? "none"} onPress={() => setProjectId(project.id)} style={({ pressed }) => [styles.projectChoice, { borderColor: projectId === project.id ? project.color : colors.border, backgroundColor: projectId === project.id ? `${project.color}15` : colors.surface }, pressed && styles.opacityPressed]}><View style={[styles.projectChoiceDot, { backgroundColor: project.color }]} /><Text style={{ color: projectId === project.id ? project.color : colors.muted, fontWeight: "800" }}>{project.name}</Text></Pressable>)}</ScrollView>
            <View style={styles.detailRow}>
              <View style={styles.detailField}><FieldLabel label="Estimate" /><View style={[styles.iconInput, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name="clock.fill" size={16} color={colors.muted} /><TextInput value={estimate} onChangeText={setEstimate} keyboardType="number-pad" maxLength={3} style={[styles.inlineInput, { color: colors.foreground }]} /><Text style={[styles.suffix, { color: colors.muted }]}>min</Text></View></View>
              <View style={styles.detailField}><FieldLabel label="Tag" /><View style={[styles.iconInput, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name="tag.fill" size={16} color={colors.muted} /><TextInput value={tag} onChangeText={setTag} placeholder="Work" placeholderTextColor={colors.muted} style={[styles.inlineInput, { color: colors.foreground }]} /></View></View>
            </View>
            <Pressable disabled={!title.trim()} onPress={() => void save()} style={({ pressed }) => [styles.saveButton, { backgroundColor: title.trim() ? colors.primary : colors.border }, pressed && styles.pressed]}><Text style={styles.saveButtonText}>{task ? "Save changes" : "Add task"}</Text><IconSymbol name="arrow.right" size={18} color="#FFFFFF" /></Pressable>
            {task && onDelete ? <Pressable onPress={confirmDelete} style={({ pressed }) => [styles.deleteAction, pressed && styles.opacityPressed]}><IconSymbol name="trash" size={18} color={colors.error} /><Text style={[styles.deleteActionText, { color: colors.error }]}>Delete task</Text></Pressable> : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ label }: { label: string }) {
  const colors = useColors();
  return <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label.toUpperCase()}</Text>;
}

export function ProjectComposer({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (draft: { name: string; color: string }) => Promise<void>;
}) {
  const colors = useColors();
  const [name, setName] = useState("");
  const [color, setColor] = useState(projectColors[0]);

  useEffect(() => {
    if (visible) { setName(""); setColor(projectColors[0]); }
  }, [visible]);

  async function saveProject() {
    if (!name.trim()) return;
    feedback("success");
    await onSave({ name, color });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.projectModalBackdrop} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.projectModal, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.projectModalHeading}><View><Text style={[styles.sheetOverline, { color: colors.primary }]}>PROJECTS</Text><Text style={[styles.projectModalTitle, { color: colors.foreground }]}>New project</Text></View><Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, { backgroundColor: colors.surface }, pressed && styles.opacityPressed]}><IconSymbol name="xmark" size={20} color={colors.muted} /></Pressable></View>
          <TextInput autoFocus value={name} onChangeText={setName} placeholder="e.g. Home refresh" placeholderTextColor={colors.muted} style={[styles.projectNameInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.surface }]} returnKeyType="done" onSubmitEditing={() => void saveProject()} />
          <FieldLabel label="Color" /><View style={styles.colorRow}>{projectColors.map((option) => <Pressable key={option} accessibilityLabel="Choose project color" onPress={() => setColor(option)} style={({ pressed }) => [styles.colorChoice, { backgroundColor: option, borderColor: colors.background }, color === option && styles.selectedColorChoice, pressed && styles.opacityPressed]}>{color === option ? <IconSymbol name="checkmark" size={17} color="#FFFFFF" /> : null}</Pressable>)}</View>
          <Pressable disabled={!name.trim()} onPress={() => void saveProject()} style={({ pressed }) => [styles.saveButton, { backgroundColor: name.trim() ? colors.primary : colors.border }, pressed && styles.pressed]}><Text style={styles.saveButtonText}>Create project</Text><IconSymbol name="arrow.right" size={18} color="#FFFFFF" /></Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  taskCard: { minHeight: 86, borderRadius: 20, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "flex-start", overflow: "hidden" },
  taskCardCompact: { minHeight: 68, paddingVertical: 11 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 2, marginRight: 12 },
  taskBody: { flex: 1, paddingRight: 9 },
  taskTitle: { fontSize: 16, lineHeight: 21, fontWeight: "800", letterSpacing: -0.15 },
  completedText: { textDecorationLine: "line-through", opacity: 0.65 },
  taskNotes: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  metadataRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 5, marginTop: 9 },
  priorityDot: { height: 7, width: 7, borderRadius: 4 },
  projectDot: { height: 7, width: 7, borderRadius: 4 },
  metaText: { fontSize: 11, fontWeight: "600" },
  metaDivider: { height: 3, width: 3, borderRadius: 2, backgroundColor: "#C8C5BE", marginHorizontal: 1 },
  priorityRail: { position: "absolute", right: 0, top: 18, width: 3, height: 38, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.975 }] },
  opacityPressed: { opacity: 0.68 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(24, 29, 27, 0.38)" },
  dismissArea: { flex: 1 },
  sheet: { maxHeight: "89%", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#C8C5BE", alignSelf: "center", marginBottom: 17 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  sheetOverline: { fontSize: 10, fontWeight: "900", letterSpacing: 1.25, marginBottom: 3 },
  sheetTitle: { fontSize: 25, lineHeight: 31, fontWeight: "900", letterSpacing: -0.6 },
  closeButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  sheetScroll: { paddingBottom: 10 },
  titleInput: { fontSize: 20, lineHeight: 26, fontWeight: "800", paddingVertical: 12, borderBottomWidth: 1 },
  notesInput: { minHeight: 76, borderRadius: 15, padding: 13, marginTop: 13, fontSize: 14, lineHeight: 19, borderWidth: 1 },
  fieldLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 18, marginBottom: 8 },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { minHeight: 40, borderWidth: 1, borderRadius: 13, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  choiceDot: { width: 7, height: 7, borderRadius: 4 },
  horizontalChoices: { gap: 8, paddingRight: 20 },
  projectChoice: { minHeight: 40, borderWidth: 1, borderRadius: 13, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  projectChoiceDot: { width: 8, height: 8, borderRadius: 4 },
  detailRow: { flexDirection: "row", gap: 10 },
  detailField: { flex: 1 },
  iconInput: { height: 46, borderWidth: 1, borderRadius: 14, paddingHorizontal: 11, alignItems: "center", flexDirection: "row", gap: 8 },
  inlineInput: { flex: 1, fontSize: 14, fontWeight: "700", paddingVertical: 6 },
  suffix: { fontSize: 12, fontWeight: "700" },
  saveButton: { marginTop: 24, minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  deleteAction: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 8 },
  deleteActionText: { fontSize: 14, fontWeight: "800" },
  projectModalBackdrop: { flex: 1, backgroundColor: "rgba(24,29,27,0.38)", alignItems: "center", justifyContent: "center", padding: 22 },
  projectModal: { width: "100%", maxWidth: 430, borderRadius: 25, borderWidth: 1, padding: 20 },
  projectModalHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  projectModalTitle: { fontSize: 23, lineHeight: 29, fontWeight: "900", letterSpacing: -0.45 },
  projectNameInput: { borderWidth: 1, height: 52, borderRadius: 15, paddingHorizontal: 14, marginTop: 18, fontSize: 16, fontWeight: "700" },
  colorRow: { flexDirection: "row", gap: 12 },
  colorChoice: { width: 34, height: 34, borderRadius: 17, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  selectedColorChoice: { transform: [{ scale: 1.12 }] },
});
