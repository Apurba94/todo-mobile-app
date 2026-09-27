import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "checkmark.circle.fill": "check-circle",
  "checkmark": "check",
  "plus": "add",
  "xmark": "close",
  "trash": "delete-outline",
  "archivebox.fill": "inventory-2",
  "gearshape.fill": "settings",
  "arrow.uturn.backward": "undo",
  "sparkles": "auto-awesome",
  "calendar": "calendar-today",
  "clock.fill": "schedule",
  "tag.fill": "sell",
  "arrow.right": "arrow-forward",
  "folder.fill": "folder",
  "chart.bar.fill": "bar-chart",
  "chevron.left": "chevron-left",
} as IconMapping;

export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: SymbolWeight }) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
