import AsyncStorage from "@react-native-async-storage/async-storage";

import type { StorageAdapter, StorageGetOptions, StorageKeyPrefix } from "./types";

const DEFAULT_PREFIX = "@diotrix:";

const createPrefixedKey = (key: string, prefix: StorageKeyPrefix = DEFAULT_PREFIX) => `${prefix}${key}`;

const serialize = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error("[storage] Failed to serialize value", error);
    throw new Error("Unable to save data locally. Please try again.");
  }
};

const deserialize = <T>(value: string | null): T | null => {
  if (value === null) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    // If the value wasn't JSON, return as string cast to T
    return value as unknown as T;
  }
};

const setItem = async <T>(
  key: string,
  value: T,
  prefix: StorageKeyPrefix = DEFAULT_PREFIX
): Promise<void> => {
  const namespacedKey = createPrefixedKey(key, prefix);
  const serializedValue = serialize(value);
  await AsyncStorage.setItem(namespacedKey, serializedValue);
};

const getItem = async <T>(key: string, options?: StorageGetOptions<T>): Promise<T | null> => {
  const prefix = options?.prefix ?? DEFAULT_PREFIX;
  const namespacedKey = createPrefixedKey(key, prefix);
  const rawValue = await AsyncStorage.getItem(namespacedKey);
  const parsedValue = deserialize<T>(rawValue);

  if (parsedValue === null && options?.fallback !== undefined) {
    return options.fallback;
  }

  return parsedValue;
};

const removeItem = async (key: string, prefix: StorageKeyPrefix = DEFAULT_PREFIX): Promise<void> => {
  const namespacedKey = createPrefixedKey(key, prefix);
  await AsyncStorage.removeItem(namespacedKey);
};

const clearByPrefix = async (prefix: StorageKeyPrefix = DEFAULT_PREFIX): Promise<void> => {
  const keys = await AsyncStorage.getAllKeys();
  const keysToDelete = keys.filter((storedKey) => storedKey.startsWith(prefix));

  if (keysToDelete.length === 0) {
    return;
  }

  await AsyncStorage.multiRemove(keysToDelete);
};

export const asyncStorageService: StorageAdapter = {
  setItem,
  getItem,
  removeItem,
  clearByPrefix,
};

export type AsyncStorageService = typeof asyncStorageService;

export const storageKeys = {
  settings: "settings",
};