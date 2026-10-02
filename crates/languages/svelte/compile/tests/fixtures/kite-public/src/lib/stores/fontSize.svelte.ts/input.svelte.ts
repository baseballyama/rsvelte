import { browser } from "$app/environment";

export type FontSize = "xs" | "small" | "normal" | "large" | "xl";

const STORAGE_KEY = "kite-font-size";
const DEFAULT_FONT_SIZE: FontSize = "normal";

// Initialize font size state with proper typing
const fontSizeState = $state<{ current: FontSize }>({
  current: DEFAULT_FONT_SIZE,
});

// Helper functions
function getInitialFontSize(): FontSize {
  if (!browser) return DEFAULT_FONT_SIZE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["xs", "small", "normal", "large", "xl"].includes(stored)) {
      return stored as FontSize;
    }
  } catch (error) {
    console.warn("Failed to read font size from localStorage:", error);
  }

  return DEFAULT_FONT_SIZE;
}

// Apply font size by updating CSS custom properties
function applyFontSize(fontSize: FontSize) {
  if (!browser) return;

  try {
    const root = document.documentElement;

    // Define font size scales
    const fontSizes = {
      xs: {
        // Extra small sizes (12px base)
        "text-xs": "0.625rem", // 10px
        "text-sm": "0.75rem", // 12px
        "text-base": "0.75rem", // 12px
        "text-lg": "0.875rem", // 14px
        "text-xl": "1rem", // 16px
        "text-2xl": "1.125rem", // 18px
        "text-3xl": "1.25rem", // 20px
        "text-4xl": "1.5rem", // 24px
      },
      small: {
        // Small sizes (14px base)
        "text-xs": "0.675rem", // 10.8px
        "text-sm": "0.8rem", // 12.8px
        "text-base": "0.875rem", // 14px
        "text-lg": "1rem", // 16px
        "text-xl": "1.125rem", // 18px
        "text-2xl": "1.35rem", // 21.6px
        "text-3xl": "1.575rem", // 25.2px
        "text-4xl": "1.75rem", // 28px
      },
      normal: {
        // Normal sizes (16px base)
        "text-xs": "0.75rem", // 12px
        "text-sm": "0.875rem", // 14px
        "text-base": "1rem", // 16px
        "text-lg": "1.125rem", // 18px
        "text-xl": "1.25rem", // 20px
        "text-2xl": "1.5rem", // 24px
        "text-3xl": "1.875rem", // 30px
        "text-4xl": "2.25rem", // 36px
      },
      large: {
        // Large sizes (18px base)
        "text-xs": "0.875rem", // 14px
        "text-sm": "1rem", // 16px
        "text-base": "1.125rem", // 18px
        "text-lg": "1.25rem", // 20px
        "text-xl": "1.5rem", // 24px
        "text-2xl": "1.875rem", // 30px
        "text-3xl": "2.25rem", // 36px
        "text-4xl": "2.625rem", // 42px
      },
      xl: {
        // Extra large sizes (20px base)
        "text-xs": "1rem", // 16px
        "text-sm": "1.125rem", // 18px
        "text-base": "1.25rem", // 20px
        "text-lg": "1.375rem", // 22px
        "text-xl": "1.625rem", // 26px
        "text-2xl": "2rem", // 32px
        "text-3xl": "2.5rem", // 40px
        "text-4xl": "3rem", // 48px
      },
    };

    // Apply the font size variables
    const sizes = fontSizes[fontSize];
    Object.entries(sizes).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  } catch (error) {
    console.warn("Failed to apply font size:", error);
  }
}

function saveFontSize(fontSize: FontSize) {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, fontSize);
  } catch (error) {
    console.warn("Failed to save font size to localStorage:", error);
  }
}

function loadFontSize() {
  const initial = getInitialFontSize();
  fontSizeState.current = initial;
  applyFontSize(initial);
}

// Font size store API
export const fontSize = {
  get current() {
    return fontSizeState.current;
  },

  set(fontSize: FontSize) {
    fontSizeState.current = fontSize;
    applyFontSize(fontSize);
    saveFontSize(fontSize);
  },

  reset() {
    fontSizeState.current = DEFAULT_FONT_SIZE;
    applyFontSize(DEFAULT_FONT_SIZE);
    if (browser) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to remove font size from localStorage:", error);
      }
    }
  },

  init() {
    if (browser) {
      loadFontSize();
    }
  },
};
