import "@/global.css";

import {
  SettingsProvider,
  useSettingsContext,
} from "@/context/SettingsContext";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";

function RootNavigator() {
  const router = useRouter();
  const { loading, shouldShowOnboarding, updateSettings } =
    useSettingsContext();
  const previousTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (Platform.OS === "ios") {
      if (!process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY) {
        console.log(
          "RevenueCat Apple API Key is not set in environment variables."
        );
        return;
      }

      try {
        Purchases.configure({
          apiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY,
        });
      } catch (error) {
        console.error("Failed to configure Purchases:", error);
      }
    }

    getCustomerInfo();

    const targetRoute = shouldShowOnboarding ? "/onboardingScreen" : "/home";

    if (previousTargetRef.current === targetRoute) {
      return;
    }

    previousTargetRef.current = targetRoute;
    router.replace(targetRoute);
  }, [loading, shouldShowOnboarding, router]);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    const hasProSubscription =
      typeof customerInfo.entitlements.active["Diotrix Pro"] !== "undefined" ||
      customerInfo.activeSubscriptions.includes("diotrix_monthly");
    if (hasProSubscription) {
      console.log("User has an active Pro subscription.");
      try {
        await updateSettings({ isTrialVersion: false });
      } catch (error) {
        console.error("[settings] Failed to update Pro status", error);
      }
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboardingScreen" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="image/[id]" />
      <Stack.Screen
        name="createImageModal"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="promotionModal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <RootNavigator />
    </SettingsProvider>
  );
}
