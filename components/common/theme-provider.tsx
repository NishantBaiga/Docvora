"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Inner component that syncs the color-theme stored in localStorage
 * to a data-color-theme attribute on <html>.
 * next-themes manages `class="dark"` for us; we manage the color accent separately.
 */
function ColorThemeSync() {
  useEffect(() => {
    const saved = localStorage.getItem("color-theme") ?? "orange";
    document.documentElement.setAttribute("data-color-theme", saved);
  }, []);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ColorThemeSync />
      {children}
    </NextThemeProvider>
  );
}