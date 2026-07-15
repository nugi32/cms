"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage can be unavailable (private browsing, etc.) - the
      // toggle still works for the current page load either way.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`theme-toggle ${className}`}
      aria-label="Toggle color theme"
    >
      {theme === null ? "Theme" : theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
