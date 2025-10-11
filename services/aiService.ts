import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "imagen-4.0-generate-001";

export type AspectRatio = "1:1" | "3:4" | "4:3" | "16:9" | "9:16";

export interface ImageGenerationMetadata {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  numberOfImages: number;
  guidanceScale?: number;
  seed?: number;
  model: string;
  imageSize?: "1K" | "2K";
  personGeneration?: "dont_allow" | "allow_adult";
}

export interface GeneratedImageAsset {
  base64Data: string;
  mimeType: string;
  fileName: string;
  seed?: number;
}

export interface GenerateImageResult {
  assets: GeneratedImageAsset[];
  metadata: ImageGenerationMetadata;
}

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: AspectRatio;
  guidanceScale?: number;
  candidateCount?: number;
  seed?: number;
  outputMimeType?: "image/png" | "image/jpeg" | "image/webp";
  apiKey?: string | null;
  numberOfImages?: number;
  imageSize?: "1K" | "2K";
  personGeneration?: "dont_allow" | "allow_adult";
}

export class InvalidApiKeyError extends Error {
  constructor(message = "The provided Google Imagen API key appears to be invalid.") {
    super(message);
    this.name = "InvalidApiKeyError";
  }
}

type ImagenImagePayload = {
  image?: string | { imageBytes?: string };
  base64Data?: string;
  content?: { base64Data?: string };
  mimeType?: string;
  fileName?: string;
  seed?: number;
};

type ImagenGenerateResponse = {
  generatedImages?: ImagenImagePayload[];
};

const isInvalidApiKeyError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  const candidate = error as {
    status?: number;
    code?: string | number;
    cause?: { status?: number; code?: string | number; message?: string };
    message?: string;
  };

  const status = candidate.status ?? candidate.cause?.status;
  if (status === 401 || status === 403) {
    return true;
  }

  const code = candidate.code ?? candidate.cause?.code;
  if (typeof code === "string" && ["invalid_api_key", "permission_denied", "unauthorized"].includes(code.toLowerCase())) {
    return true;
  }

  const message = candidate.message ?? candidate.cause?.message ?? (error instanceof Error ? error.message : String(error));
  if (!message) {
    return false;
  }

  return /api key/i.test(message) && /(invalid|unauthorized|missing|expired|permission)/i.test(message);
};

const resolveApiKey = (override?: string | null): string => {
  if (override && override.trim().length > 0) {
    return override.trim();
  }

  const envKey =
    process.env.EXPO_PUBLIC_GOOGLE_AI_KEY ??
    process.env.EXPO_PUBLIC_IMAGEN_API_KEY ??
    process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!envKey) {
    throw new Error(
      "Missing Google Imagen API key. Set EXPO_PUBLIC_GOOGLE_AI_KEY (or EXPO_PUBLIC_IMAGEN_API_KEY) in your environment."
    );
  }

  return envKey;
};

const removeUndefined = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefined(item)) as unknown as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([key, v]) => [key, removeUndefined(v)] as const);
    return Object.fromEntries(entries) as T;
  }

  return value;
};

const toGeneratedAsset = (
  item: ImagenImagePayload,
  fallbackMimeType: string,
  index: number
): GeneratedImageAsset | null => {
  const inlineBase64 = typeof item?.base64Data === "string" ? item.base64Data : undefined;
  const contentBase64 = typeof item?.content?.base64Data === "string" ? item.content.base64Data : undefined;

  let imageBase64: string | undefined;
  if (typeof item?.image === "string") {
    imageBase64 = item.image;
  } else if (item?.image && typeof item.image === "object") {
    imageBase64 = item.image.imageBytes;
  }

  const resolvedBase64 = inlineBase64 ?? contentBase64 ?? imageBase64 ?? "";

  if (!resolvedBase64) {
    return null;
  }

  const mimeType = item?.mimeType ?? fallbackMimeType;
  const seedValue = typeof item?.seed === "number" ? item?.seed : undefined;
  const fileName = item?.fileName ?? `diotrix-${Date.now()}-${index}`;

  return {
    base64Data: resolvedBase64,
    mimeType,
    seed: seedValue,
    fileName,
  };
};

export const generateImage = async (options: GenerateImageOptions): Promise<GenerateImageResult> => {
  const {
    prompt,
    negativePrompt,
    aspectRatio = "1:1",
    guidanceScale,
    candidateCount = 1,
    seed,
    outputMimeType = "image/png",
    apiKey,
    numberOfImages,
    imageSize,
    personGeneration,
  } = options;

  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty when generating an image.");
  }

  const resolvedNumberOfImages = Math.min(Math.max(numberOfImages ?? candidateCount ?? 1, 1), 4);

  const ai = new GoogleGenAI({
    apiKey: resolveApiKey(apiKey),
  });

  let response: ImagenGenerateResponse | undefined;

  try {
    const config = removeUndefined({
      numberOfImages: resolvedNumberOfImages,
      aspectRatio,
      guidanceScale,
      seed,
      outputMimeType,
      imageSize,
      personGeneration,
    }) as Record<string, unknown>;

    const requestPayload = removeUndefined({
      model: MODEL_NAME,
      prompt,
      negativePrompt,
      config,
    }) as Record<string, unknown>;

    const sdkResponse = await ai.models.generateImages(requestPayload as never);
    response = {
      generatedImages: (sdkResponse.generatedImages ?? []).map((generated) => ({
        image: generated.image,
        mimeType: (generated as { mimeType?: string }).mimeType,
        seed: (generated as { seed?: number }).seed,
      })),
    };
  } catch (error) {
    if (isInvalidApiKeyError(error)) {
      throw new InvalidApiKeyError();
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to generate image with Imagen.");
  }

  const assets = (response?.generatedImages ?? [])
    .map((item, index) => toGeneratedAsset(item, outputMimeType, index))
    .filter((asset): asset is GeneratedImageAsset => Boolean(asset));

  const primaryAsset = assets[0];

  if (!primaryAsset) {
    throw new Error("Imagen API returned an empty response. Try adjusting the prompt or parameters.");
  }

  return {
    assets: [primaryAsset],
    metadata: {
      prompt,
      negativePrompt,
      aspectRatio,
      guidanceScale,
      seed,
      numberOfImages: resolvedNumberOfImages,
      model: MODEL_NAME,
      imageSize,
      personGeneration,
    },
  };
};

export type { GenerateImageOptions as ImageGenerationOptions };
