import BackgroundStars from "@/components/ui/BackgroundStars";
import { useSettingsContext } from "@/context/SettingsContext";
import { useGalleryStorage } from "@/hooks/useGalleryStorage";
import { generateImage, InvalidApiKeyError, type AspectRatio as ImagenAspectRatio } from "@/services/aiService";
import { buildPrompt } from "@/utils/buildPrompt";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
};

type GuidancePreset = {
  id: string;
  label: string;
  value: number;
  description: string;
};

type ImageSizeOption = "1K" | "2K";
type PersonGenerationOption = "dont_allow" | "allow_adult";

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
  { id: "realistic", name: "Realistic", tagline: "Photographic clarity with subtle lighting." },
  { id: "digital", name: "Digital art", tagline: "Bold colors, stylized textures, concept art ready." },
  { id: "watercolor", name: "Watercolor", tagline: "Soft gradients and dreamlike washes." },
];

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
  const { settings } = useSettingsContext();
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedAspect, setSelectedAspect] = useState<AspectRatioOption["id"]>("portrait");
  const [selectedStyle, setSelectedStyle] = useState<StylePreset["id"]>("digital");
  const [selectedGuidance, setSelectedGuidance] = useState<GuidancePreset["id"]>("medium");
  const [seed, setSeed] = useState<string>("");
  const [imageSize, setImageSize] = useState<ImageSizeOption>("1K");
  const [personGeneration, setPersonGeneration] = useState<PersonGenerationOption>("allow_adult");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentGuidance = useMemo(
    () => guidancePresets.find((item) => item.id === selectedGuidance) ?? guidancePresets[1],
    [selectedGuidance]
  );

  const currentStyle = useMemo(
    () => stylePresets.find((preset) => preset.id === selectedStyle) ?? stylePresets[1],
    [selectedStyle]
  );

  const handleClose = () => {
    router.back();
  };

  const handleGenerate = useCallback(async () => {
    if (isGenerating || savingImage) {
      return;
    }

    if (!prompt.trim()) {
      setErrorMessage("Please describe what you’d like to create before generating.");
      Alert.alert("Prompt required", "Enter a prompt to guide Imagen before generating.");
      return;
    }

    const sanitizedSeed = seed.trim();
    const numericSeed = sanitizedSeed.length > 0 ? Number.parseInt(sanitizedSeed, 10) : undefined;
    if (sanitizedSeed.length > 0 && !Number.isFinite(numericSeed)) {
      setErrorMessage("Seed must be a numeric value.");
      Alert.alert("Invalid seed", "Please enter numbers only for the seed value.");
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const aspectOption = aspectRatios.find((ratio) => ratio.id === selectedAspect) ?? aspectRatios[0];
      const { positive, negative } = buildPrompt({
        prompt,
        negativePrompt,
        style: currentStyle ? { name: currentStyle.name, tagline: currentStyle.tagline } : undefined,
        extras: [
          `Aspect ratio ${aspectOption.label}`,
          `Guidance scale ${currentGuidance.value.toFixed(1)}`,
          `Resolution ${imageSize}`,
        ],
      });

      const aspectRatioValue = aspectRatioValueMap[selectedAspect];

      const result = await generateImage({
        prompt: positive,
        negativePrompt: negative,
        aspectRatio: aspectRatioValue,
        guidanceScale: currentGuidance.value,
        seed: numericSeed,
        numberOfImages: 1,
        imageSize,
        personGeneration,
        apiKey: settings?.aiApiKey ?? null,
      });

      const asset = result.assets[0];
      const extension = mimeTypeToExtension(asset.mimeType);

      const record = await saveGeneratedImage({
        prompt: positive,
        base64Data: asset.base64Data,
        extension,
        fileName: asset.fileName,
        metadata: {
          aspectRatio: aspectRatioValue,
          guidanceScale: currentGuidance.value,
          model: result.metadata.model,
          seed: result.metadata.seed ?? numericSeed,
          extras: {
            styleId: currentStyle?.id ?? null,
            styleName: currentStyle?.name ?? null,
            styleTagline: currentStyle?.tagline ?? null,
            imageSize,
            personGeneration,
            negativePrompt: negative ?? null,
          },
        },
      });

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
    currentGuidance,
    currentStyle,
    imageSize,
    isGenerating,
    negativePrompt,
    personGeneration,
    prompt,
    router,
    saveGeneratedImage,
    seed,
    selectedAspect,
    settings?.aiApiKey,
    savingImage,
  ]);

  const handleRandomSeed = () => {
    const random = Math.floor(Math.random() * 10_000).toString();
    setSeed(random);
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
        <Text className="text-xs font-semibold tracking-[0.35em] text-white/60">
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
          <View className="p-6 border rounded-3xl border-white/10 bg-white/5">
            <Text className="text-base font-semibold text-white">
              Bring your vision to life
            </Text>
            <Text className="mt-2 text-sm leading-6 text-white/70">
              Describe the scene, specify the ambience, and Diotrix will orchestrate Gemini to build a masterpiece. Combine guidance scale, aspect ratio, and style to fine-tune the result.
            </Text>

            <Text className="mt-6 text-xs font-semibold tracking-[0.25em] text-white/50">
              MAIN PROMPT
            </Text>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="e.g. Ethereal city floating above the clouds, gleaming neon, volumetric lighting"
              placeholderTextColor="rgba(255,255,255,0.55)"
              multiline
              className="mt-2 min-h-[120px] rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-base text-white"
            />

            <Text className="mt-6 text-xs font-semibold tracking-[0.25em] text-white/50">
              NEGATIVE PROMPT
            </Text>
            <TextInput
              value={negativePrompt}
              onChangeText={setNegativePrompt}
              placeholder="Details to avoid: low contrast, text artifacts, distorted anatomy"
              placeholderTextColor="rgba(255,255,255,0.45)"
              multiline
              className="mt-2 min-h-[80px] rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-base text-white"
            />
          </View>

          <View className="p-6 mt-8 border rounded-3xl border-white/10 bg-white/5">
            <Text className="text-base font-semibold text-white">Aspect ratio</Text>
            <Text className="mt-2 text-sm text-white/70">
              Choose how your canvas will appear in the local gallery, exports, and sharing.
            </Text>
            <View className="flex-row flex-wrap gap-3 mt-4">
              {aspectRatios.map((ratio) => {
                const isActive = ratio.id === selectedAspect;
                return (
                  <Pressable
                    key={ratio.id}
                    onPress={() => setSelectedAspect(ratio.id)}
                    className={`rounded-full border px-4 py-2 ${
                      isActive
                        ? "border-primary-500 bg-primary-500/30"
                        : "border-white/15 bg-white/10"
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-semibold text-white">{ratio.label}</Text>
                      {/* {isActive && <Ionicons name="checkmark" size={14} color="#c4b5fd" />} */}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="p-6 mt-8 border rounded-3xl border-white/10 bg-white/5">
            <Text className="text-base font-semibold text-white">Style presets</Text>
            <Text className="mt-2 text-sm text-white/70">
              Swap between curated looks to jump-start mood and palette. Refine further in the prompt.
            </Text>
            <View className="mt-4 space-y-3">
              {stylePresets.map((preset) => {
                const isActive = preset.id === selectedStyle;
                return (
                  <Pressable
                    key={preset.id}
                    onPress={() => setSelectedStyle(preset.id)}
                    className={`rounded-2xl border px-4 py-4 ${
                      isActive
                        ? "border-primary-500 bg-primary-500/20"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <Text className="text-sm font-semibold text-white">{preset.name}</Text>
                    <Text className="mt-1 text-xs text-white/60">{preset.tagline}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="p-6 mt-8 border rounded-3xl border-white/10 bg-white/5">
            <Text className="text-base font-semibold text-white">Guidance scale</Text>
            <Text className="mt-2 text-sm text-white/70">
              Steer how closely Gemini follows the prompt. Balanced works for most concepts.
            </Text>
            <View className="mt-4 space-y-3">
              {guidancePresets.map((preset) => {
                const isActive = preset.id === selectedGuidance;
                return (
                  <Pressable
                    key={preset.id}
                    onPress={() => setSelectedGuidance(preset.id)}
                    className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                      isActive
                        ? "border-primary-500 bg-primary-500/20"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <View>
                      <Text className="text-sm font-semibold text-white">{preset.label}</Text>
                      <Text className="mt-1 text-xs text-white/60">{preset.description}</Text>
                    </View>
                    <Text className="text-sm font-semibold text-primary-50">
                      {preset.value.toFixed(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="p-4 mt-6 border rounded-2xl border-white/10 bg-white/5">
              <Text className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                CURRENT SETTINGS
              </Text>
              <View className="mt-3 space-y-2">
                <Text className="text-sm text-white/80">
                  • Style · <Text className="font-semibold text-white">{currentStyle.name}</Text>
                </Text>
                <Text className="text-sm text-white/80">
                  • Guidance · <Text className="font-semibold text-white">{currentGuidance.label}</Text> ({currentGuidance.value.toFixed(1)})
                </Text>
                <Text className="text-sm text-white/80">
                  • Aspect · <Text className="font-semibold text-white">{aspectRatios.find((ratio) => ratio.id === selectedAspect)?.label ?? "1 : 1"}</Text>
                </Text>
              </View>
            </View>
          </View>

          <View className="p-6 mt-8 border rounded-3xl border-white/10 bg-white/5">
            <Text className="text-base font-semibold text-white">Output settings</Text>
            <Text className="mt-2 text-sm text-white/70">
              Tune Imagen’s output resolution and whether people can appear in your render.
            </Text>

            <View className="mt-4 space-y-3">
              {imageSizeOptions.map((option) => {
                const isActive = option.id === imageSize;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setImageSize(option.id)}
                    className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                      isActive ? "border-primary-500 bg-primary-500/20" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <View>
                      <Text className="text-sm font-semibold text-white">{option.label}</Text>
                      <Text className="mt-1 text-xs text-white/60">{option.description}</Text>
                    </View>
                    {isActive && <Ionicons name="checkmark-circle" size={20} color="#c4b5fd" />}
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-5 space-y-3">
              {personPolicies.map((policy) => {
                const isActive = policy.id === personGeneration;
                return (
                  <Pressable
                    key={policy.id}
                    onPress={() => setPersonGeneration(policy.id)}
                    className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                      isActive ? "border-primary-500 bg-primary-500/20" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <View>
                      <Text className="text-sm font-semibold text-white">{policy.label}</Text>
                      <Text className="mt-1 text-xs text-white/60">{policy.description}</Text>
                    </View>
                    {isActive && <Ionicons name="checkmark-circle" size={20} color="#c4b5fd" />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="p-6 mt-8 border rounded-3xl border-white/10 bg-white/5">
            <Text className="text-base font-semibold text-white">Seed & reproducibility</Text>
            <Text className="mt-2 text-sm text-white/70">
              Pin a seed to recreate a look later, or leave blank to let Gemini explore new variations.
            </Text>
            <View className="flex-row items-center gap-3 mt-4">
              <TextInput
                value={seed}
                onChangeText={setSeed}
                placeholder="Random"
                placeholderTextColor="rgba(255,255,255,0.45)"
                keyboardType="number-pad"
                className="flex-1 px-4 py-3 text-white border rounded-2xl border-white/15 bg-white/5"
              />
              <Pressable
                onPress={handleRandomSeed}
                className="px-4 py-3 border rounded-2xl border-primary-500/40 bg-primary-500/15"
              >
                <Text className="text-sm font-semibold text-primary-50">Randomize</Text>
              </Pressable>
            </View>
          </View>

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
                  {isGenerating || savingImage ? "Generating…" : "Generate with Imagen"}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleClose}
              className="items-center px-4 py-3 border rounded-full border-white/15 bg-white/5"
            >
              <Text className="text-sm font-semibold text-white/70">
                Save draft & exit
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}