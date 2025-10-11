import BackgroundStars from "@/components/ui/BackgroundStars";
import { useGalleryStorage, type GalleryImageRecord } from "@/hooks/useGalleryStorage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList, type FlashListProps } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { images: galleryImages, loading: galleryLoading, hasImages } = useGalleryStorage();

  const MasonryFlashList = FlashList as unknown as React.ComponentType<
    FlashListProps<GalleryImageRecord> & { masonry?: boolean; estimatedItemSize?: number }
  >;

  const handleOpenGalleryImage = useCallback(
    (id: number) => {
      router.push({
        pathname: "/image/[id]",
        params: { id: String(id) },
      });
    },
    [router]
  );

  const handleLaunchCreate = useCallback(() => {
    router.push("/createImageModal");
  }, [router]);

  const extractAspectRatio = useCallback((ratio?: string | null): number => {
    if (!ratio) {
      return 1;
    }

    const [widthPart, heightPart] = ratio.split(":");
    const width = Number(widthPart);
    const height = Number(heightPart);

    if (!Number.isFinite(width) || !Number.isFinite(height) || height === 0) {
      return 1;
    }

    return width / height;
  }, []);

  const renderGalleryItem = useCallback(
    ({ item }: { item: GalleryImageRecord }) => {
      const aspectRatio = extractAspectRatio(item.metadata?.aspectRatio ?? null);

      return (
        <Pressable
          onPress={() => handleOpenGalleryImage(item.id)}
          className="mx-2 mb-3 overflow-hidden border rounded-3xl border-white/10 bg-white/5"
        >
          <Image
            source={{ uri: item.uri }}
            style={{ aspectRatio }}
            className="w-full bg-white/10"
          />
        </Pressable>
      );
    },
    [extractAspectRatio, handleOpenGalleryImage]
  );

  const header = useMemo(
    () => (
      <View className="pt-10 pb-6">
        <Text className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
          Welcome back
        </Text>
        <Text className="mt-2 text-3xl font-semibold text-white">Ready to create?</Text>
        <Text className="mt-3 text-sm text-white/70">
          Spin up a new Imagen prompt or revisit your latest gallery entries below.
        </Text>
        <Pressable
          onPress={handleLaunchCreate}
          className="flex-row items-center justify-center gap-2 px-6 py-4 mt-6 rounded-full bg-primary-600"
          accessibilityLabel="Open the prompt studio"
        >
          <Ionicons name="flash" size={18} color="#fff" />
          <Text className="text-base font-semibold text-white">Create a new image</Text>
        </Pressable>
      </View>
    ),
    [handleLaunchCreate]
  );

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <BackgroundStars />
      {galleryLoading ? (
        <View className="items-center justify-center flex-1 gap-3">
          <ActivityIndicator size="small" color="#c4b5fd" />
          <Text className="text-xs text-white/60">Loading your gallery…</Text>
        </View>
      ) : hasImages ? (
        <MasonryFlashList
          data={galleryImages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderGalleryItem}
          estimatedItemSize={220}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          className="px-6 pb-6"
          ListHeaderComponent={header}
          masonry
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-1 justify-between"
          showsVerticalScrollIndicator={false}
        >
          {header}
          <View className="items-center justify-center flex-1 px-6">
            <Ionicons name="images-outline" size={36} color="rgba(255,255,255,0.65)" />
            <Text className="mt-6 text-lg font-semibold text-white">Create your first image</Text>
            <Text className="mt-2 text-sm leading-6 text-center text-white/70">
              Unlock your personal gallery by generating a fresh concept with Imagen.
            </Text>
            <Pressable
              onPress={handleLaunchCreate}
              className="flex-row items-center gap-2 px-5 py-3 mt-6 border rounded-full border-primary-500/40 bg-primary-500/15"
            >
              <Ionicons name="flash" size={16} color="#c4b5fd" />
              <Text className="text-sm font-semibold text-primary-100">Create an image</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}