import BackgroundStars from "@/components/ui/BackgroundStars";
import { useSettingsContext } from "@/context/SettingsContext";
import { useGalleryStorage } from "@/hooks/useGalleryStorage";
import { getImageRecordById, type ImageRecord } from "@/services/databaseService";
import { getThemePalette } from "@/utils/themePalette";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";

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
  const { settings } = useSettingsContext();

  const [record, setRecord] = useState<ImageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingToDevice, setSavingToDevice] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);
  const fullscreenScale = useSharedValue(1);
  const fullscreenSavedScale = useSharedValue(1);
  const { deleteImage, saving: gallerySaving } = useGalleryStorage();

  const selectedTheme = settings?.theme ?? "light";
  const isDarkTheme = selectedTheme === "dark";
  const themePalette = useMemo(() => getThemePalette(selectedTheme), [selectedTheme]);

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

  const handleOpenFullscreen = useCallback(() => {
    if (!record) {
      return;
    }
    setFullscreenVisible(true);
  }, [record]);

  const handleCloseFullscreen = useCallback(() => {
    setFullscreenVisible(false);
    fullscreenScale.value = 1;
    fullscreenSavedScale.value = 1;
  }, [fullscreenScale, fullscreenSavedScale]);

  const handlePerformDelete = useCallback(async () => {
    if (!record) {
      return;
    }

    try {
      setDeleting(true);
      await deleteImage(record.id);
      router.replace("/(tabs)/home");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete image.";
      Alert.alert("Delete failed", message);
    } finally {
      setDeleting(false);
    }
  }, [deleteImage, record, router]);

  const handleDeleteImage = useCallback(() => {
    if (!record || deleting || gallerySaving) {
      return;
    }

    Alert.alert(
      "Delete this image?",
      "This will remove the artwork from your gallery permanently.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void handlePerformDelete();
          },
        },
      ]
    );
  }, [deleting, gallerySaving, handlePerformDelete, record]);

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onBegin(() => {
          fullscreenSavedScale.value = fullscreenScale.value;
        })
        .onUpdate((event) => {
          const nextScale = fullscreenSavedScale.value * event.scale;
          fullscreenScale.value = Math.min(Math.max(nextScale, 1), 4);
        })
        .onEnd(() => {
          fullscreenSavedScale.value = fullscreenScale.value;
        })
        .onFinalize(() => {
          if (fullscreenScale.value < 1) {
            fullscreenScale.value = 1;
            fullscreenSavedScale.value = 1;
          }
        }),
    [fullscreenSavedScale, fullscreenScale]
  );

  const fullscreenImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fullscreenScale.value }],
  }));

  const handleSaveToDevice = useCallback(async () => {
    if (!record?.uri || savingToDevice) {
      return;
    }

    try {
      setSavingToDevice(true);
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Allow Diotrix to save images to your media library.");
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(record.uri);
      try {
        await MediaLibrary.createAlbumAsync("Diotrix", asset, false);
      } catch (albumError) {
        if (albumError instanceof Error && albumError.message.includes("existing")) {
          // Album already exists; saving the asset is sufficient.
        }
      }
      Alert.alert("Saved", "Image saved to your photo library.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save image.";
      Alert.alert("Save failed", message);
    } finally {
      setSavingToDevice(false);
    }
  }, [record, savingToDevice]);

  const handleShareImage = useCallback(async () => {
    if (!record?.uri || sharingImage) {
      return;
    }

    try {
      setSharingImage(true);
      await Share.share({ url: record.uri });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to share image.";
      if (message && !message.includes("canceled")) {
        Alert.alert("Share failed", message);
      }
    } finally {
      setSharingImage(false);
    }
  }, [record, sharingImage]);

  return (
    <SafeAreaView className={`flex-1 ${themePalette.background}`} edges={["top", "bottom"]}>
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
      <BackgroundStars />
      <View className="flex-row items-center justify-between gap-4 px-6 pt-6">
        <Pressable
          onPress={handleGoBack}
          className={`flex-row items-center gap-2 px-4 py-2 border rounded-full ${themePalette.border} ${themePalette.surface}`}
        >
          <Ionicons name="chevron-back" size={16} color={isDarkTheme ? "#ffffff" : "#0f172a"} />
          <Text className={`text-xs font-semibold uppercase tracking-[0.2em] ${themePalette.textSecondary}`}>Back</Text>
        </Pressable>
        {record && (
          <Text 
            className={`flex-1 text-sm font-medium ${themePalette.textSecondary}`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {record.prompt}
          </Text>
        )}
      </View>

      {loading ? (
        <View className="items-center justify-center flex-1 gap-3">
          <ActivityIndicator size="small" color="#c4b5fd" />
          <Text className={`text-xs ${themePalette.textMuted}`}>Loading image details…</Text>
        </View>
      ) : error ? (
        <View className="items-center justify-center flex-1 px-6 text-center">
          <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>Could not load image.</Text>
          <Text className={`mt-2 text-sm ${themePalette.textSecondary}`}>{error.message}</Text>
        </View>
      ) : !record ? (
        <View className="items-center justify-center flex-1 px-6 text-center">
          <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>Image not found</Text>
          <Text className={`mt-2 text-sm ${themePalette.textSecondary}`}>Head back to the gallery and try again.</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-24"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 mt-6">
            <Pressable
              onPress={handleOpenFullscreen}
              accessibilityRole="imagebutton"
              accessibilityLabel="Open image in fullscreen"
              className={`overflow-hidden border rounded-3xl ${themePalette.border} ${themePalette.surface}`}
            >
              <Image
                source={{ uri: record.uri }}
                style={{ aspectRatio }}
                className={`w-full ${themePalette.surface}`}
              />
            </Pressable>
          </View>

          <View className="px-6 mt-8">
            <Text className={`text-xs font-semibold uppercase tracking-[0.25em] ${themePalette.textMuted}`}>Prompt</Text>
            <Text className={`mt-3 text-base leading-7 ${themePalette.textPrimary}`}>{record.prompt}</Text>
          </View>

          {negativePrompt && (
            <View className="px-6 mt-6">
              <Text className={`text-xs font-semibold uppercase tracking-[0.25em] ${themePalette.textMuted}`}>
                Negative prompt
              </Text>
              <Text className={`mt-3 text-sm leading-6 ${themePalette.textSecondary}`}>{negativePrompt}</Text>
            </View>
          )}

          <View className="px-6 mt-8">
            <Text className={`text-xs font-semibold uppercase tracking-[0.25em] ${themePalette.textMuted}`}>Image details</Text>
            <View className={`p-5 mt-4 border rounded-3xl ${themePalette.border} ${themePalette.card}`}>
              {detailItems.length === 0 ? (
                <Text className={`text-sm ${themePalette.textSecondary}`}>No additional metadata saved for this artwork.</Text>
              ) : (
                <View className="gap-4">
                  {detailItems.map((item) => (
                    <View key={item.label} className="flex-row items-baseline justify-between gap-4">
                      <Text className={`text-xs font-semibold uppercase tracking-[0.2em] ${themePalette.textMuted}`}>
                        {item.label}
                      </Text>
                      <Text className={`flex-1 text-sm font-semibold text-right ${themePalette.textPrimary}`}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View className="px-6 mt-10">
            <Pressable
              onPress={handleDeleteImage}
              disabled={deleting || gallerySaving}
              className={`flex-row items-center justify-center gap-2 rounded-full border border-red-400/40 bg-red-500/15 px-5 py-4 ${
                deleting || gallerySaving ? "opacity-60" : ""
              }`}
              accessibilityRole="button"
              accessibilityLabel="Delete this image"
            >
              {(deleting || gallerySaving) ? (
                <ActivityIndicator size="small" color="#fecaca" />
              ) : (
                <Ionicons name="trash" size={18} color="#f87171" />
              )}
              <Text className={`text-sm font-semibold ${settings?.theme === "dark" ? "text-red-200" : "text-red-500"}`}>Delete from gallery</Text>
            </Pressable>
          </View>

        </ScrollView>
      )}

      <Modal visible={fullscreenVisible} transparent animationType="fade" onRequestClose={handleCloseFullscreen}>
        <GestureHandlerRootView className="flex-1">
          <View className="flex-1 bg-black/95">
            <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
              <View className="flex-row items-center justify-between px-6 pt-6">
                <Pressable
                  onPress={handleCloseFullscreen}
                  className={`flex-row items-center gap-2 px-4 py-2 border rounded-full ${themePalette.border} ${themePalette.surface}`}
                  accessibilityLabel="Close fullscreen image"
                >
                  <Ionicons name="close" size={18} color={isDarkTheme ? "#ffffff" : "#0f172a"} />
                  <Text className={`text-xs font-semibold uppercase tracking-[0.2em] ${themePalette.textSecondary}`}>
                    Close
                  </Text>
                </Pressable>
              </View>

              <View className="items-center justify-center flex-1 px-6 pb-10">
                <GestureDetector gesture={pinchGesture}>
                  <Animated.View className="w-full">
                    <Animated.Image
                      source={{ uri: record?.uri }}
                      style={[
                        fullscreenImageStyle,
                        {
                          width: "100%",
                          aspectRatio: aspectRatio || 1,
                        },
                      ]}
                      className={`border rounded-3xl ${themePalette.border} ${themePalette.surface}`}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </GestureDetector>
              </View>

              <View className="flex-row items-center gap-4 px-6 pb-6">
                <Pressable
                  onPress={handleSaveToDevice}
                  disabled={savingToDevice}
                  className={`flex-1 flex-row items-center justify-center gap-2 rounded-full border px-4 py-3 ${themePalette.border} ${themePalette.surface} ${
                    savingToDevice ? "opacity-60" : ""
                  }`}
                >
                  {savingToDevice ? (
                    <ActivityIndicator size="small" color="#c4b5fd" />
                  ) : (
                    <Ionicons name="download-outline" size={18} color={isDarkTheme ? "#ffffff" : "#0f172a"} />
                  )}
                  <Text
                    className={`text-sm font-semibold ${themePalette.textSecondary}`}
                  >
                    Save to gallery
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleShareImage}
                  disabled={sharingImage}
                  className={`flex-1 flex-row items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-3 ${
                    sharingImage ? "opacity-75" : ""
                  }`}
                >
                  {sharingImage ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="share-outline" size={18} color="#ffffff" />
                  )}
                  <Text className="text-sm font-semibold text-white">Share</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </SafeAreaView>
  );
};

export default ImageScreen;