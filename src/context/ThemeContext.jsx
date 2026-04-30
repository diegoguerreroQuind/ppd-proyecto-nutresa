import { createContext, useContext, useState,
         useEffect, useMemo } from "react";
import { darkTheme, lightTheme } from "../constants/colors";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    // Priority 1: localStorage
    const saved = localStorage.getItem("ppd-theme");
    if (saved === "light" || saved === "dark") return saved;
    // Priority 2: OS preference
    if (window.matchMedia("(prefers-color-scheme: light)").matches)
      return "light";
    // Priority 3: default dark
    return "dark";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("ppd-theme", next);
      return next;
    });
  };

  // Sync OS preference changes in real time
  useEffect(() => {
    const saved = localStorage.getItem("ppd-theme");
    if (saved) return; // user has explicit preference, ignore OS
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e) =>
      setTheme(e.matches ? "light" : "dark");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const colors = useMemo(
    () => theme === "light" ? lightTheme : darkTheme,
    [theme]
  );

  const value = useMemo(
    () => ({ theme, toggleTheme, colors, isDark: theme === "dark" }),
    [theme, colors]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error(
    "useTheme must be used inside ThemeProvider"
  );
  return ctx;
};
