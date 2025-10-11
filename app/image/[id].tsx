import BackgroundStars from "@/components/ui/BackgroundStars";
import { getImageRecordById, type ImageRecord } from "@/services/databaseService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const toNumber = (value: string | string[] | undefined): number | null => {
  if (!value) {
    return null;
  }
  const resolved = Array.isArray(value) ? value[0] : value;
  const numeric = Number(resolved);
  return Number.isFinite(numeric) ? numeric : null;
};

const extractAspectRatio = (input?: string | null): number => {
  if (!input) {
    return 1;
  }

  const [widthPart, heightPart] = input.split(":");
  const width = Number(widthPart);
  const height = Number(heightPart);

  if (!Number.isFinite(width) || !Number.isFinite(height) || height === 0) {
    return 1;
  }

  return width / height;
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const summarizeValue = (value?: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return null;
};

const ImageScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageId = toNumber(params.id);

  const [record, setRecord] = useState<ImageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!imageId) {
      setError(new Error("Missing image identifier."));
      setLoading(false);
      return;
    }

    let isMounted = true;
    const loadRecord = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetched = await getImageRecordById(imageId);
        if (isMounted) {
          setRecord(fetched);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load image."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadRecord();

    return () => {
      isMounted = false;
    };
  }, [imageId]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const detailItems = useMemo(() => {
    if (!record) {
      return [] as { label: string; value: string }[];
    }

    const extras = record.metadata?.extras as Record<string, unknown> | undefined;

    const candidates: { label: string; value: string | null }[] = [
      { label: "Aspect Ratio", value: summarizeValue(record.metadata?.aspectRatio) },
      {
        label: "Guidance Scale",
        value:
          typeof record.metadata?.guidanceScale === "number"
            ? record.metadata.guidanceScale.toFixed(1)
            : null,
      },
      { label: "Style", value: summarizeValue(extras?.styleName) },
      { label: "Model", value: summarizeValue(record.metadata?.model) },
      { label: "Resolution", value: summarizeValue(extras?.imageSize) },
      { label: "Person Policy", value: summarizeValue(extras?.personGeneration) },
      { label: "Seed", value: summarizeValue(record.metadata?.seed) },
      { label: "Created", value: formatDateTime(record.createdAt) },
    ];

    return candidates
      .filter((item) => item.value && item.value.trim().length > 0)
      .map((item) => ({ label: item.label, value: item.value as string }));
  }, [record]);

  const negativePrompt = useMemo(() => {
    const extras = record?.metadata?.extras as Record<string, unknown> | undefined;
    return typeof extras?.negativePrompt === "string" && extras.negativePrompt.trim().length > 0
      ? extras.negativePrompt.trim()
      : null;
  }, [record]);

  const aspectRatio = useMemo(() => extractAspectRatio(record?.metadata?.aspectRatio ?? null), [
    record?.metadata?.aspectRatio,
  ]);

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <BackgroundStars />
      <View className="px-6 pt-6">
        <Pressable
          onPress={handleGoBack}
          className="flex-row items-center gap-2 px-4 py-2 border rounded-full border-white/10 bg-white/5"
        >
          <Ionicons name="chevron-back" size={16} color="#ffffff" />
          <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Back</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="items-center justify-center flex-1 gap-3">
          <ActivityIndicator size="small" color="#c4b5fd" />
          <Text className="text-xs text-white/60">Loading image details…</Text>
        </View>
      ) : error ? (
        <View className="items-center justify-center flex-1 px-6 text-center">
          <Text className="text-base font-semibold text-white">Could not load image.</Text>
          <Text className="mt-2 text-sm text-white/70">{error.message}</Text>
        </View>
      ) : !record ? (
        <View className="items-center justify-center flex-1 px-6 text-center">
          <Text className="text-base font-semibold text-white">Image not found</Text>
          <Text className="mt-2 text-sm text-white/70">Head back to the gallery and try again.</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-24"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 mt-6">
            <View className="overflow-hidden border rounded-3xl border-white/10 bg-white/5">
              <Image
                source={{ uri: record.uri }}
                style={{ aspectRatio }}
                className="w-full bg-white/5"
              />
            </View>
          </View>

          <View className="px-6 mt-8">
            <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Prompt</Text>
            <Text className="mt-3 text-base leading-7 text-white">{record.prompt}</Text>
          </View>

          {negativePrompt && (
            <View className="px-6 mt-6">
              <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                Negative prompt
              </Text>
              <Text className="mt-3 text-sm leading-6 text-white/80">{negativePrompt}</Text>
            </View>
          )}

          <View className="px-6 mt-8">
            <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Image details</Text>
            <View className="p-5 mt-4 border rounded-3xl border-white/10 bg-white/5">
              {detailItems.length === 0 ? (
                <Text className="text-sm text-white/70">No additional metadata saved for this artwork.</Text>
              ) : (
                <View className="gap-4">
                  {detailItems.map((item) => (
                    <View key={item.label} className="flex-row items-baseline justify-between gap-4">
                      <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                        {item.label}
                      </Text>
                      <Text className="flex-1 text-sm font-semibold text-right text-white">{item.value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ImageScreen;