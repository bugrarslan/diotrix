import "@/global.css";

import {
  SettingsProvider,
  useSettingsContext,
} from "@/context/SettingsContext";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "@/context/SubscriptionContext";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";

function RootNavigator() {
  const router = useRouter();
  const { loading: settingsLoading, shouldShowOnboarding, updateSettings, settings } =
    useSettingsContext();
  const { loading: subscriptionLoading, isPro } = useSubscriptionContext();
  const previousTargetRef = useRef<string | null>(null);
  const hasConfiguredPurchasesRef = useRef(false);

  useEffect(() => {
    if (hasConfiguredPurchasesRef.current || Platform.OS !== "ios") {
      return;
    }

    if (!process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY) {
      console.log("RevenueCat Apple API Key is not set in environment variables.");
      hasConfiguredPurchasesRef.current = true;
      return;
    }

    try {
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
      });
      hasConfiguredPurchasesRef.current = true;
    } catch (error) {
      console.error("Failed to configure Purchases:", error);
    }
  }, []);

  const isTrialVersion = settings?.isTrialVersion ?? true;

  useEffect(() => {
    if (settingsLoading || subscriptionLoading) {
      return;
    }

    if (isPro && isTrialVersion) {
      void updateSettings({ isTrialVersion: false });
    }

    const targetRoute = shouldShowOnboarding ? "/onboardingScreen" : "/home";

    if (previousTargetRef.current === targetRoute) {
      return;
    }

    previousTargetRef.current = targetRoute;
    router.replace(targetRoute);
  }, [
    settingsLoading,
    subscriptionLoading,
    shouldShowOnboarding,
    router,
    isPro,
    updateSettings,
    isTrialVersion,
  ]);

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
      <SubscriptionProvider>
        <RootNavigator />
      </SubscriptionProvider>
    </SettingsProvider>
  );
}
