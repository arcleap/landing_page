"use client";

type Theme = "light" | "dark";

const storageKey = "arcleap-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // The theme still applies for this page when storage is unavailable.
  }
}

export function ThemeToggle() {
  function toggleTheme() {
    const currentTheme =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    applyTheme(currentTheme === "light" ? "dark" : "light");
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
    >
      <svg
        className="theme-icon theme-icon-moon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20 15.2A8.4 8.4 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z" />
      </svg>
      <svg
        className="theme-icon theme-icon-sun"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
      </svg>
    </button>
  );
}
