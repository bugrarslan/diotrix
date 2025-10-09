import React from "react";
import { Text, View } from "react-native";

type BackgroundCirclesProps = {
  isDarkMode?: boolean;
};

const BackgroundCircles: React.FC<BackgroundCirclesProps> = ({ isDarkMode = false }) => {
  return (
    <View className="absolute inset-0 overflow-hidden">
      <Text
        className={`absolute -right-16 -top-16 text-[220px] font-extrabold leading-none opacity-70 ${
          isDarkMode ? "text-primary-600/15" : "text-primary-500/25"
        } rotate-12`}
      >
        ✦
      </Text>
      <Text
        className={`absolute bottom-24 -left-10 text-[260px] font-extrabold leading-none opacity-70 ${
          isDarkMode ? "text-primary-600/20" : "text-primary-900/15"
        } -rotate-6`}
      >
        ✦
      </Text>
    </View>
  );
};

export default BackgroundCircles;
