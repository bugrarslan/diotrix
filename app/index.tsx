import { useSettingsContext } from "@/context/SettingsContext";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundStars from "@/components/ui/BackgroundStars";
import { Image } from "react-native";

export default function Index() {

  const { settings } = useSettingsContext();
  const selectedTheme = settings?.theme ?? "light";
  const isDarkTheme = selectedTheme === "dark";
  const backgroundColor = isDarkTheme ? 'bg-black' : 'bg-white';
  return (
    <SafeAreaView className={`items-center justify-center flex-1 ${backgroundColor}`}>
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
      <BackgroundStars />
      <Image
        source={require("@/assets/icons/splash-icon.png")}
        style={{ resizeMode: "contain", aspectRatio: 1 }}
        height={200}
      />
    </SafeAreaView>
  );
}
