import { useCallback, useEffect, useMemo, useState } from "react";

import { asyncStorageService, storageKeys } from "@/services/asyncStorage";

export type ThemePreference = "light" | "dark";

export interface StoredSettings {
  theme: ThemePreference;
  aiApiKey: string;
  showOnboarding: boolean;
  isTrialVersion: boolean;
  remainingCredits?: number;
  lastUpdatedAt: string;
}

export type UpdateSettingsInput = Partial<Omit<StoredSettings, "lastUpdatedAt">>;

export const createDefaultSettings = (): StoredSettings => {
  const now = new Date().toISOString();
  return {
    theme: "dark",
    aiApiKey: "",
    showOnboarding: true,
    isTrialVersion: true,
    remainingCredits: 5,
    lastUpdatedAt: now,
  };
};

const mergeSettings = (current: StoredSettings | null, updates: UpdateSettingsInput): StoredSettings => {
  const now = new Date().toISOString();
  const base = current ?? createDefaultSettings();

  return {
    theme: updates.theme ?? base.theme,
    aiApiKey: updates.aiApiKey?.trim() ?? base.aiApiKey,
    showOnboarding: updates.showOnboarding ?? base.showOnboarding,
    isTrialVersion: updates.isTrialVersion ?? base.isTrialVersion,
    remainingCredits: updates.remainingCredits ?? base.remainingCredits,
    lastUpdatedAt: now,
  };
};

export const useSettingsStorage = () => {
  const [settings, setSettings] = useState<StoredSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const storedSettings = await asyncStorageService.getItem<StoredSettings>(storageKeys.settings, {
        fallback: createDefaultSettings(),
      });
      setSettings(storedSettings);
      return storedSettings;
    } catch (err) {
      const normalizedError = err instanceof Error ? err : new Error("Failed to load settings");
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  const updateSettings = useCallback(
    async (updates: UpdateSettingsInput): Promise<StoredSettings> => {
      setSaving(true);
      setError(null);

      try {
        const merged = mergeSettings(settings, updates);
        await asyncStorageService.setItem(storageKeys.settings, merged);
        setSettings(merged);
        return merged;
      } catch (err) {
        const normalizedError = err instanceof Error ? err : new Error("Failed to save settings");
        setError(normalizedError);
        throw normalizedError;
      } finally {
        setSaving(false);
      }
    },
    [settings]
  );

  const clearSettings = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      await asyncStorageService.removeItem(storageKeys.settings);
      const defaults = createDefaultSettings();
      setSettings(defaults);
      return defaults;
    } catch (err) {
      const normalizedError = err instanceof Error ? err : new Error("Failed to clear settings");
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setSaving(false);
    }
  }, []);

  const hasCustomAiKey = useMemo(() => Boolean(settings && settings.aiApiKey.length > 0), [settings]);
  const shouldShowOnboarding = useMemo(() => settings?.showOnboarding ?? true, [settings]);

  return {
    settings,
    loading,
    saving,
    error,
    hasCustomAiKey,
    shouldShowOnboarding,
    refreshSettings,
    updateSettings,
    clearSettings,
  };
};
