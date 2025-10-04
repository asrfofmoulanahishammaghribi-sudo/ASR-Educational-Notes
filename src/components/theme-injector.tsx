"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export function ThemeInjector() {
  const { user } = useAuth();

  useEffect(() => {
    const root = document.documentElement;
    if (user?.theme) {
      if (user.theme.background) root.style.setProperty('--background', user.theme.background);
      if (user.theme.primary) root.style.setProperty('--primary', user.theme.primary);
      if (user.theme.accent) root.style.setProperty('--accent', user.theme.accent);
      if (user.theme.note) root.style.setProperty('--note-foreground', user.theme.note);
      if (user.theme.category) root.style.setProperty('--category-foreground', user.theme.category);
      if (user.theme.subcategory) root.style.setProperty('--subcategory-foreground', user.theme.subcategory);
    } else {
        // Reset to default if user has no theme
        root.style.removeProperty('--background');
        root.style.removeProperty('--primary');
        root.style.removeProperty('--accent');
        root.style.removeProperty('--note-foreground');
        root.style.removeProperty('--category-foreground');
        root.style.removeProperty('--subcategory-foreground');
    }
  }, [user]);

  return null;
}
