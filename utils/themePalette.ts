export type ThemePalette = {
  background: string;
  surface: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
};

export function getThemePalette(theme?: string): ThemePalette {
  const isDark = theme === "dark";

  if (isDark) {
    return {
      background: "bg-dark-background",
      surface: "bg-dark-surface",
      card: "bg-dark-card",
      border: "border-dark-border",
      textPrimary: "text-dark-text-primary",
      textSecondary: "text-dark-text-secondary",
      textMuted: "text-dark-text-muted",
    };
  }

  return {
    background: "bg-light-background",
    surface: "bg-light-surface",
    card: "bg-light-card",
    border: "border-light-border",
    textPrimary: "text-light-text-primary",
    textSecondary: "text-light-text-secondary",
    textMuted: "text-light-text-muted",
  };
}
