import "@/global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboardingScreen" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="image/[id]" />
      <Stack.Screen
        name="createImageModal"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="promotionModal"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
