import { useSettingsContext } from "@/context/SettingsContext";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

const BackgroundStars: React.FC = () => {
  const { settings } = useSettingsContext();
  const isDarkMode = settings?.theme === "dark";

  const topStarClass = useMemo(
    () => (isDarkMode ? "text-primary-600/15" : "text-primary-500/25"),
    [isDarkMode]
  );

  const bottomStarClass = useMemo(
    () => (isDarkMode ? "text-primary-600/20" : "text-primary-900/15"),
    [isDarkMode]
  );

  return (
    <View className="absolute inset-0 overflow-hidden">
      <Text
        className={`absolute -right-16 -top-16 text-[220px] font-extrabold leading-none opacity-70 ${topStarClass}`}
      >
        ✦
      </Text>
      <Text
        className={`absolute bottom-24 -left-10 text-[260px] font-extrabold leading-none opacity-70 ${bottomStarClass}`}
      >
        ✦
      </Text>
    </View>
  );
};

export default BackgroundStars;
