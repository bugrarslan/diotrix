import React, { createContext, useContext, type PropsWithChildren } from "react";

import { useSettingsStorage } from "@/hooks/useSettingsStorage";

export type SettingsContextValue = ReturnType<typeof useSettingsStorage>;

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const storage = useSettingsStorage();

  return <SettingsContext.Provider value={storage}>{children}</SettingsContext.Provider>;
};

export const useSettingsContext = (): SettingsContextValue => {
  const contextValue = useContext(SettingsContext);

  if (!contextValue) {
    throw new Error("useSettingsContext must be used within a SettingsProvider");
  }

  return contextValue;
};
