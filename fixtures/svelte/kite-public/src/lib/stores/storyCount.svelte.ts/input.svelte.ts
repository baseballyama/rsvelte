import { browser } from "$app/environment";

const STORAGE_KEY = "kite-story-count";
const DEFAULT_STORY_COUNT = 12;
const MIN_STORY_COUNT = 3;
const MAX_STORY_COUNT = 12;

// Initialize story count state
const storyCountState = $state({ current: DEFAULT_STORY_COUNT });

// Helper functions
function getInitialStoryCount(): number {
  if (!browser) return DEFAULT_STORY_COUNT;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const count = parseInt(stored, 10);
      if (count >= MIN_STORY_COUNT && count <= MAX_STORY_COUNT) {
        return count;
      }
    }
  } catch (error) {
    console.warn("Failed to read story count from localStorage:", error);
  }

  return DEFAULT_STORY_COUNT;
}

function saveStoryCount(count: number) {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, count.toString());
  } catch (error) {
    console.warn("Failed to save story count to localStorage:", error);
  }
}

function loadStoryCount() {
  storyCountState.current = getInitialStoryCount();
}

// Story count store API
export const storyCount = {
  get current() {
    return storyCountState.current;
  },

  set(count: number) {
    // Validate range
    const validCount = Math.max(
      MIN_STORY_COUNT,
      Math.min(MAX_STORY_COUNT, count),
    );
    storyCountState.current = validCount;
    saveStoryCount(validCount);
  },

  increment() {
    const newCount = Math.min(MAX_STORY_COUNT, storyCountState.current + 1);
    storyCountState.current = newCount;
    saveStoryCount(newCount);
  },

  decrement() {
    const newCount = Math.max(MIN_STORY_COUNT, storyCountState.current - 1);
    storyCountState.current = newCount;
    saveStoryCount(newCount);
  },

  reset() {
    storyCountState.current = DEFAULT_STORY_COUNT;
    if (browser) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to remove story count from localStorage:", error);
      }
    }
  },

  init() {
    if (browser) {
      loadStoryCount();
    }
  },
};

// Export constants for external use
export { MIN_STORY_COUNT, MAX_STORY_COUNT, DEFAULT_STORY_COUNT };
