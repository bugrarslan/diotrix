import BackgroundStars from "@/components/ui/BackgroundStars";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
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
    description: "Run as many Gemini prompts as you want with priority processing queues.",
  },
  {
    icon: "cloud-upload-outline",
    title: "Cloud fallback",
    description: "Sync masterpieces safely and retrieve them across devices when online.",
  },
  {
    icon: "color-palette-outline",
    title: "Premium style packs",
    description: "Access evolving collections of cinematic, editorial, and painterly aesthetics.",
  },
];

const planFeatures: PlanFeature[] = [
  {
    label: "Daily Gemini prompts",
    pro: "Unlimited",
    free: "6",
  },
  {
    label: "Generation priority",
    pro: "Fast lane",
    free: "Standard queue",
  },
  {
    label: "Style libraries",
    pro: "Full access",
    free: "Starter set",
  },
  {
    label: "Local-first gallery",
    pro: "Unlimited",
    free: "100 items",
  },
  {
    label: "API key override",
    pro: "Supported",
    free: "Supported",
  },
];

export default function PromotionModal() {
  const router = useRouter();
  const {
    loading,
    processing,
    availablePackages,
    purchasePackage,
    restorePurchases,
    isPro,
  } = useSubscriptionContext();

  const hasPackageOption = availablePackages.length > 0;
  const primaryPackage = useMemo(() => availablePackages[0] ?? null, [availablePackages]);

  const handleClose = () => {
    router.back();
  };

  const handlePurchase = async () => {
    if (!primaryPackage) {
  Alert.alert("Unavailable", "There’s no purchase package available right now.");
      return;
    }

    try {
      await purchasePackage(primaryPackage);
      Alert.alert("Welcome to Diotrix Pro", "You now have unlimited Gemini generations.");
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
    <SafeAreaView className="flex-1 bg-background-dark">
      <BackgroundStars />
      <View className="flex-row items-center justify-between px-6 pt-6">
        <Pressable
          onPress={handleClose}
          className="flex-row items-center gap-2 px-4 py-2 border rounded-full border-white/10 bg-white/5"
        >
          <Ionicons name="close" size={16} color="#ffffff" />
          <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Close
          </Text>
        </Pressable>
        <Text className="text-xs font-semibold tracking-[0.3em] text-white/60">
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
            <Text className="mt-3 text-3xl font-semibold text-white">
              Create without limits
            </Text>
            <Text className="mt-3 text-sm leading-6 text-white/80">
              Diotrix Pro unlocks unlimited Gemini generations, exclusive style packs, and priority processing so your ideas keep flowing.
            </Text>

            {primaryPackage ? (
              <View className="p-4 mt-6 border rounded-2xl border-white/15 bg-white/10">
                <Text className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                  BEST VALUE
                </Text>
                <Text className="mt-3 text-2xl font-semibold text-white">
                  {primaryPackage.product.priceString} · {primaryPackage.product.title}
                </Text>
                <Text className="mt-1 text-sm text-white/70">Cancel anytime · Managed via App Store</Text>
              </View>
            ) : (
              <View className="p-4 mt-6 border rounded-2xl border-white/15 bg-white/10">
                <Text className="text-sm font-semibold text-white">
                  Pro packages are loading
                </Text>
                <Text className="mt-1 text-xs text-white/70">
                  If this takes a while, check your network connection and try again.
                </Text>
              </View>
            )}
          </View>

          <View className="mt-8 space-y-4">
            {benefitHighlights.map((benefit) => (
              <View
                key={benefit.title}
                className="flex-row items-start gap-4 p-5 border rounded-3xl border-white/10 bg-white/5"
              >
                <View className="p-3 rounded-2xl bg-primary-500/15">
                  <Ionicons name={benefit.icon} size={20} color="#c4b5fd" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">
                    {benefit.title}
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-white/70">
                    {benefit.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="p-6 mt-8 border rounded-3xl border-white/10 bg-white/5">
            <Text className="text-base font-semibold text-white">
              Compare plans
            </Text>
            <View className="mt-4 space-y-3">
              {planFeatures.map((feature) => (
                <View
                  key={feature.label}
                  className="flex-row items-center gap-4 p-4 border rounded-2xl border-white/10 bg-white/5"
                >
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-white">
                      {feature.label}
                    </Text>
                    <Text className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">
                      Pro · {feature.pro}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs uppercase tracking-[0.2em] text-white/40">
                      Free
                    </Text>
                    <Text className="mt-1 text-sm font-semibold text-white/70">
                      {feature.free}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-10 space-y-4">
            <Pressable
              onPress={handlePurchase}
              disabled={!hasPackageOption || processing || loading || isPro}
              className={`overflow-hidden rounded-full px-6 py-4 ${
                !hasPackageOption || processing || loading || isPro
                  ? "bg-white/10"
                  : "bg-primary-600"
              }`}
              accessibilityLabel="Upgrade to Diotrix Pro"
            >
              <View className="flex-row items-center justify-center gap-2">
                {processing ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Ionicons name="sparkles" size={18} color="#ffffff" />
                )}
                <Text className="text-base font-semibold text-white">
                  {isPro ? "You’re already Pro" : "Upgrade to Diotrix Pro"}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleRestore}
              disabled={processing}
              className="items-center px-4 py-3 border rounded-full border-white/15 bg-white/5"
            >
              <Text className="text-sm font-semibold text-white/70">
                Restore purchases
              </Text>
            </Pressable>

            <Pressable
              onPress={handleClose}
              className="items-center px-4 py-3 border rounded-full border-white/10 bg-white/5"
            >
              <Text className="text-sm font-semibold text-white/60">
                Maybe later
              </Text>
            </Pressable>

            <Text className="text-xs text-white/50">
              Subscriptions auto-renew until cancelled. Manage your plan any time in your App Store settings. Your Gemini API key remains available for custom usage regardless of plan.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}