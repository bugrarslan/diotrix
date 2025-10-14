import { Directory, File, Paths } from "expo-file-system";

export interface SaveImageOptions {
  base64Data: string;
  extension?: "png" | "jpg" | "jpeg" | "webp";
  fileName?: string;
  directoryName?: string;
}

export interface SaveImageResult {
  uri: string;
  fileName: string;
}

const DEFAULT_DIRECTORY = "diotrix/gallery";

const splitDirectorySegments = (input: string): string[] =>
  input
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

const sanitizeExtension = (value?: string): "png" | "jpg" | "jpeg" | "webp" => {
  const normalized = value?.toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg" || normalized === "png" || normalized === "webp") {
    return normalized;
  }
  return "png";
};

const resolveBaseDirectory = (): Directory => {
  const documentDirectory = Paths.document;
  if (documentDirectory?.uri) {
    return documentDirectory;
  }

  const cacheDirectory = Paths.cache;
  if (cacheDirectory?.uri) {
    return cacheDirectory;
  }

  throw new Error("Unable to resolve a writable directory for image storage.");
};

const createDirectory = (base: Directory, directoryName?: string): Directory => {
  const segments = splitDirectorySegments(directoryName ?? DEFAULT_DIRECTORY);
  return new Directory(base, ...segments);
};

const ensureDirectoryExists = (directory: Directory): void => {
  try {
    directory.create({ intermediates: true, idempotent: true });
  } catch (error) {
    if (!directory.exists) {
      throw error;
    }
  }
};

const generateFileName = (extension: string, explicitName?: string): string => {
  const slug = explicitName?.replace(/\s+/g, "-").replace(/[^a-z0-9-_]/gi, "").toLowerCase();
  if (slug && slug.length > 0) {
    return `${slug}.${extension}`;
  }
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return `diotrix-${uniqueSuffix}.${extension}`;
};

export const saveImageToGallery = async (options: SaveImageOptions): Promise<SaveImageResult> => {
  const { base64Data, extension, fileName, directoryName } = options;
  if (!base64Data) {
    throw new Error("Cannot save an empty image payload.");
  }

  const resolvedExtension = sanitizeExtension(extension);
  const baseDir = resolveBaseDirectory();
  const galleryDirectory = createDirectory(baseDir, directoryName);
  ensureDirectoryExists(galleryDirectory);

  const resolvedFileName = generateFileName(resolvedExtension, fileName);
  const file = new File(galleryDirectory, resolvedFileName);
  file.create({ overwrite: true });
  file.write(base64Data, { encoding: "base64" });

  return {
    uri: file.uri,
    fileName: resolvedFileName,
  };
};

export const deleteImageFromGallery = async (uri: string): Promise<void> => {
  if (!uri) {
    return;
  }

  try {
    const file = new File(uri);
    if (!file.exists) {
      return;
    }
    file.delete();
  } catch (error) {
    console.warn("[imageStorage] Failed to delete image", error);
  }
};

export const clearGalleryDirectory = async (directoryName?: string): Promise<void> => {
  const baseDir = resolveBaseDirectory();
  const galleryDirectory = createDirectory(baseDir, directoryName);

  try {
    if (galleryDirectory.exists) {
      galleryDirectory.delete();
    }
    ensureDirectoryExists(galleryDirectory);
  } catch (error) {
    console.warn("[imageStorage] Failed to clear gallery directory", error);
  }
};
