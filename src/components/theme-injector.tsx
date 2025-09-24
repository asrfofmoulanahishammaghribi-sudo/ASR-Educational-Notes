"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export function ThemeInjector() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.theme) {
      const root = document.documentElement;
      root.style.setProperty('--background', user.theme.background);
      root.style.setProperty('--primary', user.theme.primary);
      root.style.setProperty('--accent', user.theme.accent);
    }
  }, [user]);

  return null;
}
