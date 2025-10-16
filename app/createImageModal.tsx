import BackgroundStars from "@/components/ui/BackgroundStars";
import { useSettingsContext } from "@/context/SettingsContext";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { useGalleryStorage } from "@/hooks/useGalleryStorage";
import { generateImage, InvalidApiKeyError, type AspectRatio as ImagenAspectRatio } from "@/services/aiService";
import { buildPrompt } from "@/utils/buildPrompt";
import { getThemePalette } from "@/utils/themePalette";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AspectRatioOption = {
  id: string;
  label: string;
  description: string;
};
type StylePreset = {
  id: string;
  name: string;
  tagline: string;
  icon: ImageSourcePropType;
};

type GuidancePreset = {
  id: string;
  label: string;
  value: number;
  description: string;
};

type ImageSizeOption = "1K" | "2K";
type PersonGenerationOption = "dont_allow" | "allow_adult";

const accordionSections = ["prompt", "aspect", "style", "guidance", "output"] as const;
type AccordionSection = (typeof accordionSections)[number];

const aspectRatios: AspectRatioOption[] = [
  { id: "1:1", label: "1 : 1", description: "Balanced for social and gallery tiles." },
  { id: "3:4", label: "3 : 4", description: "Ideal for posters, covers, and portraits." },
  { id: "16:9", label: "16 : 9", description: "Perfect for cinematic vistas." },
  { id: "9:16", label: "9 : 16", description: "Great for stories and mobile screens." },
  { id: "4:3", label: "4 : 3", description: "Classic frame, versatile for many uses." },
];

const aspectRatioValueMap: Record<AspectRatioOption["id"], ImagenAspectRatio> = {
  "1:1": "1:1",
  "3:4": "3:4",
  "16:9": "16:9",
  "9:16": "9:16",
  "4:3": "4:3",
};

const stylePresets: StylePreset[] = [
  {
    id: "anime",
    name: "Anime",
    tagline: "Soft shading and expressive line work.",
    icon: require("@/assets/style-images/anime.png"),
  },
  {
    id: "dramatic_headshot",
    name: "Dramatic Headshot",
    tagline: "Moody portraits with cinematic lighting.",
    icon: require("@/assets/style-images/dramatic-headshot.png"),
  },
  {
    id: "coloring_book",
    name: "Coloring Book",
    tagline: "Bold outlines ready for print and fill.",
    icon: require("@/assets/style-images/coloring-book.png"),
  },
  {
    id: "retro_cartoon",
    name: "Retro Cartoon",
    tagline: "Playful palettes with vintage charm.",
    icon: require("@/assets/style-images/retro-cartoon.png"),
  },
  {
    id: "synthwave",
    name: "Synthwave",
    tagline: "Retro-futuristic gradients and glow.",
    icon: require("@/assets/style-images/synthwave.png"),
  },
  {
    id: "low_poly",
    name: "Low Poly",
    tagline: "Geometric shapes creating a faceted, modern look.",
    icon: require("@/assets/style-images/low-poly.png"),
  },
  {
    id: "minimalist_line_art",
    name: "Line Art",
    tagline: "Clean, elegant lines defining form and space.",
    icon: require("@/assets/style-images/line-art.png"),
  },
  {
    id: "steampunk",
    name: "Steampunk",
    tagline: "Victorian elegance meets retro-futuristic machinery.",
    icon: require("@/assets/style-images/steampunk.png"),
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    tagline: "Neon drenched, high-contrast futurism.",
    icon: require("@/assets/style-images/cyberpunk.png"),
  },
  
  
  {
    id: "photo_shoot",
    name: "Photo Shoot",
    tagline: "Studio-quality lighting and texture.",
    icon: require("@/assets/style-images/photo-shoot.png"),
  },
  {
    id: "80s_glam",
    name: "80s Glam",
    tagline: "Flashy neon and glamorous highlights.",
    icon: require("@/assets/style-images/80s-glam.png"),
  },
  {
    id: "art_nouveau",
    name: "Art Nouveau",
    tagline: "Ornate patterns with organic flow.",
    icon: require("@/assets/style-images/art-nouveau.png"),
  },
  
  {
    id: "photorealistic",
    name: "Photorealistic",
    tagline: "Lifelike detail and true-to-life lighting.",
    icon: require("@/assets/style-images/photorealistic.png"),
  },
  {
    id: "cinematic",
    name: "Cinematic",
    tagline: "Wide-screen drama with epic scope.",
    icon: require("@/assets/style-images/cinematic.png"),
  },
  {
    id: "3d_render",
    name: "3D Render",
    tagline: "Polished and vibrant, like a modern animated film.",
    icon: require("@/assets/style-images/3d-render.png"),
  },
  {
    id: "fantasy_art",
    name: "Fantasy Art",
    tagline: "Mythical creatures and enchanted landscapes.",
    icon: require("@/assets/style-images/fantasy-art.png"),
  },
  {
    id: "watercolor",
    name: "Watercolor",
    tagline: "Soft, translucent washes and delicate blends.",
    icon: require("@/assets/style-images/watercolor.png"),
  },
  
];

const freeStyleIds = ["retro_cartoon", "coloring_book", "synthwave", "anime", "dramatic_headshot", "minimalist_line_art", "low_poly"];
const freeGuidanceIds = ["low"];
const freeImageSizeIds: ImageSizeOption[] = ["1K"];
const freePersonGenerationIds: PersonGenerationOption[] = ["dont_allow"];

const guidancePresets: GuidancePreset[] = [
  { id: "low", label: "Gentle", value: 4.5, description: "Loose interpretation for inventive results." },
  { id: "medium", label: "Balanced", value: 7, description: "Great mix of fidelity and creative drift." },
  { id: "high", label: "Precise", value: 9, description: "Laser-focused on your prompt details." },
];

const imageSizeOptions: { id: ImageSizeOption; label: string; description: string }[] = [
  {
    id: "1K",
    label: "1K",
    description: "Faster renders, great for previews and social posts.",
  },
  {
    id: "2K",
    label: "2K",
    description: "Extra detail for print-ready or high-res exports.",
  },
];

const personPolicies: { id: PersonGenerationOption; label: string; description: string }[] = [
  {
    id: "dont_allow",
    label: "Block people",
    description: "Avoid generating human subjects entirely.",
  },
  {
    id: "allow_adult",
    label: "Allow adults",
    description: "Enable adult characters while still filtering minors.",
  },
];

const mimeTypeToExtension = (mimeType: string | undefined): "png" | "jpg" | "jpeg" | "webp" => {
  if (!mimeType) {
    return "png";
  }

  if (mimeType.endsWith("png")) {
    return "png";
  }

  if (mimeType.endsWith("jpeg")) {
    return "jpeg";
  }

  if (mimeType.endsWith("jpg")) {
    return "jpg";
  }

  if (mimeType.endsWith("webp")) {
    return "webp";
  }

  return "png";
};

export default function CreateImageModal() {
  const router = useRouter();
  const { saveGeneratedImage, saving: savingImage } = useGalleryStorage();
  const { settings, updateSettings } = useSettingsContext();
  const { isPro } = useSubscriptionContext();
  const selectedTheme = settings?.theme ?? "light";
  const isDarkTheme = selectedTheme === "dark";
  const themePalette = useMemo(() => getThemePalette(selectedTheme), [selectedTheme]);
  const promptPlaceholderColor = useMemo(
    () => (isDarkTheme ? "rgba(255,255,255,0.55)" : "rgba(15,23,42,0.45)"),
    [isDarkTheme]
  );
  const negativePlaceholderColor = useMemo(
    () => (isDarkTheme ? "rgba(255,255,255,0.45)" : "rgba(15,23,42,0.35)"),
    [isDarkTheme]
  );
  const mutedIconColor = useMemo(
    () => (isDarkTheme ? "rgba(248,250,252,0.65)" : "rgba(15,23,42,0.45)"),
    [isDarkTheme]
  );
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedAspect, setSelectedAspect] = useState<AspectRatioOption["id"] | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset["id"] | null>(null);
  const [selectedGuidance, setSelectedGuidance] = useState<GuidancePreset["id"] | null>(null);
  const [imageSize, setImageSize] = useState<ImageSizeOption | null>(null);
  const [personGeneration, setPersonGeneration] = useState<PersonGenerationOption | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<AccordionSection, boolean>>({
    prompt: true,
    aspect: false,
    style: false,
    guidance: false,
    output: false,
  });

  const handleClose = () => {
    router.back();
  };

  const toggleSection = useCallback((sectionId: AccordionSection) => {
    setExpandedSections((prev) => {
      const isCurrentlyOpen = prev[sectionId];
      const nextState = {} as Record<AccordionSection, boolean>;
      accordionSections.forEach((key) => {
        nextState[key] = false;
      });

      if (isCurrentlyOpen) {
        return nextState;
      }

      nextState[sectionId] = true;
      return nextState;
    });
  }, []);

  const showValidationError = useCallback((message: string) => {
    setErrorMessage(message);
    Alert.alert("Missing info", message);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isGenerating || savingImage) {
      return;
    }

    if (!settings) {
      showValidationError("Settings are still loading. Please try again in a moment.");
      return;
    }

    if (!prompt.trim()) {
      showValidationError("Please describe what you’d like to create before generating.");
      return;
    }

    if (!selectedAspect) {
      showValidationError("Select an aspect ratio before generating.");
      return;
    }

    if (!selectedStyle) {
      showValidationError("Choose a style preset before generating.");
      return;
    }

    if (!selectedGuidance) {
      showValidationError("Choose a guidance scale before generating.");
      return;
    }

    if (!imageSize) {
      showValidationError("Pick an output size before generating.");
      return;
    }

    if (!personGeneration) {
      showValidationError("Choose a people generation policy before generating.");
      return;
    }

    const trimmedUserKey = settings.aiApiKey?.trim() ?? "";
    const remainingCredits = settings.remainingCredits ?? 0;
    let shouldConsumeCredit = false;
    let apiKeyOverride: string | null = null;

    if (isPro) {
      apiKeyOverride = null;
    } else if (trimmedUserKey.length > 0) {
      apiKeyOverride = trimmedUserKey;
    } else if (remainingCredits > 0) {
      apiKeyOverride = null;
      shouldConsumeCredit = true;
    } else {
      setErrorMessage("You’re out of free credits. Upgrade to keep generating.");
      Alert.alert("No credits left", "Upgrade to Diotrix Pro for unlimited generations.", [
        { text: "Maybe later", style: "cancel" },
        {
          text: "View plans",
          style: "default",
          onPress: () => {
            router.push("/promotionModal");
          },
        },
      ]);
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const aspectRatioValue = aspectRatioValueMap[selectedAspect];
      if (!aspectRatioValue) {
        showValidationError("Select a valid aspect ratio before generating.");
        setIsGenerating(false);
        return;
      }

      const guidancePreset = guidancePresets.find((item) => item.id === selectedGuidance);
      if (!guidancePreset) {
        showValidationError("Choose a valid guidance scale before generating.");
        setIsGenerating(false);
        return;
      }

      const stylePreset = stylePresets.find((preset) => preset.id === selectedStyle);
      if (!stylePreset) {
        showValidationError("Choose a valid style preset before generating.");
        setIsGenerating(false);
        return;
      }

      const { positive, negative } = buildPrompt({
        prompt,
        negativePrompt,
        style: { name: stylePreset.name, tagline: stylePreset.tagline },
        extras: [`Guidance scale ${guidancePreset.value.toFixed(1)}`],
      });

      const result = await generateImage({
        prompt: positive,
        negativePrompt: negative,
        aspectRatio: aspectRatioValue,
        guidanceScale: guidancePreset.value,
        numberOfImages: 1,
        imageSize,
        personGeneration,
        apiKey: apiKeyOverride,
      });

      const asset = result.assets[0];
      const extension = mimeTypeToExtension(asset.mimeType);

      const record = await saveGeneratedImage({
        prompt: prompt.trim(),
        base64Data: asset.base64Data,
        extension,
        fileName: asset.fileName,
        metadata: {
          aspectRatio: aspectRatioValue,
          guidanceScale: guidancePreset.value,
          model: result.metadata.model,
          extras: {
            styleId: stylePreset.id,
            styleName: stylePreset.name,
            styleTagline: stylePreset.tagline,
            imageSize,
            personGeneration,
            negativePrompt: negative ?? null,
            guidancePrompt: `Guidance scale ${guidancePreset.value.toFixed(1)}`,
          },
        },
      });

      if (shouldConsumeCredit) {
        try {
          const nextCredits = Math.max(remainingCredits - 1, 0);
          await updateSettings({ remainingCredits: nextCredits });
        } catch (creditError) {
          Alert.alert(
            "Credit sync issue",
            creditError instanceof Error
              ? creditError.message
              : "We generated your image but couldn't update your credits."
          );
        }
      }

      router.replace({ pathname: "/image/[id]", params: { id: String(record.id) } });
    } catch (error) {
      if (error instanceof InvalidApiKeyError) {
        setErrorMessage(error.message);
        Alert.alert("API key error", error.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
        Alert.alert("Generation failed", error.message);
      } else {
        const fallback = "An unexpected error occurred while generating the image.";
        setErrorMessage(fallback);
        Alert.alert("Generation failed", fallback);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [
    imageSize,
    isGenerating,
    negativePrompt,
    personGeneration,
    prompt,
    router,
    saveGeneratedImage,
    selectedAspect,
    settings,
    savingImage,
    selectedGuidance,
    selectedStyle,
    isPro,
    updateSettings,
    showValidationError,
  ]);

  return (
    <SafeAreaView className={`flex-1 ${themePalette.background}`}>
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
      <BackgroundStars />
      <View className="flex-row items-center justify-between px-6 pt-6">
        <Pressable
          onPress={handleClose}
          className={`flex-row items-center gap-2 px-4 py-2 border rounded-full ${themePalette.border} ${themePalette.surface}`}
        >
          <Ionicons name="close" size={16} color={isDarkTheme ? "#f8fafc" : "#0f172a"} />
          <Text className={`text-xs font-semibold uppercase tracking-[0.2em] ${themePalette.textSecondary}`}>
            Close
          </Text>
        </Pressable>
        <Text className={`text-xs font-semibold tracking-[0.35em] ${themePalette.textMuted}`}>
          PROMPT STUDIO
        </Text>
        <View className="w-24" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">

          {/* Prompt Section */}
          <View className={`p-6 border rounded-3xl ${themePalette.border} ${themePalette.card}`}>
            <Pressable
              onPress={() => toggleSection("prompt")}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 pr-4">
                <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>Bring your vision to life</Text>
                <Text className={`mt-2 text-sm leading-6 ${themePalette.textSecondary}`}>
                  Describe the scene, specify the ambience, and Diotrix will orchestrate Gemini to build a masterpiece. Combine guidance scale, aspect ratio, and style to fine-tune the result.
                </Text>
              </View>
              <Ionicons
                name={expandedSections.prompt ? "chevron-up" : "chevron-down"}
                size={18}
                color={mutedIconColor}
              />
            </Pressable>

            {expandedSections.prompt && (
              <View>
                <Text className={`mt-6 text-xs font-semibold tracking-[0.25em] ${themePalette.textMuted}`}>MAIN PROMPT</Text>
                <TextInput
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="e.g. Ethereal city floating above the clouds, gleaming neon, volumetric lighting"
                  placeholderTextColor={promptPlaceholderColor}
                  multiline
                  className={`mt-2 min-h-[120px] rounded-2xl border ${themePalette.border} ${themePalette.surface} px-4 py-4 text-base ${themePalette.textPrimary}`}
                />

                <Text className={`mt-6 text-xs font-semibold tracking-[0.25em] ${themePalette.textMuted}`}>
                  NEGATIVE PROMPT
                </Text>
                <TextInput
                  value={negativePrompt}
                  onChangeText={setNegativePrompt}
                  placeholder="Details to avoid: low contrast, text artifacts, distorted anatomy"
                  placeholderTextColor={negativePlaceholderColor}
                  multiline
                  className={`mt-2 min-h-[80px] rounded-2xl border ${themePalette.border} ${themePalette.surface} px-4 py-4 text-base ${themePalette.textPrimary}`}
                />
              </View>
            )}
          </View>

          {/* Aspect Ratio Section */}
          <View className={`p-6 mt-8 border rounded-3xl ${themePalette.border} ${themePalette.card}`}>
            <Pressable
              onPress={() => toggleSection("aspect")}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 pr-4">
                <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>Aspect ratio</Text>
                <Text className={`mt-2 text-sm ${themePalette.textSecondary}`}>
                  Choose how your canvas will appear in the local gallery, exports, and sharing.
                </Text>
              </View>
              <Ionicons
                name={expandedSections.aspect ? "chevron-up" : "chevron-down"}
                size={18}
                color={mutedIconColor}
              />
            </Pressable>
            {expandedSections.aspect && (
              <View className="flex-row flex-wrap gap-2 mt-4">
                {aspectRatios.map((ratio) => {
                  const isActive = ratio.id === selectedAspect;
                  return (
                    <Pressable
                      key={ratio.id}
                      onPress={() => setSelectedAspect(ratio.id)}
                      className={`rounded-full border px-4 py-2 ${
                        isActive ? "border-primary-500 bg-primary-500/30" : `${themePalette.border} ${themePalette.surface}`
                      }`}
                    >
                      {/* <View className="flex-row items-center gap-2"> */}
                        <Text className={`text-sm font-semibold ${themePalette.textPrimary}`}>{ratio.label}</Text>
                        {/* {isActive && <Ionicons name="checkmark" size={14} color="#c4b5fd" />} */}
                      {/* </View> */}
                      {/* <Text className="mt-1 text-[11px] text-white/60">{ratio.description}</Text> */}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Style Preset Section */}
          <View className={`p-6 mt-8 border rounded-3xl ${themePalette.border} ${themePalette.card}`}>
            <Pressable
              onPress={() => toggleSection("style")}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 pr-4">
                <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>Style presets</Text>
                <Text className={`mt-2 text-sm ${themePalette.textSecondary}`}>
                  Swap between curated looks to jump-start mood and palette. Refine further in the prompt.
                </Text>
              </View>
              <Ionicons
                name={expandedSections.style ? "chevron-up" : "chevron-down"}
                size={18}
                color={mutedIconColor}
              />
            </Pressable>
            {expandedSections.style && (
              <View className="flex-row flex-wrap justify-between mt-4 gap-y-4">
                {stylePresets.map((preset) => {
                  const isActive = preset.id === selectedStyle;
                  const isLocked = !isPro && !freeStyleIds.includes(preset.id);
                  return (
                    <Pressable
                      key={preset.id}
                      onPress={() => {
                        if (isLocked) {
                          router.push("/promotionModal");
                        } else {
                          setSelectedStyle(preset.id);
                        }
                      }}
                      className={`w-[30%] items-center rounded-3xl border px-3 py-4 ${
                        isActive ? "border-primary-500 bg-primary-500/20" : `${themePalette.border} ${themePalette.surface}`
                      } ${isLocked ? "opacity-60" : ""}`}
                    >
                      {isLocked && (
                        <View className="absolute z-10 p-1 rounded-full top-2 left-2 bg-primary-500">
                          <Ionicons name="star" size={12} color="#ffffff" />
                        </View>
                      )}
                      <Image
                        source={preset.icon}
                        className={`border rounded-full h-20 w-20 ${themePalette.border}`}
                        resizeMode="cover"
                      />
                      <Text className={`mt-3 text-sm font-semibold text-center ${themePalette.textPrimary}`} numberOfLines={2}>
                        {preset.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Guidance Scale Section */}
          <View className={`p-6 mt-8 border rounded-3xl ${themePalette.border} ${themePalette.card}`}>
            <Pressable
              onPress={() => toggleSection("guidance")}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 pr-4">
                <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>Guidance scale</Text>
                <Text className={`mt-2 text-sm ${themePalette.textSecondary}`}>
                  Steer how closely Gemini follows the prompt. Balanced works for most concepts.
                </Text>
              </View>
              <Ionicons
                name={expandedSections.guidance ? "chevron-up" : "chevron-down"}
                size={18}
                color={mutedIconColor}
              />
            </Pressable>
            {expandedSections.guidance && (
                <View className="gap-3 mt-4 space-y-3">
                  {guidancePresets.map((preset) => {
                    const isActive = preset.id === selectedGuidance;
                    const isLocked = !isPro && !freeGuidanceIds.includes(preset.id);
                    return (
                      <Pressable
                        key={preset.id}
                        onPress={() => {
                          if (isLocked) {
                            router.push("/promotionModal");
                          } else {
                            setSelectedGuidance(preset.id);
                          }
                        }}
                        className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                          isActive ? "border-primary-500 bg-primary-500/20" : `${themePalette.border} ${themePalette.surface}`
                        } ${isLocked ? "opacity-60" : ""}`}
                      >
                        <View className="flex-row items-center flex-1 gap-2">
                          {isLocked && (
                            <View className="p-1 rounded-full bg-primary-500">
                              <Ionicons name="star" size={10} color="#ffffff" />
                            </View>
                          )}
                          <View className="flex-1">
                            <Text className={`text-sm font-semibold ${themePalette.textPrimary}`}>{preset.label}</Text>
                            <Text className={`mt-1 text-xs ${themePalette.textSecondary}`}>{preset.description}</Text>
                          </View>
                        </View>
                        <Text className={`text-sm font-semibold ${themePalette.textPrimary}`}>{preset.value.toFixed(1)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
            )}
          </View>

          {/* Output Settings Section */}
          <View className={`p-6 mt-8 border rounded-3xl ${themePalette.border} ${themePalette.card}`}>
            <Pressable
              onPress={() => toggleSection("output")}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 pr-4">
                <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>Output settings</Text>
                <Text className={`mt-2 text-sm ${themePalette.textSecondary}`}>
                  Tune output resolution and whether people can appear in your render.
                </Text>
              </View>
              <Ionicons
                name={expandedSections.output ? "chevron-up" : "chevron-down"}
                size={18}
                color={mutedIconColor}
              />
            </Pressable>

            {expandedSections.output && (
              <View className="gap-6">
                <View className="gap-3 mt-4 space-y-3">
                  {imageSizeOptions.map((option) => {
                    const isActive = option.id === imageSize;
                    const isLocked = !isPro && !freeImageSizeIds.includes(option.id);
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => {
                          if (isLocked) {
                            router.push("/promotionModal");
                          } else {
                            setImageSize(option.id);
                          }
                        }}
                        className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                          isActive ? "border-primary-500 bg-primary-500/20" : `${themePalette.border} ${themePalette.surface}`
                        } ${isLocked ? "opacity-60" : ""}`}
                      >
                        <View className="flex-row items-center flex-1 gap-2">
                          {isLocked && (
                            <View className="p-1 rounded-full bg-primary-500">
                              <Ionicons name="star" size={10} color="#ffffff" />
                            </View>
                          )}
                          <View className="flex-1">
                            <Text className={`text-sm font-semibold ${themePalette.textPrimary}`}>{option.label}</Text>
                            <Text className={`mt-1 text-xs ${themePalette.textSecondary}`}>{option.description}</Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                <View className="gap-3 space-y-3">
                  {personPolicies.map((policy) => {
                    const isActive = policy.id === personGeneration;
                    const isLocked = !isPro && !freePersonGenerationIds.includes(policy.id);
                    return (
                      <Pressable
                        key={policy.id}
                        onPress={() => {
                          if (isLocked) {
                            router.push("/promotionModal");
                          } else {
                            setPersonGeneration(policy.id);
                          }
                        }}
                        className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                          isActive ? "border-primary-500 bg-primary-500/20" : `${themePalette.border} ${themePalette.surface}`
                        } ${isLocked ? "opacity-60" : ""}`}
                      >
                        <View className="flex-row items-center flex-1 gap-2">
                          {isLocked && (
                            <View className="p-1 rounded-full bg-primary-500">
                              <Ionicons name="star" size={10} color="#ffffff" />
                            </View>
                          )}
                          <View className="flex-1">
                            <Text className={`text-sm font-semibold ${themePalette.textPrimary}`}>{policy.label}</Text>
                            <Text className={`mt-1 text-xs ${themePalette.textSecondary}`}>{policy.description}</Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Generate Button & Error Message */}
          <View className="mt-10 space-y-4">
            {errorMessage && (
              <View className="px-4 py-3 border rounded-2xl border-red-500/30 bg-red-500/10">
                <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-red-200">
                  Generation issue
                </Text>
                <Text className="mt-2 text-sm text-red-100/90">{errorMessage}</Text>
              </View>
            )}
            <Pressable
              onPress={handleGenerate}
              className={`overflow-hidden rounded-full bg-primary-600 ${
                isGenerating || savingImage ? "opacity-60" : ""
              }`}
              disabled={isGenerating || savingImage}
              accessibilityLabel="Generate image with current prompt"
            >
              <View className="flex-row items-center justify-center gap-2 px-6 py-4">
                {isGenerating || savingImage ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="sparkles" size={18} color="#ffffff" />
                )}
                <Text className="text-base font-semibold text-white">
                  {isGenerating || savingImage ? "Generating…" : "Generate Image"}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}