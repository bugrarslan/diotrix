import BackgroundStars from "@/components/ui/BackgroundStars";
import { FeatureHighlightCard, FeatureHighlightCardProps } from "@/components/ui/FeatureHighlightCard";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const featureHighlights: FeatureHighlightCardProps[] = [
  {
    icon: "color-palette-outline",
    title: "Gemini-powered artistry",
    description: "Transform simple prompts into gallery-ready visuals with Google Gemini's image intelligence.",
  },
  {
    icon: "images-outline",
    title: "Curated local gallery",
    description: "Keep every masterpiece offline with rich metadata, ready to revisit or regenerate.",
  },
  {
    icon: "infinite-outline",
    title: "Freemium flexibility",
    description: "Use the Diotrix Pro plan or plug in your own API key for limitless creativity.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar style="light" />
      <BackgroundStars />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-12"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">
          <View className="items-center">
            <Text className="mt-6 text-3xl font-semibold text-center text-white">
              Unleash AI-powered artistry
            </Text>
            <Text className="mt-3 text-base leading-6 text-center text-white/70">
              Diotrix blends Google Gemini, local storage, and a sleek creative suite to bring your imagination to life—on any device, anytime.
            </Text>
          </View>

          <View className="gap-3 mt-10 space-y-4">
            {featureHighlights.map((feature) => (
              <FeatureHighlightCard key={feature.title} {...feature} />
            ))}
          </View>

          <View className="gap-3 mt-12 space-y-4">
            <Pressable
              className="overflow-hidden rounded-full"
              onPress={handleContinue}
              accessibilityLabel="Start using Diotrix"
            >
              <View className="items-center justify-center px-6 py-4 rounded-full bg-primary-600">
                <Text className="text-base font-semibold text-white">
                  Start creating with Diotrix
                </Text>
              </View>
            </Pressable>

            <Pressable
              className="items-center"
              onPress={() => router.push("/promotionModal")}
              accessibilityLabel="View Diotrix Pro benefits"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="trophy" size={16} color="#a855f7" />
                <Text className="text-sm font-medium text-white/80">
                  Explore Diotrix Pro benefits
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}