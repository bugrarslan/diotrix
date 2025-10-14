import { useSettingsContext } from "@/context/SettingsContext";
import { getThemePalette } from "@/utils/themePalette";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { Text, View } from "react-native";

export type FeatureHighlightCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

export function FeatureHighlightCard({ icon, title, description }: FeatureHighlightCardProps) {
  const { settings } = useSettingsContext();
  const themePalette = useMemo(() => getThemePalette(settings?.theme ?? "light"), [settings?.theme]);

  return (
    <View className={`flex-row items-start p-5 border rounded-3xl ${themePalette.border} ${themePalette.surface}`}>
      <View className="p-3 mr-4 rounded-2xl bg-primary-500/20">
        <Ionicons name={icon} size={20} color="#c4b5fd" />
      </View>
      <View className="flex-1">
        <Text className={`text-lg font-semibold ${themePalette.textPrimary}`}>{title}</Text>
        <Text className={`mt-1 text-sm leading-5 ${themePalette.textSecondary}`}>{description}</Text>
      </View>
    </View>
  );
}
