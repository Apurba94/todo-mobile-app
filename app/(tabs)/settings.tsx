import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useTasks } from "@/lib/task-context";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks, projects, clearCompleted, resetAll } = useTasks();
  const completedCount = tasks.filter((task) => task.completed).length;

  function confirmClearCompleted() {
    if (!completedCount) return;
    Alert.alert("Clear completed history?", `${completedCount} completed task${completedCount === 1 ? "" : "s"} will be removed permanently from this device.`, [{ text: "Cancel", style: "cancel" }, { text: "Clear history", style: "destructive", onPress: () => void clearCompleted() }]);
  }

  function confirmReset() {
    if (!tasks.length && !projects.length) return;
    Alert.alert("Reset Taskly?", "All tasks and projects stored on this device will be removed. This cannot be undone.", [{ text: "Cancel", style: "cancel" }, { text: "Reset everything", style: "destructive", onPress: () => void resetAll() }]);
  }

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.opacityPressed]}><IconSymbol name="chevron.left" size={22} color={colors.foreground} /></Pressable><View style={styles.headerText}><Text style={[styles.overline, { color: colors.primary }]}>LOCAL PREFERENCES</Text><Text style={[styles.title, { color: colors.foreground }]}>Settings</Text></View></View>
        <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.heroIcon, { backgroundColor: `${colors.primary}16` }]}><IconSymbol name="sparkles" size={25} color={colors.primary} /></View><View style={styles.heroCopy}><Text style={[styles.heroTitle, { color: colors.foreground }]}>Your plan stays on device.</Text><Text style={[styles.heroText, { color: colors.muted }]}>Taskly works offline and keeps your tasks and projects in local storage unless you choose to clear them.</Text></View></View>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>WORKSPACE</Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}><SettingRow icon="checkmark.circle.fill" iconColor={colors.success} title="Active tasks" value={`${tasks.filter((task) => !task.completed).length}`} /><View style={[styles.rule, { backgroundColor: colors.border }]} /><SettingRow icon="folder.fill" iconColor="#5358A6" title="Projects" value={`${projects.length}`} /><View style={[styles.rule, { backgroundColor: colors.border }]} /><SettingRow icon="archivebox.fill" iconColor={colors.primary} title="Completed history" value={`${completedCount}`} /></View>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>DATA MANAGEMENT</Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}><Pressable disabled={!completedCount} onPress={confirmClearCompleted} style={({ pressed }) => [styles.actionRow, !completedCount && styles.disabled, pressed && styles.opacityPressed]}><View style={[styles.actionIcon, { backgroundColor: `${colors.primary}14` }]}><IconSymbol name="archivebox.fill" size={19} color={colors.primary} /></View><View style={styles.actionCopy}><Text style={[styles.actionTitle, { color: colors.foreground }]}>Clear completed history</Text><Text style={[styles.actionText, { color: colors.muted }]}>Remove finished tasks from this device</Text></View><IconSymbol name="chevron.right" size={18} color={colors.muted} /></Pressable><View style={[styles.rule, { backgroundColor: colors.border }]} /><Pressable disabled={!tasks.length && !projects.length} onPress={confirmReset} style={({ pressed }) => [styles.actionRow, !tasks.length && !projects.length && styles.disabled, pressed && styles.opacityPressed]}><View style={[styles.actionIcon, { backgroundColor: `${colors.error}14` }]}><IconSymbol name="trash" size={19} color={colors.error} /></View><View style={styles.actionCopy}><Text style={[styles.actionTitle, { color: colors.error }]}>Reset all local data</Text><Text style={[styles.actionText, { color: colors.muted }]}>Remove every task and project</Text></View><IconSymbol name="chevron.right" size={18} color={colors.muted} /></Pressable></View>
        <View style={styles.footer}><Text style={[styles.footerTitle, { color: colors.foreground }]}>Taskly</Text><Text style={[styles.footerText, { color: colors.muted }]}>A focused, offline-first planning companion.</Text><Text style={[styles.footerVersion, { color: colors.muted }]}>Version 1.0.0</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingRow({ icon, iconColor, title, value }: { icon: "checkmark.circle.fill" | "folder.fill" | "archivebox.fill"; iconColor: string; title: string; value: string }) {
  const colors = useColors();
  return <View style={styles.settingRow}><View style={[styles.actionIcon, { backgroundColor: `${iconColor}14` }]}><IconSymbol name={icon} size={19} color={iconColor} /></View><Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.settingValue, { color: colors.muted }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 100 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  back: { height: 42, width: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerText: { marginLeft: 12 },
  overline: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  title: { fontSize: 27, lineHeight: 32, fontWeight: "900", letterSpacing: -0.6, marginTop: 2 },
  hero: { borderWidth: 1, borderRadius: 22, padding: 16, flexDirection: "row", alignItems: "flex-start" },
  heroIcon: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 12 },
  heroCopy: { flex: 1 },
  heroTitle: { fontSize: 16, lineHeight: 21, fontWeight: "900" },
  heroText: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.05, marginTop: 25, marginBottom: 8 },
  group: { borderRadius: 19, borderWidth: 1, overflow: "hidden" },
  settingRow: { minHeight: 62, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  actionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 11 },
  settingTitle: { flex: 1, fontSize: 14, fontWeight: "800" },
  settingValue: { fontSize: 13, fontWeight: "800" },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 61 },
  actionRow: { minHeight: 73, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  actionCopy: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: "900" },
  actionText: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  disabled: { opacity: 0.42 },
  footer: { alignItems: "center", paddingTop: 30 },
  footerTitle: { fontSize: 15, fontWeight: "900" },
  footerText: { fontSize: 12, fontWeight: "600", marginTop: 3 },
  footerVersion: { fontSize: 11, fontWeight: "700", marginTop: 8 },
  opacityPressed: { opacity: 0.7 },
});
