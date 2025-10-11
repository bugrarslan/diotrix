import BackgroundStars from "@/components/ui/BackgroundStars";
import { useSettingsContext } from "@/context/SettingsContext";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { getThemePalette } from "@/utils/themePalette";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QuickAction = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

type SupportLink = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: string;
};

const SUPPORT_LINKS: SupportLink[] = [
  {
    icon: "help-circle-outline",
    label: "Documentation & FAQs",
    href: "https://github.com/bugrarslan/diotrix#readme",
  },
  {
    icon: "mail-outline",
    label: "Contact support",
    href: "mailto:support@diotrix.app",
  },
  {
    icon: "logo-x",
    label: "Follow updates on X",
    href: "https://x.com/bugrarsln7",
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, saving: settingsSaving } = useSettingsContext();
  const {
    loading: subscriptionLoading,
    isPro,
    restorePurchases,
    processing: subscriptionProcessing,
  } = useSubscriptionContext();
  const [apiKeyInput, setApiKeyInput] = useState(settings?.aiApiKey ?? "");
  const [showKey, setShowKey] = useState(false);
  const selectedTheme = settings?.theme ?? "light";
  const isDarkTheme = selectedTheme === "dark";

  const themePalette = useMemo(() => getThemePalette(selectedTheme), [selectedTheme]);

  const switchTrackColors = useMemo(
    () =>
      isDarkTheme
        ? { false: "rgba(255,255,255,0.25)", true: "rgba(139,92,246,0.4)" }
        : { false: "rgba(15,23,42,0.18)", true: "rgba(124,58,237,0.35)" },
    [isDarkTheme]
  );

  const switchThumbColor = isDarkTheme ? "#a78bfa" : "#7c3aed";

  const placeholderTextColor = useMemo(
    () => (isDarkTheme ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.45)"),
    [isDarkTheme]
  );

  const mutedIconColor = useMemo(
    () => (isDarkTheme ? "rgba(255,255,255,0.65)" : "rgba(15,23,42,0.45)"),
    [isDarkTheme]
  );

  useEffect(() => {
    setApiKeyInput(settings?.aiApiKey ?? "");
  }, [settings?.aiApiKey]);

  const isApiKeyDirty = useMemo(() => {
    const stored = settings?.aiApiKey?.trim() ?? "";
    return apiKeyInput.trim() !== stored;
  }, [apiKeyInput, settings?.aiApiKey]);

  const handleLinkPress = useCallback(async (href: string) => {
    const supported = await Linking.canOpenURL(href);
    if (!supported) {
      Alert.alert("Unavailable", "We couldn't open that link on this device.");
      return;
    }
    Linking.openURL(href);
  }, []);

  const handleClearGallery = useCallback(() => {
    Alert.alert(
      "Clear gallery?",
      "This removes every generated image and its metadata from local storage.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => Alert.alert("Gallery cleared", "Your gallery is now empty."),
        },
      ]
    );
  }, []);

  const handleResetApp = useCallback(() => {
    Alert.alert(
      "Reset Diotrix?",
      "We'll erase preferences, API keys, and cache to restore default settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => Alert.alert("Reset complete", "Restart the app to finalize the reset."),
        },
      ]
    );
  }, []);

  const handleSaveApiKey = useCallback(async () => {
    try {
      await updateSettings({ aiApiKey: apiKeyInput.trim() });
      Alert.alert("API key saved", "Your Gemini API key is now stored securely.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save API key.";
      Alert.alert("Save failed", message);
    }
  }, [apiKeyInput, updateSettings]);

  const handleThemeChange = useCallback(
    async (nextTheme: "light" | "dark") => {
      try {
        await updateSettings({ theme: nextTheme });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not update theme.";
        Alert.alert("Update failed", message);
      }
    },
    [updateSettings]
  );

  const handleRestorePurchases = useCallback(async () => {
    try {
      await restorePurchases();
      Alert.alert("Restored", "Your purchases have been restored.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to restore purchases.";
      Alert.alert("Restore failed", message);
    }
  }, [restorePurchases]);

  const subscriptionStatusLabel = useMemo(() => {
    if (subscriptionLoading) {
      return "Checking subscription…";
    }
    return isPro ? "Diotrix Pro active" : "Free tier";
  }, [subscriptionLoading, isPro]);

  const subscriptionDescription = useMemo(() => {
    if (subscriptionLoading) {
      return "Fetching the latest membership details from RevenueCat.";
    }
    if (isPro) {
      return "Enjoy unlimited prompts, faster queues, and premium style packs.";
    }
    return "Upgrade for unlimited prompts plus faster queue times and style packs.";
  }, [isPro, subscriptionLoading]);

  const quickActions: QuickAction[] = useMemo(
    () => [
      // {
      //   icon: "refresh-circle-outline",
      //   title: "Regenerate limits",
      //   subtitle: "View today’s remaining free generations and upgrade to Diotrix Pro.",
      //   onPress: () => router.push("/promotionModal"),
      // },
      {
        icon: "trash-bin-outline",
        title: "Clear gallery",
        subtitle: "Remove all locally saved image outputs from your device.",
        onPress: handleClearGallery,
      },
      {
        icon: "sparkles-outline",
        title: "Reset experience",
        subtitle: "Reset preferences, API keys, and cache to default settings.",
        onPress: handleResetApp,
      },
    ],
    [handleClearGallery, handleResetApp]
  );

  const appVersion = useMemo(() => {
    return Constants.expoConfig?.version ?? "1.0.0";
  }, []);

  return (
    <SafeAreaView className={`flex-1 ${themePalette.background}`}>
      <BackgroundStars />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">
          {/* Header */}
          <View className="mb-8">
            <Text className={`text-xs font-semibold tracking-[0.3em] ${themePalette.textMuted}`}>
              SETTINGS
            </Text>
            <Text className={`mt-3 text-3xl font-semibold ${themePalette.textPrimary}`}>
              Craft your creative cockpit
            </Text>
            <Text className={`mt-3 text-sm leading-6 ${themePalette.textSecondary}`}>
              Personalize Diotrix with your Gemini API key, control storage, and tailor the experience to how you create.
            </Text>
          </View>

          <View className="gap-3">
            {/* Subscription status */}
            <View className={`p-6 rounded-3xl border ${themePalette.border} ${themePalette.card}`}>
              <View className="flex-row items-center gap-3">
                <View className="p-3 rounded-2xl bg-primary-500/15">
                  <Ionicons name="medal-outline" size={20} color="#c4b5fd" />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>
                    Subscription status
                  </Text>
                  <Text className={`mt-1 text-sm ${themePalette.textSecondary}`}>
                    Unlock unlimited creations with Diotrix Pro or connect your Gemini key for endless play.
                  </Text>
                </View>
              </View>

              <View className="p-4 mt-6 border rounded-2xl border-primary-500/40 bg-primary-500/10">
                <Text className="text-xs font-semibold tracking-[0.35em] text-primary-500">
                  Today&apos;s generation status
                </Text>
                <Text className={`mt-3 text-lg font-semibold ${themePalette.textPrimary}`}>
                  {subscriptionStatusLabel}
                </Text>
                <Text className={`mt-1 text-sm ${themePalette.textSecondary}`}>
                  {subscriptionDescription}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Pressable
                    className="inline-flex px-4 py-2 mt-4 border rounded-full border-primary-500/40 bg-primary-500/20"
                    onPress={() => router.push("/promotionModal")}
                  >
                    <Text className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}>
                      {isPro ? "Manage subscription" : "See pro plans"}
                    </Text>
                  </Pressable>
                  <Pressable
                    className={`inline-flex px-4 py-2 mt-3 rounded-full border ${themePalette.border} ${themePalette.surface}`}
                    onPress={handleRestorePurchases}
                    disabled={subscriptionProcessing}
                  >
                    <Text className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}>
                      {subscriptionProcessing ? "Restoring…" : "Restore purchases"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Gemini API key */}
            <View className={`p-6 rounded-3xl border ${themePalette.border} ${themePalette.card}`}>
              <View className="flex-row items-center gap-3">
                <View className="p-3 rounded-2xl bg-primary-500/15">
                  <Ionicons name="key-outline" size={20} color="#c4b5fd" />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>
                    Gemini API key
                  </Text>
                  <Text className={`mt-1 text-sm ${themePalette.textSecondary}`}>
                    Connect your key for unlimited generation alongside Diotrix Pro benefits.
                  </Text>
                </View>
              </View>

              <Text className={`mt-6 text-xs font-semibold tracking-[0.25em] ${themePalette.textMuted}`}>
                CONNECTED KEY
              </Text>
              <View className="relative mt-2">
                <TextInput
                  value={apiKeyInput}
                  onChangeText={setApiKeyInput}
                  placeholder="Enter or paste your Gemini API key"
                  placeholderTextColor={placeholderTextColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showKey}
                  className={`px-4 py-3 pr-24 border rounded-2xl ${themePalette.border} ${themePalette.surface} ${themePalette.textPrimary}`}
                />
                <Pressable
                  onPress={() => setShowKey((prev) => !prev)}
                  className="absolute right-4 top-3"
                  accessibilityLabel={showKey ? "Hide API key" : "Reveal API key"}
                >
                  <Text className="text-xs font-semibold uppercase text-primary-500">
                    {showKey ? "Hide" : "Reveal"}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row items-center justify-between mt-4">
                <Text className={`flex-shrink text-xs ${themePalette.textSecondary}`}>
                  Need a key? Visit makersuite.google.com and create a new token.
                </Text>
                <Pressable
                  onPress={() => handleLinkPress("https://makersuite.google.com/app/apikey")}
                  className="px-3 py-1 border rounded-full border-primary-500/40 bg-primary-500/15"
                >
                  <Text className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}>
                    Get key
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleSaveApiKey}
                disabled={!isApiKeyDirty || settingsSaving}
                className={`mt-4 items-center rounded-full border border-primary-500/40 bg-primary-500/20 px-4 py-3 ${
                  !isApiKeyDirty || settingsSaving ? "opacity-60" : ""
                }`}
              >
                <Text className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}>
                  {settingsSaving ? "Saving…" : "Save key"}
                </Text>
              </Pressable>
            </View>

            {/* Theme selection */}
            <View className={`p-6 rounded-3xl border ${themePalette.border} ${themePalette.card}`}>
              <View className="flex-row items-center gap-3">
                <View className="p-3 rounded-2xl bg-primary-500/15">
                  <Ionicons name="moon-outline" size={20} color="#c4b5fd" />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>
                    Theme & appearance
                  </Text>
                  <Text className={`mt-1 text-sm ${themePalette.textSecondary}`}>
                    Choose between light and dark modes to suit your environment.
                  </Text>
                </View>
              </View>

              <View className={`relative px-4 py-4 mt-6 border rounded-2xl ${themePalette.border} ${themePalette.surface}`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className={`text-sm font-semibold ${themePalette.textPrimary}`}>
                      Dark mode
                    </Text>
                    <Text className={`mt-1 text-xs leading-5 ${themePalette.textSecondary}`}>
                      Toggle between light and dark palettes across the app.
                    </Text>
                  </View>
                  <Switch
                    value={isDarkTheme}
                    onValueChange={(value) => handleThemeChange(value ? "dark" : "light")}
                    thumbColor={switchThumbColor}
                    trackColor={switchTrackColors}
                    ios_backgroundColor={switchTrackColors.false}
                  />
                </View>
                
              </View>
            </View>

            {/* Quick actions */}
            <View className={`p-6 rounded-3xl border ${themePalette.border} ${themePalette.card}`}>
              <Text className={`text-sm font-semibold ${themePalette.textPrimary}`}>
                Quick actions
              </Text>
              <View className="gap-3 mt-4 space-y-3">
                {quickActions.map((action) => (
                  <Pressable
                    key={action.title}
                    onPress={action.onPress}
                    className={`flex-row items-start gap-3 p-4 border rounded-2xl ${themePalette.border} ${themePalette.surface}`}
                  >
                    <View className="p-3 rounded-2xl bg-primary-500/15">
                      <Ionicons name={action.icon} size={18} color="#c4b5fd" />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-sm font-semibold ${themePalette.textPrimary}`}>
                        {action.title}
                      </Text>
                      <Text className={`mt-1 text-xs ${themePalette.textSecondary}`}>
                        {action.subtitle}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={mutedIconColor} />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Support links & app version */}
            <View className={`p-6 mb-6 rounded-3xl border ${themePalette.border} ${themePalette.card}`}>
              <Text className={`text-sm font-semibold ${themePalette.textPrimary}`}>
                Help & support
              </Text>
              <View className="gap-3 mt-4 space-y-3">
                {SUPPORT_LINKS.map((link) => (
                  <Pressable
                    key={link.label}
                    onPress={() => handleLinkPress(link.href)}
                    className={`flex-row items-center justify-between px-4 py-3 border rounded-2xl ${themePalette.border} ${themePalette.surface}`}
                    accessibilityHint={`Opens ${link.label}`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="rounded-2xl bg-primary-500/15 p-2.5">
                        <Ionicons name={link.icon} size={16} color="#c4b5fd" />
                      </View>
                      <Text className={`text-sm font-medium ${themePalette.textPrimary}`}>
                        {link.label}
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color={mutedIconColor} />
                  </Pressable>
                ))}
              </View>

              <Text className={`mt-6 text-xs ${themePalette.textMuted}`}>
                Version {appVersion}.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}