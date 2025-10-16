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
  const {
    loading: settingsLoading,
    shouldShowOnboarding,
    updateSettings,
    settings,
  } = useSettingsContext();
  const { loading: subscriptionLoading, isPro } = useSubscriptionContext();
  const previousTargetRef = useRef<string | null>(null);
  const hasConfiguredPurchasesRef = useRef(false);
  const isTrialVersion = settings?.isTrialVersion ?? true;

  // Configure RevenueCat for both iOS and Android
  useEffect(() => {
    if (hasConfiguredPurchasesRef.current) {
      return;
    }

    void configureRevenueCat();
  }, []);

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

  const configureRevenueCat = async () => {
    try {
      let apiKey: string | undefined;

      if (Platform.OS === "ios") {
        apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
        if (!apiKey) {
          console.warn(
            "RevenueCat iOS API Key is not set in environment variables."
          );
          hasConfiguredPurchasesRef.current = true;
          return;
        }
      } else if (Platform.OS === "android") {
        apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
        if (!apiKey) {
          console.warn(
            "RevenueCat Android API Key is not set in environment variables."
          );
          hasConfiguredPurchasesRef.current = true;
          return;
        }
      } else {
        // Web or other platforms - skip configuration
        hasConfiguredPurchasesRef.current = true;
        return;
      }

      Purchases.configure({
        apiKey,
      });

      // Set debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }

      hasConfiguredPurchasesRef.current = true;
      console.log(`RevenueCat configured successfully for ${Platform.OS}`);
    } catch (error) {
      console.error("Failed to configure RevenueCat:", error);
      hasConfiguredPurchasesRef.current = true; // Mark as attempted to avoid infinite retries
    }
  };

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
