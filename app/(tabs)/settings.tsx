import BackgroundStars from "@/components/ui/BackgroundStars";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [theme, setTheme] = useState<"system" | "dark" | "light">("system");

  const maskedKey = useMemo(() => {
    if (!apiKey.trim()) return "No key connected";
    const start = apiKey.slice(0, 6);
    const end = apiKey.slice(-4);
    return showKey ? apiKey : `${start}••••${end}`;
  }, [apiKey, showKey]);

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

  const quickActions: QuickAction[] = useMemo(
    () => [
      {
        icon: "refresh-circle-outline",
        title: "Regenerate limits",
        subtitle: "View today’s remaining free generations and upgrade to Diotrix Pro.",
        onPress: () => router.push("/promotionModal"),
      },
      {
        icon: "trash-bin-outline",
        title: "Clear gallery",
        subtitle: "Remove all locally saved Gemini outputs from your device.",
        onPress: handleClearGallery,
      },
      {
        icon: "sparkles-outline",
        title: "Reset experience",
        subtitle: "Reset onboarding, preferences, and cached content.",
        onPress: handleResetApp,
      },
    ],
    [handleClearGallery, handleResetApp, router]
  );

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <BackgroundStars />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">
          <View className="mb-8">
            <Text className="text-xs font-semibold tracking-[0.3em] text-white/60">
              SETTINGS
            </Text>
            <Text className="mt-3 text-3xl font-semibold text-white">
              Craft your creative cockpit
            </Text>
            <Text className="mt-3 text-sm leading-6 text-white/70">
              Personalize Diotrix with your Gemini API key, control storage, and tailor the experience to how you create.
            </Text>
          </View>

          <View className="gap-3">
            <View className="p-6 border rounded-3xl border-white/10 bg-white/5">
              <View className="flex-row items-center gap-3">
                <View className="p-3 rounded-2xl bg-primary-500/15">
                  <Ionicons name="key-outline" size={20} color="#c4b5fd" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">
                    Gemini API key
                  </Text>
                  <Text className="mt-1 text-sm text-white/60">
                    Connect your key for unlimited generation alongside Diotrix Pro benefits.
                  </Text>
                </View>
              </View>

              <Text className="mt-6 text-xs font-semibold tracking-[0.25em] text-white/50">
                CONNECTED KEY
              </Text>
              <View className="flex-row items-center justify-between px-4 py-3 mt-2 border rounded-2xl border-white/10 bg-white/10">
                <Text className="text-sm font-medium text-white">{maskedKey}</Text>
                {!!apiKey && (
                  <Pressable onPress={() => setShowKey((prev) => !prev)}>
                    <Text className="text-xs font-semibold uppercase text-primary-200">
                      {showKey ? "Hide" : "Reveal"}
                    </Text>
                  </Pressable>
                )}
              </View>

              <TextInput
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="Enter or paste your Gemini API key"
                placeholderTextColor="rgba(255,255,255,0.6)"
                autoCapitalize="none"
                autoCorrect={false}
                className="px-4 py-3 mt-4 text-white border rounded-2xl border-white/15 bg-white/5"
              />

              <View className="flex-row items-center justify-between mt-4">
                <Text className="text-xs text-white/60">
                  Need a key? Visit makersuite.google.com and create a new token.
                </Text>
                <Pressable
                  onPress={() => handleLinkPress("https://makersuite.google.com/app/apikey")}
                  className="px-3 py-1 border rounded-full border-primary-500/40 bg-primary-500/20"
                >
                  <Text className="text-xs font-semibold tracking-wide uppercase text-primary-50">
                    Get key
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="p-6 border rounded-3xl border-white/10 bg-white/5">
              <View className="flex-row items-center gap-3">
                <View className="p-3 rounded-2xl bg-primary-500/15">
                  <Ionicons name="medal-outline" size={20} color="#c4b5fd" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">
                    Subscription status
                  </Text>
                  <Text className="mt-1 text-sm text-white/60">
                    Unlock unlimited creations with Diotrix Pro or connect your Gemini key for endless play.
                  </Text>
                </View>
              </View>

              <View className="p-4 mt-6 border rounded-2xl border-primary-500/40 bg-primary-500/10">
                <Text className="text-xs font-semibold tracking-[0.35em] text-primary-100">
                  TODAY’S GENERATION STATUS
                </Text>
                <Text className="mt-3 text-lg font-semibold text-white">
                  Free tier · 4 of 6 prompts remaining
                </Text>
                <Text className="mt-1 text-sm text-white/70">
                  Upgrade for unlimited prompts plus faster queue times and style packs.
                </Text>
                <Pressable
                  className="inline-flex self-start px-4 py-2 mt-4 border rounded-full border-primary-500/40 bg-primary-500/20"
                  onPress={() => router.push("/promotionModal")}
                >
                  <Text className="text-xs font-semibold tracking-wide uppercase text-primary-50">
                    See pro plans
                  </Text>
                </Pressable>
              </View>

              <View className="mt-6 space-y-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-medium text-white">Generation reminders</Text>
                    <Text className="text-xs text-white/60">
                      Stay updated when you near your daily limit.
                    </Text>
                  </View>
                  <Switch
                    value={enableNotifications}
                    onValueChange={setEnableNotifications}
                    thumbColor="#8b5cf6"
                    trackColor={{ false: "rgba(255,255,255,0.2)", true: "rgba(139,92,246,0.3)" }}
                  />
                </View>

                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-medium text-white">Auto-save masterpieces</Text>
                    <Text className="text-xs text-white/60">
                      Store every output in your gallery for offline access.
                    </Text>
                  </View>
                  <Switch
                    value={autoSave}
                    onValueChange={setAutoSave}
                    thumbColor="#8b5cf6"
                    trackColor={{ false: "rgba(255,255,255,0.2)", true: "rgba(139,92,246,0.3)" }}
                  />
                </View>
              </View>
            </View>

            <View className="p-6 border rounded-3xl border-white/10 bg-white/5">
              <View className="flex-row items-center gap-3">
                <View className="p-3 rounded-2xl bg-primary-500/15">
                  <Ionicons name="moon-outline" size={20} color="#c4b5fd" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">
                    Theme & appearance
                  </Text>
                  <Text className="mt-1 text-sm text-white/60">
                    Diotrix adapts to your system by default. Override the palette anytime.
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between mt-6">
                {(["system", "light", "dark"] as const).map((option) => {
                  const isActive = theme === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setTheme(option)}
                      className={`w-[30%] rounded-2xl border px-4 py-3 ${
                        isActive
                          ? "border-primary-500 bg-primary-500/20"
                          : "border-white/15 bg-transparent"
                      }`}
                      accessibilityRole="button"
                    >
                      <Text
                        className={`text-center text-xs font-semibold uppercase tracking-wide ${
                          isActive ? "text-primary-50" : "text-white/60"
                        }`}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="p-6 border rounded-3xl border-white/10 bg-white/5">
              <Text className="text-sm font-semibold text-white">
                Quick actions
              </Text>
              <View className="mt-4 space-y-3">
                {quickActions.map((action) => (
                  <Pressable
                    key={action.title}
                    onPress={action.onPress}
                    className="flex-row items-start gap-3 p-4 border rounded-2xl border-white/10 bg-white/5"
                  >
                    <View className="p-3 rounded-2xl bg-primary-500/15">
                      <Ionicons name={action.icon} size={18} color="#c4b5fd" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-white">
                        {action.title}
                      </Text>
                      <Text className="mt-1 text-xs text-white/60">{action.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="p-6 mb-6 border rounded-3xl border-white/10 bg-white/5">
              <Text className="text-sm font-semibold text-white">
                Help & support
              </Text>
              <View className="mt-4 space-y-3">
                {SUPPORT_LINKS.map((link) => (
                  <Pressable
                    key={link.label}
                    onPress={() => handleLinkPress(link.href)}
                    className="flex-row items-center justify-between px-4 py-3 border rounded-2xl border-white/10 bg-white/5"
                    accessibilityHint={`Opens ${link.label}`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="rounded-2xl bg-primary-500/15 p-2.5">
                        <Ionicons name={link.icon} size={16} color="#c4b5fd" />
                      </View>
                      <Text className="text-sm font-medium text-white">{link.label}</Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.65)" />
                  </Pressable>
                ))}
              </View>

              <Text className="mt-6 text-xs text-white/50">
                Version 1.0.0 · Crafted with React Native, Expo, NativeWind, and Google Gemini.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}