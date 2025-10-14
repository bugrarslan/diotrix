import BackgroundStars from "@/components/ui/BackgroundStars";
import { useSettingsContext } from "@/context/SettingsContext";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { getThemePalette } from "@/utils/themePalette";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type BenefitHighlight = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

type PlanFeature = {
  label: string;
  pro: string;
  free: string;
};

const benefitHighlights: BenefitHighlight[] = [
  {
    icon: "sparkles-outline",
    title: "Unlimited generations",
    description:
      "Run as many prompts as you want with priority processing queues.",
  },
  {
    icon: "color-palette-outline",
    title: "Premium style packs",
    description:
      "Access evolving collections of cinematic, editorial, and painterly aesthetics.",
  },
];

const planFeatures: PlanFeature[] = [
  {
    label: "Unlimited Generations",
    pro: "✅",
    free: "Limited to 5",
  },
  {
    label: "Generation Priority",
    pro: "Fast Lane",
    free: "Standard Queue",
  },
  {
    label: "All Premium Styles",
    pro: "✅",
    free: "❌",
  },
  {
    label: "Advanced Settings",
    pro: "✅",
    free: "❌",
  },
  {
    label: "Bring Your Own API Key",
    pro: "✅",
    free: "✅",
  },
];

export default function PromotionModal() {
  const router = useRouter();
  const { settings } = useSettingsContext();
  const {
    loading,
    processing,
    availablePackages,
    purchasePackage,
    restorePurchases,
    isPro,
  } = useSubscriptionContext();

  const selectedTheme = settings?.theme ?? "light";
  const isDarkTheme = selectedTheme === "dark";
  const themePalette = useMemo(
    () => getThemePalette(selectedTheme),
    [selectedTheme]
  );

  const hasPackageOption = availablePackages.length > 0;
  const primaryPackage = useMemo(
    () => availablePackages[0] ?? null,
    [availablePackages]
  );

  const handleClose = () => {
    router.back();
  };

  const handlePurchase = async () => {
    if (!primaryPackage) {
      Alert.alert(
        "Unavailable",
        "There’s no purchase package available right now."
      );
      return;
    }

    try {
      await purchasePackage(primaryPackage);
      Alert.alert(
        "Welcome to Diotrix Pro",
        "You now have unlimited Gemini generations."
      );
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Purchase cancelled", error.message);
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      Alert.alert("Restored", "Your Diotrix Pro benefits are active again.");
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Restore failed", error.message);
      }
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${themePalette.background}`}>
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
      <BackgroundStars />
      <View className="flex-row items-center justify-between px-6 pt-6">
        <Pressable
          onPress={handleClose}
          className={`flex-row items-center gap-2 px-4 py-2 border rounded-full ${themePalette.border} ${themePalette.surface}`}
        >
          <Ionicons
            name="close"
            size={16}
            color={isDarkTheme ? "#ffffff" : "#0f172a"}
          />
          <Text
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${themePalette.textSecondary}`}
          >
            Close
          </Text>
        </Pressable>
        <Text
          className={`text-xs font-semibold tracking-[0.3em] ${themePalette.textMuted}`}
        >
          DIOTRIX PRO
        </Text>
        <View className="w-24" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">
          <View className="p-6 border rounded-3xl border-primary-500/40 bg-primary-500/20">
            <Text className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-100">
              Upgrade your studio
            </Text>
            <Text
              className={`mt-3 text-3xl font-semibold ${themePalette.textPrimary}`}
            >
              Create without limits
            </Text>
            <Text
              className={`mt-3 text-sm leading-6 ${themePalette.textSecondary}`}
            >
              Diotrix Pro unlocks unlimited Gemini generations, exclusive style
              packs, and priority processing so your ideas keep flowing.
            </Text>

            {primaryPackage ? (
              <View
                className={`p-4 mt-6 border rounded-2xl ${themePalette.border} ${themePalette.surface}`}
              >
                <Text
                  className={`text-xs font-semibold uppercase tracking-[0.35em] ${themePalette.textMuted}`}
                >
                  BEST VALUE
                </Text>
                <Text
                  className={`mt-3 text-2xl font-semibold ${themePalette.textPrimary}`}
                >
                  {primaryPackage.product.priceString} ·{" "}
                  {primaryPackage.product.title}
                </Text>
                <Text className={`mt-1 text-sm ${themePalette.textSecondary}`}>
                  Cancel anytime · Managed via App Store
                </Text>
              </View>
            ) : (
              <View
                className={`p-4 mt-6 border rounded-2xl ${themePalette.border} ${themePalette.surface}`}
              >
                <Text
                  className={`text-sm font-semibold ${themePalette.textPrimary}`}
                >
                  Pro packages are loading
                </Text>
                <Text className={`mt-1 text-xs ${themePalette.textSecondary}`}>
                  If this takes a while, check your network connection and try
                  again.
                </Text>
              </View>
            )}
          </View>

          <View className="gap-3 mt-8 space-y-4">
            {benefitHighlights.map((benefit) => (
              <View
                key={benefit.title}
                className={`flex-row items-start gap-4 p-5 border rounded-3xl ${themePalette.border} ${themePalette.card}`}
              >
                <View className="p-3 rounded-2xl bg-primary-500/15">
                  <Ionicons name={benefit.icon} size={20} color="#c4b5fd" />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-semibold ${themePalette.textPrimary}`}
                  >
                    {benefit.title}
                  </Text>
                  <Text
                    className={`mt-1 text-sm leading-5 ${themePalette.textSecondary}`}
                  >
                    {benefit.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View
            className={`p-6 mt-8 border rounded-3xl ${themePalette.border} ${themePalette.card}`}
          >
            <Text
              className={`mb-6 text-base font-semibold ${themePalette.textPrimary}`}
            >
              Compare plans
            </Text>
            
            {/* Table Header */}
            <View className="flex-row items-center pb-3 mb-4 border-b border-primary-500/20">
              <View className="flex-1">
                <Text
                  className={`text-xs font-semibold uppercase tracking-[0.25em] ${themePalette.textMuted}`}
                >
                  Feature
                </Text>
              </View>
              <View className="items-center w-28">
                <View className="px-3 py-1 rounded-full bg-primary-500/15">
                  <Text className="text-xs font-bold tracking-wide text-primary-500">
                    PRO
                  </Text>
                </View>
              </View>
              <View className="items-center w-28">
                <Text
                  className={`text-xs font-semibold uppercase tracking-[0.25em] ${themePalette.textMuted}`}
                >
                  Free
                </Text>
              </View>
            </View>

            {/* Table Rows */}
            <View className="gap-4">
              {planFeatures.map((feature, index) => (
                <View
                  key={feature.label}
                  className={`flex-row items-center ${
                    index !== planFeatures.length - 1 ? "pb-4 border-b" : ""
                  } ${themePalette.border}`}
                >
                  <View className="flex-1 pr-2">
                    <Text
                      className={`text-sm font-medium ${themePalette.textPrimary}`}
                    >
                      {feature.label}
                    </Text>
                  </View>
                  <View className="items-center justify-center w-28">
                    <View className="flex-row items-center gap-1">
                      <Text
                        className="text-sm font-semibold text-primary-500"
                      >
                        {feature.pro}
                      </Text>
                    </View>
                  </View>
                  <View className="items-center justify-center w-28">
                    <Text
                      className={`text-sm font-medium ${themePalette.textSecondary}`}
                    >
                      {feature.free}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-3 mt-10 space-y-4">
            <Pressable
              onPress={handlePurchase}
              disabled={!hasPackageOption || processing || loading || isPro}
              className={`overflow-hidden rounded-full px-6 py-4 ${
                !hasPackageOption || processing || loading || isPro
                  ? `${themePalette.surface}`
                  : "bg-primary-600"
              }`}
              accessibilityLabel="Upgrade to Diotrix Pro"
            >
              {processing ? (
                <ActivityIndicator color="#c4b5fd" />
              ) : (
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons name="sparkles" size={18} color="#ffffff" />
                  <Text className="text-base font-semibold text-white">
                    {isPro ? "You're already Pro" : "Upgrade to Diotrix Pro"}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={handleRestore}
              disabled={processing}
              className={`items-center px-4 py-3 border rounded-full ${themePalette.border} ${themePalette.surface}`}
            >
              <Text
                className={`text-sm font-semibold ${themePalette.textSecondary}`}
              >
                Restore purchases
              </Text>
            </Pressable>

            <Pressable
              onPress={handleClose}
              className={`items-center px-4 py-3 border rounded-full ${themePalette.border} ${themePalette.surface}`}
            >
              <Text
                className={`text-sm font-semibold ${themePalette.textMuted}`}
              >
                Maybe later
              </Text>
            </Pressable>

            <Text className={`text-xs ${themePalette.textMuted}`}>
              Subscriptions auto-renew until cancelled. Manage your plan any
              time in your App Store settings. Your Gemini API key remains
              available for custom usage regardless of plan.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
