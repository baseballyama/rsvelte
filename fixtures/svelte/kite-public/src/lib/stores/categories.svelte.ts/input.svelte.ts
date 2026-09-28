import { browser } from "$app/environment";
import type { Category } from "$lib/types";
import { normalizeToId as centralizedNormalizeToId } from "$lib/utils/categoryIdTransform";

interface CategoriesState {
  order: string[];
  enabled: string[];
  disabled: string[];
  allCategories: Category[];
  temporaryCategory: string | null;
}

// Initialize categories state
const categoriesState = $state<CategoriesState>({
  order: [],
  enabled: [],
  disabled: [],
  allCategories: [],
  temporaryCategory: null,
});

// Helper functions
function isValidCategory(categoryId: string): boolean {
  return categoriesState.allCategories.some(
    (cat) => cat.id === categoryId || cat.name === categoryId,
  );
}

function normalizeToId(categoryIdOrName: string): string {
  return centralizedNormalizeToId(
    categoryIdOrName,
    categoriesState.allCategories,
  );
}

function loadFromStorage(key: string): any {
  if (!browser) return null;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveToStorage() {
  if (!browser) return;
  localStorage.setItem("categoryOrder", JSON.stringify(categoriesState.order));
  localStorage.setItem(
    "enabledCategories",
    JSON.stringify(categoriesState.enabled),
  );
  localStorage.setItem(
    "disabledCategories",
    JSON.stringify(categoriesState.disabled),
  );
}

// Categories store API
export const categories = {
  get order() {
    return categoriesState.order;
  },

  get enabled() {
    return categoriesState.enabled;
  },

  get disabled() {
    return categoriesState.disabled;
  },

  get allCategories() {
    return categoriesState.allCategories;
  },

  // Load categories from API
  setAllCategories(newCategories: Category[]) {
    categoriesState.allCategories = newCategories;
  },

  setOrder(newOrder: string[]) {
    const validOrder = newOrder.filter(isValidCategory).map(normalizeToId);
    categoriesState.order = validOrder;

    // Reorder enabled categories to match the new order
    const reorderedEnabled = validOrder.filter((cat) =>
      categoriesState.enabled.includes(cat),
    );
    categoriesState.enabled = reorderedEnabled;

    saveToStorage();
  },

  setEnabled(newEnabled: string[]) {
    const validEnabled = newEnabled.filter(isValidCategory).map(normalizeToId);
    categoriesState.enabled = validEnabled;

    // Update disabled to be all categories not in enabled
    const allCategoryIds = categoriesState.allCategories.map((cat) => cat.id);
    categoriesState.disabled = allCategoryIds.filter(
      (cat) => !validEnabled.includes(cat),
    );

    saveToStorage();
  },

  setDisabled(newDisabled: string[]) {
    const validDisabled = newDisabled
      .filter(isValidCategory)
      .map(normalizeToId);
    categoriesState.disabled = validDisabled;

    // Update enabled to be all categories not in disabled
    const allCategoryIds = categoriesState.allCategories.map((cat) => cat.id);
    categoriesState.enabled = allCategoryIds.filter(
      (cat) => !validDisabled.includes(cat),
    );

    saveToStorage();
  },

  enableCategory(category: string) {
    const categoryId = normalizeToId(category);
    if (categoriesState.enabled.includes(categoryId)) return;

    // Remove from disabled
    categoriesState.disabled = categoriesState.disabled.filter(
      (cat) => cat !== categoryId,
    );

    // Add to enabled in the correct position according to order
    const orderIndex = categoriesState.order.indexOf(categoryId);
    const insertIndex = categoriesState.enabled.findIndex(
      (cat) => categoriesState.order.indexOf(cat) > orderIndex,
    );

    const newEnabled = [...categoriesState.enabled];
    if (insertIndex === -1) {
      newEnabled.push(categoryId);
    } else {
      newEnabled.splice(insertIndex, 0, categoryId);
    }

    categoriesState.enabled = newEnabled;
    saveToStorage();
  },

  disableCategory(category: string) {
    const categoryId = normalizeToId(category);
    if (categoriesState.disabled.includes(categoryId)) return;

    // Remove from enabled
    categoriesState.enabled = categoriesState.enabled.filter(
      (cat) => cat !== categoryId,
    );

    // Add to disabled
    categoriesState.disabled = [...categoriesState.disabled, categoryId];
    saveToStorage();
  },

  isEnabled(category: string): boolean {
    const categoryId = normalizeToId(category);
    return categoriesState.enabled.includes(categoryId);
  },

  isDisabled(category: string): boolean {
    const categoryId = normalizeToId(category);
    return categoriesState.disabled.includes(categoryId);
  },

  init() {
    if (!browser) return;

    // Load from storage
    const savedOrder = loadFromStorage("categoryOrder") || [];
    const savedEnabled = loadFromStorage("enabledCategories") || [];
    const savedDisabled = loadFromStorage("disabledCategories") || [];

    // Filter for valid categories and normalize to IDs (will be empty until allCategories is set)
    const validOrder = savedOrder.filter(isValidCategory).map(normalizeToId);
    const validEnabled = savedEnabled
      .filter(isValidCategory)
      .map(normalizeToId);
    const validDisabled = savedDisabled
      .filter(isValidCategory)
      .map(normalizeToId);

    // Set the arrays (will be updated when setAllCategories is called)
    categoriesState.order = validOrder;
    categoriesState.enabled = validEnabled;
    categoriesState.disabled = validDisabled;
  },

  // Initialize with defaults after categories are loaded from API
  initWithDefaults() {
    if (!browser || categoriesState.allCategories.length === 0) return;

    const allCategoryIds = categoriesState.allCategories.map((cat) => cat.id);

    // Default enabled categories for first-time setup
    const defaultEnabledCategories = [
      "world",
      "usa",
      "business",
      "tech",
      "science",
      "sports",
      "gaming",
      "onthisday",
    ];

    // If no saved data, use defaults (enable only specific categories)
    if (
      categoriesState.order.length === 0 &&
      categoriesState.enabled.length === 0
    ) {
      // Ensure default categories come first in the order, maintaining their specified order
      const orderedCategories = defaultEnabledCategories.filter((categoryId) =>
        allCategoryIds.includes(categoryId),
      );
      const remainingCategories = allCategoryIds.filter(
        (categoryId) => !defaultEnabledCategories.includes(categoryId),
      );
      categoriesState.order = [...orderedCategories, ...remainingCategories];
      // Only enable the default categories that exist in the API
      categoriesState.enabled = defaultEnabledCategories.filter((categoryId) =>
        allCategoryIds.includes(categoryId),
      );
      categoriesState.disabled = allCategoryIds.filter(
        (categoryId) => !defaultEnabledCategories.includes(categoryId),
      );
    } else {
      // Clean up existing data to remove invalid categories and normalize to IDs
      categoriesState.order = categoriesState.order
        .filter((cat) => isValidCategory(cat))
        .map(normalizeToId);
      categoriesState.enabled = categoriesState.enabled
        .filter((cat) => isValidCategory(cat))
        .map(normalizeToId);
      categoriesState.disabled = categoriesState.disabled
        .filter((cat) => isValidCategory(cat))
        .map(normalizeToId);

      // Add new categories to order
      const newCategories = allCategoryIds.filter(
        (cat) => !categoriesState.order.includes(cat),
      );
      categoriesState.order = [...categoriesState.order, ...newCategories];

      // Add new categories to disabled by default (except OnThisDay)
      const newDisabledCategories = allCategoryIds.filter(
        (cat) =>
          !categoriesState.enabled.includes(cat) &&
          !categoriesState.disabled.includes(cat) &&
          cat !== "onthisday", // OnThisDay should be enabled by default
      );
      categoriesState.disabled = [
        ...categoriesState.disabled,
        ...newDisabledCategories,
      ];

      // Enable OnThisDay if it's new and available
      if (
        allCategoryIds.includes("onthisday") &&
        !categoriesState.enabled.includes("onthisday") &&
        !categoriesState.disabled.includes("onthisday")
      ) {
        categoriesState.enabled.push("onthisday");
      }
    }

    // Reorder enabled categories to match the order
    const reorderedEnabled = categoriesState.order.filter((cat) =>
      categoriesState.enabled.includes(cat),
    );
    categoriesState.enabled = reorderedEnabled;

    saveToStorage();
  },

  // Temporary category management (for shared links)
  addTemporary(categoryId: string) {
    const normalizedId = normalizeToId(categoryId);
    if (!isValidCategory(normalizedId)) return;

    // Don't add if already enabled
    if (categoriesState.enabled.includes(normalizedId)) return;

    console.log("Adding temporary category:", normalizedId);
    categoriesState.temporaryCategory = normalizedId;

    // Add to enabled temporarily (don't save to storage)
    const orderIndex = categoriesState.order.indexOf(normalizedId);
    const insertIndex = categoriesState.enabled.findIndex(
      (cat) => categoriesState.order.indexOf(cat) > orderIndex,
    );

    const newEnabled = [...categoriesState.enabled];
    if (insertIndex === -1) {
      newEnabled.push(normalizedId);
    } else {
      newEnabled.splice(insertIndex, 0, normalizedId);
    }

    categoriesState.enabled = newEnabled;
    // Don't save to storage - this is temporary
  },

  removeTemporary() {
    if (!categoriesState.temporaryCategory) return;

    console.log(
      "Removing temporary category:",
      categoriesState.temporaryCategory,
    );

    // Remove from enabled
    categoriesState.enabled = categoriesState.enabled.filter(
      (cat) => cat !== categoriesState.temporaryCategory,
    );

    categoriesState.temporaryCategory = null;
    // Don't save to storage - just restoring to saved state
  },

  get temporaryCategory() {
    return categoriesState.temporaryCategory;
  },
};
