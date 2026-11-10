import React, { createContext, useContext, useEffect, useState, useTransition } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "dark";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Sync state with DOM on mount
    const initial = getInitialTheme();
    setThemeState(initial);
    applyThemeClass(initial, false);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          const next = e.matches ? "dark" : "light";
          setThemeState(next);
          applyThemeClass(next, true);
        }
      } catch {
        // Ignore
      }
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const setTheme = (next: Theme) => {
    startTransition(() => {
      setThemeState(next);
    });
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore
    }
    applyThemeClass(next, true);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyThemeClass(theme: Theme, animated: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (animated) {
    root.classList.add("theme-transition");
    window.clearTimeout((applyThemeClass as unknown as { _timer?: number })._timer);
    (applyThemeClass as unknown as { _timer?: number })._timer = window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 250);
  }

  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    // Safe fallback if used outside provider
    const isDark =
      typeof document !== "undefined"
        ? document.documentElement.classList.contains("dark")
        : true;
    return {
      theme: isDark ? "dark" : "light",
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}

