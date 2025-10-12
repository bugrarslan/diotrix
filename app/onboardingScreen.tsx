import BackgroundStars from "@/components/ui/BackgroundStars";
import { useSettingsContext } from "@/context/SettingsContext";
import { getThemePalette } from "@/utils/themePalette";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, Image, Pressable, Text, View } from "react-native";
import type { ImageSourcePropType, ViewToken } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OnboardingSlide = {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
};

const onboardingSlides: OnboardingSlide[] = [
  {
    id: "discover",
    badge: "IMAGINE",
    title: "Craft concepts with Gemini",
    description:
      "Describe your vision in rich detail and Diotrix will orchestrate Imagen to bring breathtaking scenes to life.",
    image: require("@/assets/onboard-images/whale.png") as ImageSourcePropType,
  },
  {
    id: "curate",
    badge: "CURATE",
    title: "Build a living gallery",
    description:
      "Store every render locally with metadata, styles, and notes so inspiration is always at your fingertips.",
    image: require("@/assets/onboard-images/city.png") as ImageSourcePropType,
  },
  {
    id: "accelerate",
    badge: "ACCELERATE",
    title: "Unlock limitless flow",
    description:
      "Upgrade to Diotrix Pro or connect your key for faster queues, premium styles, and endless experimentation.",
    image: require("@/assets/onboard-images/nebula.png") as ImageSourcePropType,
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettingsContext();
  const selectedTheme = settings?.theme ?? "light";
  const isDarkTheme = selectedTheme === "dark";
  const themePalette = useMemo(() => getThemePalette(selectedTheme), [selectedTheme]);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<OnboardingSlide>>(null);

  const handleContinue = useCallback(async () => {
    try {
      await updateSettings({ showOnboarding: false });
    } catch (error) {
      console.error("Failed to update onboarding status:", error);
    }
  }, [updateSettings]);

  const handleNext = useCallback(() => {
    const nextIndex = activeIndex + 1;
    if (nextIndex < onboardingSlides.length) {
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  }, [activeIndex]);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;
  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstViewable = viewableItems[0];
      if (firstViewable?.index != null) {
        setActiveIndex(firstViewable.index);
      }
    }
  ).current;

  const renderItem = useCallback(
    ({ item }: { item: OnboardingSlide }) => (
      <View style={{ width: SCREEN_WIDTH }} className="flex-1 px-6">
        <View className="flex-1">
          <View
            className={`flex-1 overflow-hidden rounded-3xl border ${themePalette.border} ${themePalette.surface}`}
          >
            <Image
              source={item.image}
              resizeMode="cover"
              className="w-full h-full"
            />
          </View>
          <View className="pb-10 mt-8">
            <Text className={`text-xs font-semibold uppercase tracking-[0.35em] ${themePalette.textMuted}`}>
              {item.badge}
            </Text>
            <Text className={`mt-3 text-3xl font-semibold leading-snug ${themePalette.textPrimary}`}>
              {item.title}
            </Text>
            <Text className={`mt-4 text-base leading-6 ${themePalette.textSecondary}`}>
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    ),
    [themePalette]
  );

  const isLastSlide = activeIndex === onboardingSlides.length - 1;

  return (
    <SafeAreaView className={`flex-1 ${themePalette.background}`}>
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
      <BackgroundStars />

      <View className="flex-1 pt-8">
        <FlatList
          ref={listRef}
          data={onboardingSlides}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          className="flex-1"
          style={{ flex: 1 }}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
        />

        <View className="px-6 pb-8">
          <View className="flex-row items-center justify-center gap-2">
            {onboardingSlides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <View
                  key={slide.id}
                  className={`h-2 rounded-full ${isActive ? "bg-primary-600" : themePalette.surface}`}
                  style={{ width: isActive ? 36 : 10, opacity: isActive ? 1 : 0.55 }}
                />
              );
            })}
          </View>

          <View className="mt-8">
            {isLastSlide ? (
              <Pressable
                className="overflow-hidden rounded-full bg-primary-600"
                onPress={handleContinue}
                accessibilityLabel="Get started with Diotrix"
              >
                <View className="items-center justify-center px-6 py-4">
                  <Text className="text-base font-semibold text-white">Get started</Text>
                </View>
              </Pressable>
            ) : (
              <View className="flex-row items-center justify-between">
                <Pressable
                  onPress={() => router.push("/promotionModal")}
                  accessibilityLabel="Explore Diotrix Pro"
                  className={`px-4 py-3 rounded-full border ${themePalette.border} ${themePalette.surface}`}
                >
                  <Text className={`text-xs font-semibold uppercase tracking-[0.2em] ${themePalette.textSecondary}`}>
                    Explore Pro
                  </Text>
                </Pressable>
                <Pressable
                  className="overflow-hidden rounded-full bg-primary-600"
                  onPress={handleNext}
                  accessibilityLabel="Next onboarding slide"
                >
                  <View className="px-6 py-4">
                    <Text className="text-base font-semibold text-white">Next</Text>
                  </View>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}