import * as $ from 'svelte/internal/server';
import { IconCheck, IconSearch, IconWorld } from '@tabler/icons-svelte';
import { untrack } from 'svelte';
import { flip } from 'svelte/animate';
import { dndzone, TRIGGERS } from 'svelte-dnd-action';
import { s } from '$lib/client/localization.svelte';
import Select from '$lib/components/Select.svelte';
import { categorySettings, displaySettings, settings } from '$lib/data/settings.svelte.js';
import { categoryMetadataStore } from '$lib/stores/categoryMetadata.svelte';
import { experimental } from '$lib/stores/experimental.svelte.js';
import { getCategoryDisplayName } from '$lib/utils/category';
import ContributeCategoryModal from './ContributeCategoryModal.svelte';

export default function SettingsCategories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Contribute modal state
		let showContributeModal = false;

		// Props
		let { categories: allCategories = [] } = $$props;

		// Track dragging state
		let isDragging = false;

		let draggedItemId = null;

		// Animation duration
		const flipDurationMs = 200;

		// Local state for drag and drop - only updated when not dragging
		let enabledItems = [];

		let disabledItems = [];

		// Category filtering
		let categoryFilter = 'all';

		// Search state
		let searchQuery = '';

		// Quick-jump letter filter
		let letterFilter = null;

		// Track container height to prevent shrinking when filtering
		let disabledContainerRef = null;

		let containerMinHeight = 320; // Default min height

		// Capture natural height when showing all items (no filters)
		// Measure after DOM updates
		// Get all available letters from disabled items
		const availableLetters = $.derived(() => {
			const letters = new Set();

			disabledItems.forEach((item) => {
				const displayName = getDisplayName(item);
				const firstLetter = displayName.charAt(0).toUpperCase();

				if ((/[A-Z]/).test(firstLetter)) {
					letters.add(firstLetter);
				} else {
					letters.add('#');
				}
			});

			return Array.from(letters).sort();
		});

		// All possible letters for the quick-jump bar
		const allLetters = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').split('');

		// Single page mode
		let currentSinglePageMode = categorySettings.singlePageMode;

		// Category header position (mobile only)
		let currentCategoryHeaderPosition = displaySettings.categoryHeaderPosition;

		// Sync category header position with store
		function handleCategoryHeaderPositionChange(position) {
			displaySettings.categoryHeaderPosition = position;
			settings.categoryHeaderPosition.save();
			currentCategoryHeaderPosition = position;
		}

		// Toggle handler for horizontal swiping
		function toggleDisableCategorySwipe() {
			experimental.toggleFeature('disableCategorySwipe');
		}

		// Single page mode options
		const singlePageModeOptions = $.derived(() => [
			{
				value: 'disabled',
				label: s('settings.categories.singlePageMode.disabled') || 'Tabs (default)',
				tooltip: s('settings.categories.singlePageMode.disabledTooltip') || 'Display stories in separate tabs for each category. Click tabs to switch between categories.'
			},

			{
				value: 'sequential',
				label: s('settings.categories.singlePageMode.sequential') || 'Single page - Sequential',
				tooltip: s('settings.categories.singlePageMode.sequentialTooltip') || 'Display all stories in one scrollable page. Stories are grouped by category - all stories from the first category, then all from the second, and so on.'
			},

			{
				value: 'mixed',
				label: s('settings.categories.singlePageMode.mixed') || 'Single page - Mixed',
				tooltip: s('settings.categories.singlePageMode.mixedTooltip') || 'Display all stories in one scrollable page. Stories are interleaved - first story from each category, then second story from each, and so on. Categories with fewer stories are skipped when exhausted.'
			},

			{
				value: 'random',
				label: s('settings.categories.singlePageMode.random') || 'Single page - Random',
				tooltip: s('settings.categories.singlePageMode.randomTooltip') || 'Display all stories in one scrollable page in random order. Get a serendipitous mix of topics and perspectives.'
			}
		]);

		// Sync single page mode with store
		// Filter options for the Select component
		const filterOptions = $.derived(() => [
			{
				value: 'all',
				label: s('settings.categories.types.all') || 'All'
			},

			{
				value: 'core',
				label: s('settings.categories.types.core') || 'Kagi Curated',
				icon: IconCheck,
				tooltip: s('settings.categories.coreTooltip') || 'Maintained by Kagi team. High quality, diverse perspectives.'
			},

			{
				value: 'community',
				label: s('settings.categories.types.community') || 'Community',
				icon: IconWorld,
				tooltip: s('settings.categories.communityTooltip') || 'Community-maintained feeds. May have fewer sources or perspectives.'
			}
		]);

		// Initialize categories when they change
		// Sync from store when not dragging
		// Explicitly track dependencies
		function syncFromStore() {
			// Filter out temporary category from enabled list - it should only appear in disabled
			enabledItems = categorySettings.enabled.filter((categoryId) => categoryId !== categorySettings.temporaryCategory).map((categoryId) => {
				const category = categorySettings.allCategories.find((cat) => cat.id === categoryId);

				// Fallback to metadata if category not in current batch
				if (!category) {
					const metadata = categoryMetadataStore.findById(categoryId);

					return { id: categoryId, name: metadata?.displayName || categoryId };
				}

				return { id: categoryId, name: category.name };
			});

			// Temporary category should appear in disabled list
			const disabledCategoryIds = categorySettings.temporaryCategory
				? [
					...categorySettings.disabled,
					categorySettings.temporaryCategory
				]
				: categorySettings.disabled;

			disabledItems = disabledCategoryIds.filter((categoryId, index, self) => self.indexOf(categoryId) === index).// Remove duplicates
			map((categoryId) => {
				const category = categorySettings.allCategories.find((cat) => cat.id === categoryId);

				// Fallback to metadata if category not in current batch
				if (!category) {
					const metadata = categoryMetadataStore.findById(categoryId);

					return { id: categoryId, name: metadata?.displayName || categoryId };
				}

				return { id: categoryId, name: category.name };
			}).sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));
		}

		// Get category type for filtering (core or community)
		function getCategoryType(categoryId) {
			// Skip shadow placeholder items created by the drag library
			if (categoryId.startsWith('id:dnd-shadow-placeholder')) {
				return 'community';
			}

			const metadata = categoryMetadataStore.findById(categoryId);

			if (!metadata) {
				// Don't spam warnings for common categories that might not be in metadata
				if (categoryMetadataStore.isLoaded) {
					console.warn(`No metadata found for category: ${categoryId}`);
				}

				return 'community';
			}

			return metadata.isCore ? 'core' : 'community';
		}

		// Check if category is core (maintained by Kagi)
		function isCoreCategory(categoryId) {
			const metadata = categoryMetadataStore.findById(categoryId);

			return metadata?.isCore ?? false;
		}

		// Helper to get display name with metadata lookup from global store
		function getDisplayName(category) {
			const metadata = categoryMetadataStore.findById(category.id);

			if (!metadata) {
				// Fallback: return the name directly if no metadata found
				return category.name;
			}

			return getCategoryDisplayName(category, metadata);
		}

		// Check if category matches search query and letter filter
		function matchesSearch(category) {
			const displayName = getDisplayName(category);

			// Check letter filter
			if (letterFilter) {
				const firstLetter = displayName.charAt(0).toUpperCase();
				const categoryLetter = (/[A-Z]/).test(firstLetter) ? firstLetter : '#';

				if (categoryLetter !== letterFilter) return false;
			}

			// Check search query
			if (!searchQuery.trim()) return true;

			const query = searchQuery.toLowerCase().trim();

			return displayName.toLowerCase().includes(query) || category.id.toLowerCase().includes(query);
		}

		// Count categories by type for filter labels
		function getCategoryCounts() {
			const counts = { all: disabledItems.length, core: 0, community: 0 };

			disabledItems.forEach((item) => {
				const isCore = isCoreCategory(item.id);

				if (isCore) {
					counts.core++;
				} else {
					counts.community++;
				}
			});

			return counts;
		}

		// Update filter options with counts
		const filterOptionsWithCounts = $.derived(() => {
			const counts = getCategoryCounts();

			return filterOptions().map((option) => ({
				...option,
				label: option.value === 'all'
					? `${s('settings.categories.allCategories') || 'All'} (${counts.all})`
					: `${option.label} (${counts[option.value] || 0})`
			}));
		});

		// Drag handlers for enabled zone
		function handleEnabledConsider(e) {
			const { trigger, id } = e.detail.info;

			if (trigger === TRIGGERS.DRAG_STARTED) {
				isDragging = true;
				draggedItemId = id;
			}

			enabledItems = e.detail.items;
		}

		function handleEnabledFinalize(e) {
			const { trigger } = e.detail.info;
			const isDroppedTrigger = trigger === TRIGGERS.DROPPED_INTO_ZONE || trigger === TRIGGERS.DROPPED_INTO_ANOTHER;

			// Return early if not a dropped trigger (e.g. a click event when disabling a category)
			// This ensures stale data is not used in the other events.
			if (!isDroppedTrigger) {
				return;
			}

			isDragging = false;
			draggedItemId = null;

			const newItems = e.detail.items;

			// Extract the new enabled categories in their drag order
			const newEnabled = newItems.map((item) => item.id);

			// Save the temporary category ID before we modify anything
			const tempCategoryId = categorySettings.temporaryCategory;

			// If the temporary category was enabled, clear the temporary flag FIRST
			// We do this BEFORE setEnabled so syncFromStore() doesn't filter it out
			if (tempCategoryId && newEnabled.includes(tempCategoryId)) {
				categorySettings.clearTemporaryFlag();
			}

			// Update enabled/disabled states
			// This will handle adding the category to enabled list
			categorySettings.setEnabled(newEnabled);

			// Update the global order to preserve the exact drag order within enabled categories
			// Build new order: enabled categories in drag order + disabled categories in original order
			const currentDisabled = categorySettings.disabled;

			const disabledInOrder = categorySettings.order.filter((id) => currentDisabled.includes(id));

			// Merge enabled (in new order) with disabled (in old order)
			// For now, put enabled first, then disabled - this preserves the drag order
			const newOrder = [...newEnabled, ...disabledInOrder];

			categorySettings.setOrder(newOrder);
		}

		// Drag handlers for disabled zone
		function handleDisabledConsider(e) {
			const { trigger, id } = e.detail.info;

			if (trigger === TRIGGERS.DRAG_STARTED) {
				isDragging = true;
				draggedItemId = id;
			}

			// Only update if we have valid items to avoid undefined errors
			if (e.detail?.items) {
				disabledItems = e.detail.items;
			}
		}

		function handleDisabledFinalize(e) {
			const { trigger } = e.detail.info;
			const isDroppedTrigger = trigger === TRIGGERS.DROPPED_INTO_ZONE || trigger === TRIGGERS.DROPPED_INTO_ANOTHER;

			// Return early if not a dropped trigger (e.g. a click event when disabling a category)
			// This ensures stale data is not used in the other events.
			if (!isDroppedTrigger) {
				return;
			}

			isDragging = false;
			draggedItemId = null;

			// Check if we have valid items to avoid undefined errors
			if (!e.detail?.items) {
				return;
			}

			const newItems = e.detail.items;

			// Extract the new disabled categories in their drag order
			const newDisabled = newItems.map((item) => item.id);

			// When working with filtered items, we need to preserve the order of categories
			// that aren't currently visible in the filter
			const hiddenDisabled = disabledItems.filter((item) => {
				const categoryType = getCategoryType(item.id);

				return categoryFilter !== 'all' && categoryType !== categoryFilter;
			}).map((item) => item.id);

			// Combine visible reordered items with hidden items (maintain their original order)
			const allDisabled = [...newDisabled, ...hiddenDisabled];

			// Update enabled/disabled states
			categorySettings.setDisabled(allDisabled);

			// Update the global order to preserve the exact drag order within disabled categories
			const currentEnabled = categorySettings.enabled;

			const enabledInOrder = categorySettings.order.filter((id) => currentEnabled.includes(id));

			// Merge enabled (in old order) with disabled (in new order)
			const newOrder = [...enabledInOrder, ...allDisabled];

			categorySettings.setOrder(newOrder);
		}

		// Click handlers for toggling categories
		function handleEnabledClick(categoryId) {
			// Prevent disabling the last category
			if (enabledItems.length > 1) {
				// Move from enabled to disabled
				categorySettings.disableCategory(categoryId);
			}
		}

		function handleDisabledClick(categoryId) {
			// Move from disabled to enabled
			categorySettings.enableCategory(categoryId);
		}

		// Single page mode change handler
		function handleSinglePageModeChange(mode) {
			categorySettings.singlePageMode = mode;
			currentSinglePageMode = mode;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div class="mb-4"><p class="text-sm text-gray-600 dark:text-gray-400">${$.escape(s("settings.categories.instructions") || "Drag to reorder categories or click to enable/disable them.")}</p></div> <div class="mb-6">`);

			Select($$renderer, {
				options: singlePageModeOptions(),
				label: s("settings.categories.singlePageMode.label") || "Display Mode",
				onChange: handleSinglePageModeChange,
				get value() {
					return currentSinglePageMode;
				},

				set value($$value) {
					currentSinglePageMode = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.categories.singlePageMode.description") || "Choose how to display stories: in tabs (default), or all in a single page with different ordering options.")}</p></div> <div class="mb-6 space-y-4"><div class="flex flex-col space-y-2 md:hidden">`);

			Select($$renderer, {
				options: [
					{
						value: "bottom",
						label: s("settings.categoryHeaderPosition.bottom") || "Bottom"
					},

					{
						value: "top",
						label: s("settings.categoryHeaderPosition.top") || "Top"
					}
				],
				label: s("settings.categoryHeaderPosition.label") || "Category Header Position",
				onChange: handleCategoryHeaderPositionChange,
				get value() {
					return currentCategoryHeaderPosition;
				},

				set value($$value) {
					currentCategoryHeaderPosition = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.categoryHeaderPosition.description") || "Choose where category tabs appear on mobile devices")}</p></div> <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50 md:hidden"><div class="flex-1 pe-4"><label for="disable-category-swipe" id="label-disable-swipe" class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.experimental.disableCategorySwipe.label") || "Disable horizontal category swiping")}</label> <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${$.escape(s("settings.experimental.disableCategorySwipe.description") || "When enabled, horizontal swiping to change categories on mobile devices will be disabled.")}</p></div> <button id="disable-category-swipe" type="button"${$.attr_class('focus-visible-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition', void 0, {
				'bg-blue-600': experimental.disableCategorySwipe,
				'bg-gray-200': !experimental.disableCategorySwipe,
				'dark:bg-gray-600': !experimental.disableCategorySwipe
			})} role="switch"${$.attr('aria-checked', experimental.disableCategorySwipe)} aria-labelledby="label-disable-swipe"><span${$.attr_class('inline-block h-4 w-4 transform rounded-full bg-white transition', void 0, {
				'ltr:translate-x-6': experimental.disableCategorySwipe,
				'rtl:-translate-x-6': experimental.disableCategorySwipe,
				'ltr:translate-x-1': !experimental.disableCategorySwipe,
				'rtl:-translate-x-1': !experimental.disableCategorySwipe
			})}></span></button></div></div> <div><h4 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.categories.enabled") || "Enabled Categories")}</h4> <div${$.attr_class('min-h-[40px] rounded-lg p-3 flex flex-wrap gap-2 border-2 border-dashed', void 0, {
				'border-gray-300': !isDragging,
				'dark:border-gray-600': !isDragging,
				'border-transparent': isDragging
			})}><!--[-->`);

			const each_array = $.ensure_array_like(enabledItems);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let category = each_array[index];
				const isCore = isCoreCategory(category.id);

				$$renderer.push(`<div${$.attr_class(`group inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200 focus-visible-ring ${draggedItemId === category.id ? 'opacity-50' : ''} ${enabledItems.length === 1
					? 'cursor-not-allowed opacity-75'
					: 'cursor-grab active:cursor-grabbing hover:bg-blue-200 dark:hover:bg-blue-700'} transition-colors`)}${$.attr('title', enabledItems.length === 1
					? s("settings.categories.lastCategory") || "Cannot disable the last category"
					: s("settings.categories.disable") || "Click to disable, drag to reorder")} role="button"${$.attr('tabindex', enabledItems.length === 1 ? -1 : 0)}${$.attr('aria-disabled', enabledItems.length === 1)}${$.attr('aria-label', enabledItems.length === 1
					? `${getDisplayName(category)} - last category, cannot disable`
					: `${getDisplayName(category)} - click to disable or drag to reorder`)}><span class="select-none">${$.escape(getDisplayName(category))}</span></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (enabledItems.length === 0) {
				$$renderer.push(`<!--[0--><div class="text-sm text-gray-500 dark:text-gray-400">${$.escape(s("settings.categories.noEnabled") || "No enabled categories")}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <div><div class="mb-3 space-y-3"><div class="flex items-center justify-between"><h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.categories.disabled") || "Available Categories")}</h4> <div class="w-48">`);

			Select($$renderer, {
				options: filterOptionsWithCounts(),
				label: s("settings.categories.filterByType") || "Filter",
				placeholder: s("settings.categories.filterPlaceholder") || "All",
				className: 'text-xs',
				height: 'h-8',
				onChange: (value) => {
					categoryFilter = value;
				},

				get value() {
					return categoryFilter;
				},

				set value($$value) {
					categoryFilter = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div> <div class="relative">`);

			IconSearch($$renderer, {
				size: 16,
				class: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
			});

			$$renderer.push(`<!----> <input type="text"${$.attr('value', searchQuery)}${$.attr('placeholder', s("settings.categories.searchPlaceholder") || "Search categories...")} class="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus-visible-ring"/> `);

			if (searchQuery) {
				$$renderer.push(`<!--[0--><button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded focus-visible-ring"${$.attr('aria-label', s("ui.clear") || "Clear search")}><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="flex flex-wrap gap-0.5 justify-center"><button type="button"${$.attr_class(`px-1.5 py-0.5 text-xs font-medium rounded transition-colors focus-visible-ring ${letterFilter === null
				? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
				: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'}`)}${$.attr('aria-pressed', letterFilter === null)}>All</button> <!--[-->`);

			const each_array_1 = $.ensure_array_like(allLetters);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let letter = each_array_1[$$index_1];
				const hasItems = availableLetters().includes(letter);

				$$renderer.push(`<button type="button"${$.attr('disabled', !hasItems, true)}${$.attr_class(`size-6 text-xs font-medium rounded transition-colors focus-visible-ring ${letterFilter === letter
					? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
					: hasItems
						? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
						: 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`)}${$.attr('aria-pressed', letterFilter === letter)}>${$.escape(letter)}</button>`);
			}

			$$renderer.push(`<!--]--></div></div> <div${$.attr_class('rounded-lg p-3 flex flex-wrap gap-2 content-start border-2 border-dashed', void 0, {
				'border-gray-300': !isDragging,
				'dark:border-gray-600': !isDragging,
				'border-transparent': isDragging
			})}${$.attr_style(`min-height: ${$.stringify(containerMinHeight)}px`)}><!--[-->`);

			const each_array_2 = $.ensure_array_like(disabledItems);

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let category = each_array_2[index];
				const isCore = isCoreCategory(category.id);
				const matchesTypeFilter = categoryFilter === "all" || (categoryFilter === "core" ? isCore : !isCore);
				const isFiltered = !matchesTypeFilter || !matchesSearch(category);
				const isBeingDragged = draggedItemId === category.id;

				$$renderer.push(`<div${$.attr_class(`group inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300 focus-visible-ring ${isBeingDragged ? 'opacity-50' : ''} cursor-grab active:cursor-grabbing hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`)}${$.attr_style(isFiltered && !isBeingDragged
					? "position: absolute; left: -9999px; opacity: 0; pointer-events: none;"
					: "")}${$.attr('title', s("settings.categories.enable") || "Click to enable, drag to reorder")} role="button"${$.attr('tabindex', isFiltered ? -1 : 0)}${$.attr('aria-label', `${getDisplayName(category)} - click to enable or drag to reorder`)}><span class="select-none">${$.escape(getDisplayName(category))}</span></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (disabledItems.length === 0) {
				$$renderer.push(`<!--[0--><div class="text-sm text-gray-500 dark:text-gray-400 pointer-events-none select-none">${$.escape(s("settings.categories.noDisabled") || "All categories enabled")}</div>`);
			} else if (disabledItems.every((item) => !matchesSearch(item))) {
				$$renderer.push(`<!--[1--><div class="text-sm text-gray-500 dark:text-gray-400 pointer-events-none select-none">`);

				if (searchQuery) {
					$$renderer.push(`<!--[0-->${$.escape(s("settings.categories.noSearchResults") || "No categories match your search")}`);
				} else if (letterFilter) {
					$$renderer.push(`<!--[1-->${$.escape(s("settings.categories.noLetterResults") || `No categories starting with "${letterFilter}"`)}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(s("settings.categories.noFiltered") || "No categories match the current filter")}`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <div class="text-center"><button class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus-visible-ring rounded">${$.escape(s("settings.categories.contribute") || "+ Contribute a category")}</button></div></div> `);

			ContributeCategoryModal($$renderer, {
				visible: showContributeModal,
				onClose: () => showContributeModal = false
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}