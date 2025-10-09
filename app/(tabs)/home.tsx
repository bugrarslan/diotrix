import BackgroundStars from "@/components/ui/BackgroundStars";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type WorkflowStep = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
};

type PromptIdea = {
  heading: string;
  prompt: string;
};

type GalleryHighlight = {
  id: string;
  thumbnail: string;
  prompt: string;
  meta: string;
};

const workflow: WorkflowStep[] = [
  {
    icon: "color-filter-outline",
    label: "Frame the vision",
    description: "Describe your concept, pick a style preset, and fine-tune Gemini guidance.",
  },
  {
    icon: "flash-outline",
    label: "Generate with Gemini",
    description: "Launch ultra-fast creations using Diotrix credits or your own API key.",
  },
  {
    icon: "albums-outline",
    label: "Curate locally",
    description: "Review, favorite, and re-roll variations from your offline-first gallery.",
  },
];

const promptIdeas: PromptIdea[] = [
  {
    heading: "Digital art",
    prompt: "A neon-lit cyberpunk street market, cinematic lighting, artstation concept art",
  },
  {
    heading: "Photography",
    prompt: "Macro photograph of a dew-covered orchid, 85mm lens, shallow depth of field",
  },
  {
    heading: "Watercolor",
    prompt: "Dreamy watercolor of a floating city at sunrise, soft gradients, pastel palette",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const galleryHighlights: GalleryHighlight[] = useMemo(
    () => [
      {
        id: "1",
        thumbnail: "Aurora glass skyline",
        prompt: "Glass megastructures pulsing with aurora colors over a futuristic coastline",
        meta: "Portrait · 4K · Synthwave",
      },
      {
        id: "2",
        thumbnail: "Celestial botanica",
        prompt: "Bioluminescent garden orbiting a miniature planet, rendered in octane",
        meta: "Square · 2K · Digital art",
      },
    ],
    []
  );

  const handleLaunchCreate = () => {
    router.push("/createImageModal");
  };

  const handleViewGallery = () => {
    Alert.alert(
      "Gallery",
      "Gallery browsing is on the roadmap. Hook this action to your gallery screen when ready."
    );
  };

  const handleUpgrade = () => {
    router.push("/promotionModal");
  };

  const handleManageKey = () => {
    router.push("/(tabs)/settings");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <BackgroundStars />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">
          <View className="p-6 border rounded-3xl border-white/10 bg-white/5">
            <View className="flex-row items-start gap-4">
              <View className="p-3 rounded-2xl bg-primary-500/15">
                <Ionicons name="sparkles-outline" size={22} color="#c4b5fd" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold tracking-[0.3em] text-white/60">
                  CREATE
                </Text>
                <Text className="mt-3 text-3xl font-semibold text-white">
                  Shape tomorrow’s art with Gemini
                </Text>
                <Text className="mt-3 text-sm leading-6 text-white/70">
                  Compose prompts, tweak parameters, and spin up production-ready visuals in seconds. Diotrix blends Gemini intelligence with a local-first gallery so your ideas stay yours.
                </Text>
                <View className="mt-6 space-y-3">
                  <Pressable
                    onPress={handleLaunchCreate}
                    className="overflow-hidden rounded-full bg-primary-600"
                    accessibilityLabel="Open the prompt studio"
                  >
                    <View className="flex-row items-center justify-center gap-2 px-6 py-4">
                      <Ionicons name="flash" size={18} color="#fff" />
                      <Text className="text-base font-semibold text-white">
                        Launch prompt studio
                      </Text>
                    </View>
                  </Pressable>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={handleManageKey}
                      className="items-center justify-center flex-1 px-4 py-3 border rounded-full border-primary-500/40 bg-primary-500/15"
                    >
                      <Text className="text-sm font-semibold text-primary-50">
                        Manage API key
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleUpgrade}
                      className="items-center justify-center flex-1 px-4 py-3 border rounded-full border-white/15 bg-white/5"
                    >
                      <Text className="text-sm font-semibold text-white/80">
                        Discover Pro perks
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="p-6 mt-8 border rounded-3xl border-white/10 bg-white/5">
            <Text className="text-xs font-semibold tracking-[0.28em] text-white/50">
              DAILY SNAPSHOT
            </Text>
            <View className="flex-row flex-wrap justify-between gap-4 mt-4">
              <View className="min-w-[45%] flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Text className="text-3xl font-semibold text-white">4 / 6</Text>
                <Text className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">
                  free prompts remaining
                </Text>
              </View>
              <View className="min-w-[45%] flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Text className="text-3xl font-semibold text-white">Active</Text>
                <Text className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">
                  local gallery sync
                </Text>
              </View>
              <View className="min-w-[45%] flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Text className="text-3xl font-semibold text-white">API</Text>
                <Text className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">
                  custom key connected
                </Text>
              </View>
              <View className="min-w-[45%] flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Text className="text-3xl font-semibold text-white">SQLite</Text>
                <Text className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">
                  local storage engine
                </Text>
              </View>
            </View>
          </View>

          <View className="p-6 mt-8 border rounded-3xl border-white/10 bg-white/5">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">
                Recent gallery highlights
              </Text>
              <Pressable onPress={handleViewGallery} className="flex-row items-center gap-1">
                <Text className="text-xs font-semibold tracking-wide uppercase text-primary-200">
                  Open gallery
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#c4b5fd" />
              </Pressable>
            </View>
            <View className="mt-4 space-y-3">
              {galleryHighlights.map((item) => (
                <View
                  key={item.id}
                  className="p-4 border rounded-2xl border-white/10 bg-white/5"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-white">
                      {item.thumbnail}
                    </Text>
                    <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.6)" />
                  </View>
                  <Text className="mt-2 text-xs text-white/60">{item.meta}</Text>
                  <Text className="mt-3 text-sm leading-5 text-white/80">
                    {item.prompt}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="p-6 mt-8 border rounded-3xl border-white/10 bg-white/5">
            <Text className="text-base font-semibold text-white">
              Jump-start your next masterpiece
            </Text>
            <Text className="mt-2 text-sm text-white/70">
              Tap a style to auto-fill the prompt studio and iterate with guidance scale, aspect ratio, and custom presets.
            </Text>
            <View className="mt-4 space-y-3">
              {promptIdeas.map((idea) => (
                <Pressable
                  key={idea.heading}
                  onPress={handleLaunchCreate}
                  className="p-4 border rounded-2xl border-white/10 bg-white/5"
                  accessibilityHint="Opens the prompt studio with this idea"
                >
                  <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-200">
                    {idea.heading}
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-white/80">
                    {idea.prompt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="p-6 mt-8 border rounded-3xl border-white/10 bg-white/5">
            <Text className="text-base font-semibold text-white">
              How Diotrix keeps you flowing
            </Text>
            <View className="mt-4 space-y-3">
              {workflow.map((step) => (
                <View
                  key={step.label}
                  className="flex-row items-start gap-3 p-4 border rounded-2xl border-white/10 bg-white/5"
                >
                  <View className="rounded-2xl bg-primary-500/15 p-2.5">
                    <Ionicons name={step.icon} size={18} color="#c4b5fd" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-white">
                      {step.label}
                    </Text>
                    <Text className="mt-1 text-xs text-white/70">
                      {step.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="items-center mt-10">
            <Pressable
              onPress={handleLaunchCreate}
              className="flex-row items-center gap-2 px-6 py-3 border rounded-full border-primary-500/40 bg-primary-500/20"
            >
              <Ionicons name="sparkles" size={16} color="#c4b5fd" />
              <Text className="text-sm font-semibold text-primary-50">
                Start your next prompt
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}