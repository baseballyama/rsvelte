import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div role="button"><span class="select-none"> </span></div>`);
var root_1 = $.from_html(`<div class="text-sm text-gray-500 dark:text-gray-400"> </div>`);
var root_2 = $.from_html(`<button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded focus-visible-ring"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
var root_3 = $.from_html(`<button type="button"> </button>`);
var root_4 = $.from_html(`<div class="text-sm text-gray-500 dark:text-gray-400 pointer-events-none select-none"> </div>`);
var root_5 = $.from_html(`<div class="text-sm text-gray-500 dark:text-gray-400 pointer-events-none select-none"><!></div>`);
var root_6 = $.from_html(`<div class="space-y-4"><div class="mb-4"><p class="text-sm text-gray-600 dark:text-gray-400"> </p></div> <div class="mb-6"><!> <p class="mt-2 text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="mb-6 space-y-4"><div class="flex flex-col space-y-2 md:hidden"><!> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50 md:hidden"><div class="flex-1 pe-4"><label for="disable-category-swipe" id="label-disable-swipe" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"> </p></div> <button id="disable-category-swipe" type="button" role="switch" aria-labelledby="label-disable-swipe"><span></span></button></div></div> <div><h4 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"> </h4> <div><!> <!></div></div> <div><div class="mb-3 space-y-3"><div class="flex items-center justify-between"><h4 class="text-sm font-medium text-gray-700 dark:text-gray-300"> </h4> <div class="w-48"><!></div></div> <div class="relative"><!> <input type="text" class="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus-visible-ring"/> <!></div> <div class="flex flex-wrap gap-0.5 justify-center"><button type="button">All</button> <!></div></div> <div><!> <!></div></div> <div class="text-center"><button class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus-visible-ring rounded"> </button></div></div> <!>`, 1);

export default function SettingsCategories($$anchor, $$props) {
	$.push($$props, true);

	// Contribute modal state
	let showContributeModal = $.state(false);

	// Props
	let allCategories = $.prop($$props, 'categories', 19, () => []);

	// Track dragging state
	let isDragging = $.state(false);

	let draggedItemId = $.state(null);

	// Animation duration
	const flipDurationMs = 200;

	// Local state for drag and drop - only updated when not dragging
	let enabledItems = $.state($.proxy([]));

	let disabledItems = $.state($.proxy([]));

	// Category filtering
	let categoryFilter = $.state('all');

	// Search state
	let searchQuery = $.state('');

	// Quick-jump letter filter
	let letterFilter = $.state(null);

	// Track container height to prevent shrinking when filtering
	let disabledContainerRef = $.state(null);

	let containerMinHeight = $.state(320 // Default min height
	);

	// Capture natural height when showing all items (no filters)
	$.user_effect(() => {
		if ($.get(disabledContainerRef) && $.get(categoryFilter) === 'all' && !$.get(letterFilter) && !$.get(searchQuery)) {
			// Measure after DOM updates
			requestAnimationFrame(() => {
				if ($.get(disabledContainerRef)) {
					const height = $.get(disabledContainerRef).scrollHeight;

					if (height > $.get(containerMinHeight)) {
						$.set(containerMinHeight, height, true);
					}
				}
			});
		}
	});

	// Get all available letters from disabled items
	const availableLetters = $.derived(() => {
		const letters = new Set();

		$.get(disabledItems).forEach((item) => {
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
	let currentSinglePageMode = $.state($.proxy(categorySettings.singlePageMode));

	// Category header position (mobile only)
	let currentCategoryHeaderPosition = $.state($.proxy(displaySettings.categoryHeaderPosition));

	// Sync category header position with store
	$.user_effect(() => {
		$.set(currentCategoryHeaderPosition, displaySettings.categoryHeaderPosition, true);
	});

	function handleCategoryHeaderPositionChange(position) {
		displaySettings.categoryHeaderPosition = position;
		settings.categoryHeaderPosition.save();
		$.set(currentCategoryHeaderPosition, position, true);
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
	$.user_effect(() => {
		$.set(currentSinglePageMode, categorySettings.singlePageMode, true);
	});

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
	$.user_effect(() => {
		if (allCategories().length > 0) {
			untrack(() => {
				categorySettings.setAllCategories(allCategories());
				categorySettings.initWithDefaults();
				syncFromStore();
			});
		}
	});

	// Sync from store when not dragging
	$.user_effect(() => {
		// Explicitly track dependencies
		void categorySettings.enabled;

		void categorySettings.disabled;
		void categorySettings.temporaryCategory;

		if (!$.get(isDragging)) {
			syncFromStore();
		}
	});

	function syncFromStore() {
		// Filter out temporary category from enabled list - it should only appear in disabled
		$.set(
			enabledItems,
			categorySettings.enabled.filter((categoryId) => categoryId !== categorySettings.temporaryCategory).map((categoryId) => {
				const category = categorySettings.allCategories.find((cat) => cat.id === categoryId);

				// Fallback to metadata if category not in current batch
				if (!category) {
					const metadata = categoryMetadataStore.findById(categoryId);

					return { id: categoryId, name: metadata?.displayName || categoryId };
				}

				return { id: categoryId, name: category.name };
			}),
			true
		);

		// Temporary category should appear in disabled list
		const disabledCategoryIds = categorySettings.temporaryCategory
			? [
				...categorySettings.disabled,
				categorySettings.temporaryCategory
			]
			: categorySettings.disabled;

		$.set(
			disabledItems,
			disabledCategoryIds.filter((categoryId, index, self) => self.indexOf(categoryId) === index).// Remove duplicates
			map((categoryId) => {
				const category = categorySettings.allCategories.find((cat) => cat.id === categoryId);

				// Fallback to metadata if category not in current batch
				if (!category) {
					const metadata = categoryMetadataStore.findById(categoryId);

					return { id: categoryId, name: metadata?.displayName || categoryId };
				}

				return { id: categoryId, name: category.name };
			}).sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b))),
			true
		);
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
		if ($.get(letterFilter)) {
			const firstLetter = displayName.charAt(0).toUpperCase();
			const categoryLetter = (/[A-Z]/).test(firstLetter) ? firstLetter : '#';

			if (categoryLetter !== $.get(letterFilter)) return false;
		}

		// Check search query
		if (!$.get(searchQuery).trim()) return true;

		const query = $.get(searchQuery).toLowerCase().trim();

		return displayName.toLowerCase().includes(query) || category.id.toLowerCase().includes(query);
	}

	// Count categories by type for filter labels
	function getCategoryCounts() {
		const counts = { all: $.get(disabledItems).length, core: 0, community: 0 };

		$.get(disabledItems).forEach((item) => {
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

		return $.get(filterOptions).map((option) => ({
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
			$.set(isDragging, true);
			$.set(draggedItemId, id, true);
		}

		$.set(enabledItems, e.detail.items, true);
	}

	function handleEnabledFinalize(e) {
		const { trigger } = e.detail.info;
		const isDroppedTrigger = trigger === TRIGGERS.DROPPED_INTO_ZONE || trigger === TRIGGERS.DROPPED_INTO_ANOTHER;

		// Return early if not a dropped trigger (e.g. a click event when disabling a category)
		// This ensures stale data is not used in the other events.
		if (!isDroppedTrigger) {
			return;
		}

		$.set(isDragging, false);
		$.set(draggedItemId, null);

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
			$.set(isDragging, true);
			$.set(draggedItemId, id, true);
		}

		// Only update if we have valid items to avoid undefined errors
		if (e.detail?.items) {
			$.set(disabledItems, e.detail.items, true);
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

		$.set(isDragging, false);
		$.set(draggedItemId, null);

		// Check if we have valid items to avoid undefined errors
		if (!e.detail?.items) {
			return;
		}

		const newItems = e.detail.items;

		// Extract the new disabled categories in their drag order
		const newDisabled = newItems.map((item) => item.id);

		// When working with filtered items, we need to preserve the order of categories
		// that aren't currently visible in the filter
		const hiddenDisabled = $.get(disabledItems).filter((item) => {
			const categoryType = getCategoryType(item.id);

			return $.get(categoryFilter) !== 'all' && categoryType !== $.get(categoryFilter);
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
		if ($.get(enabledItems).length > 1) {
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
		$.set(currentSinglePageMode, mode, true);
	}

	var fragment = root_6();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var p = $.child(div_1);
	var text = $.only_child(p, true);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node = $.child(div_2);

	{
		let $0 = $.derived(() => s("settings.categories.singlePageMode.label") || "Display Mode");

		Select(node, {
			get options() {
				return $.get(singlePageModeOptions);
			},

			get label() {
				return $.get($0);
			},
			onChange: handleSinglePageModeChange,
			get value() {
				return $.get(currentSinglePageMode);
			},

			set value($$value) {
				$.set(currentSinglePageMode, $$value, true);
			}
		});
	}

	var p_1 = $.sibling(node, 2);
	var text_1 = $.only_child(p_1, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.child(div_3);
	var node_1 = $.child(div_4);

	{
		let $0 = $.derived(() => [
			{
				value: "bottom",
				label: s("settings.categoryHeaderPosition.bottom") || "Bottom"
			},

			{
				value: "top",
				label: s("settings.categoryHeaderPosition.top") || "Top"
			}
		]);

		let $1 = $.derived(() => s("settings.categoryHeaderPosition.label") || "Category Header Position");

		Select(node_1, {
			get options() {
				return $.get($0);
			},

			get label() {
				return $.get($1);
			},
			onChange: handleCategoryHeaderPositionChange,
			get value() {
				return $.get(currentCategoryHeaderPosition);
			},

			set value($$value) {
				$.set(currentCategoryHeaderPosition, $$value, true);
			}
		});
	}

	var p_2 = $.sibling(node_1, 2);
	var text_2 = $.only_child(p_2, true);

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.child(div_5);
	var label = $.child(div_6);
	var text_3 = $.only_child(label, true);
	var p_3 = $.sibling(label, 2);
	var text_4 = $.only_child(p_3, true);

	$.reset(div_6);

	var button = $.sibling(div_6, 2);
	let classes;
	var span = $.child(button);
	let classes_1;

	$.reset(button);
	$.reset(div_5);
	$.reset(div_3);

	var div_7 = $.sibling(div_3, 2);
	var h4 = $.child(div_7);
	var text_5 = $.only_child(h4, true);
	var div_8 = $.sibling(h4, 2);
	let classes_2;
	var node_2 = $.child(div_8);

	$.each(node_2, 27, () => $.get(enabledItems), (category, index) => `enabled-${category.id}-${index}`, ($$anchor, category) => {
		const isCore = $.derived(() => isCoreCategory($.get(category).id));
		var div_9 = root();
		var span_1 = $.child(div_9);
		var text_6 = $.only_child(span_1, true);

		$.reset(div_9);

		$.template_effect(
			($0, $1, $2) => {
				$.set_class(div_9, 1, `group inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200 focus-visible-ring
						${$.get(draggedItemId) === $.get(category).id ? 'opacity-50' : ''}
						${$.get(enabledItems).length === 1
					? 'cursor-not-allowed opacity-75'
					: 'cursor-grab active:cursor-grabbing hover:bg-blue-200 dark:hover:bg-blue-700'}
						transition-colors`);

				$.set_attribute(div_9, 'title', $0);
				$.set_attribute(div_9, 'tabindex', $.get(enabledItems).length === 1 ? -1 : 0);
				$.set_attribute(div_9, 'aria-disabled', $.get(enabledItems).length === 1);
				$.set_attribute(div_9, 'aria-label', $1);
				$.set_text(text_6, $2);
			},
			[
				() => $.get(enabledItems).length === 1
					? s("settings.categories.lastCategory") || "Cannot disable the last category"
					: s("settings.categories.disable") || "Click to disable, drag to reorder",

				() => $.get(enabledItems).length === 1
					? `${getDisplayName($.get(category))} - last category, cannot disable`
					: `${getDisplayName($.get(category))} - click to disable or drag to reorder`,
				() => getDisplayName($.get(category))
			]
		);

		$.delegated('click', div_9, (e) => {
			e.stopPropagation();
			e.preventDefault();

			if ($.get(enabledItems).length > 1) {
				handleEnabledClick($.get(category).id);
			}
		});

		$.delegated('keydown', div_9, (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				e.stopPropagation();

				if ($.get(enabledItems).length > 1) {
					handleEnabledClick($.get(category).id);
				}
			}
		});

		$.delegated('mousedown', div_9, (e) => {
			if ($.get(enabledItems).length === 1) {
				e.stopPropagation();
			}
		});

		$.animation(div_9, () => flip, () => ({ duration: flipDurationMs }));
		$.append($$anchor, div_9);
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_10 = root_1();
			var text_7 = $.only_child(div_10, true);

			$.template_effect(($0) => $.set_text(text_7, $0), [
				() => s("settings.categories.noEnabled") || "No enabled categories"
			]);

			$.append($$anchor, div_10);
		};

		$.if(node_3, ($$render) => {
			if ($.get(enabledItems).length === 0) $$render(consequent);
		});
	}

	$.reset(div_8);

	$.action(div_8, ($$node, $$action_arg) => dndzone?.($$node, $$action_arg), () => ({
		items: $.get(enabledItems),
		flipDurationMs,
		type: "category",
		dropTargetStyle: {
			outline: "rgba(59, 130, 246, 0.5) solid 2px",
			outlineOffset: "-2px",
			borderRadius: "0.5rem"
		},
		morphDisabled: true,
		dragDisabled: $.get(enabledItems).length === 1
	}));

	$.reset(div_7);

	var div_11 = $.sibling(div_7, 2);
	var div_12 = $.child(div_11);
	var div_13 = $.child(div_12);
	var h4_1 = $.child(div_13);
	var text_8 = $.only_child(h4_1, true);
	var div_14 = $.sibling(h4_1, 2);
	var node_4 = $.child(div_14);

	{
		let $0 = $.derived(() => s("settings.categories.filterByType") || "Filter");
		let $1 = $.derived(() => s("settings.categories.filterPlaceholder") || "All");

		Select(node_4, {
			get options() {
				return $.get(filterOptionsWithCounts);
			},

			get label() {
				return $.get($0);
			},

			get placeholder() {
				return $.get($1);
			},
			className: 'text-xs',
			height: 'h-8',
			onChange: (value) => {
				$.set(categoryFilter, value, true);
			},

			get value() {
				return $.get(categoryFilter);
			},

			set value($$value) {
				$.set(categoryFilter, $$value, true);
			}
		});
	}

	$.reset(div_14);
	$.reset(div_13);

	var div_15 = $.sibling(div_13, 2);
	var node_5 = $.child(div_15);

	IconSearch(node_5, {
		size: 16,
		class: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
	});

	var input = $.sibling(node_5, 2);

	$.remove_input_defaults(input);

	var node_6 = $.sibling(input, 2);

	{
		var consequent_1 = ($$anchor) => {
			var button_1 = root_2();

			$.template_effect(($0) => $.set_attribute(button_1, 'aria-label', $0), [() => s("ui.clear") || "Clear search"]);
			$.delegated('click', button_1, () => $.set(searchQuery, ''));
			$.append($$anchor, button_1);
		};

		$.if(node_6, ($$render) => {
			if ($.get(searchQuery)) $$render(consequent_1);
		});
	}

	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var button_2 = $.child(div_16);
	var node_7 = $.sibling(button_2, 2);

	$.each(node_7, 17, () => allLetters, $.index, ($$anchor, letter) => {
		const hasItems = $.derived(() => $.get(availableLetters).includes($.get(letter)));
		var button_3 = root_3();
		var text_9 = $.only_child(button_3, true);

		$.template_effect(() => {
			button_3.disabled = !$.get(hasItems);

			$.set_class(button_3, 1, `size-6 text-xs font-medium rounded transition-colors focus-visible-ring
              ${$.get(letterFilter) === $.get(letter)
				? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
				: $.get(hasItems)
					? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
					: 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`);

			$.set_attribute(button_3, 'aria-pressed', $.get(letterFilter) === $.get(letter));
			$.set_text(text_9, $.get(letter));
		});

		$.delegated('click', button_3, () => $.set(letterFilter, $.get(letterFilter) === $.get(letter) ? null : $.get(letter), true));
		$.append($$anchor, button_3);
	});

	$.reset(div_16);
	$.reset(div_12);

	var div_17 = $.sibling(div_12, 2);
	let classes_3;
	var node_8 = $.child(div_17);

	$.each(node_8, 27, () => $.get(disabledItems), (category, index) => `disabled-${category.id}-${index}`, ($$anchor, category) => {
		const isCore = $.derived(() => isCoreCategory($.get(category).id));
		const matchesTypeFilter = $.derived(() => $.get(categoryFilter) === "all" || ($.get(categoryFilter) === "core" ? $.get(isCore) : !$.get(isCore)));
		const isFiltered = $.derived(() => !$.get(matchesTypeFilter) || !matchesSearch($.get(category)));
		const isBeingDragged = $.derived(() => $.get(draggedItemId) === $.get(category).id);
		var div_18 = root();
		var span_2 = $.child(div_18);
		var text_10 = $.only_child(span_2, true);

		$.reset(div_18);

		$.template_effect(
			($0, $1, $2) => {
				$.set_class(div_18, 1, `group inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300 focus-visible-ring
						${$.get(isBeingDragged) ? 'opacity-50' : ''} cursor-grab active:cursor-grabbing hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`);

				$.set_style(div_18, $.get(isFiltered) && !$.get(isBeingDragged)
					? "position: absolute; left: -9999px; opacity: 0; pointer-events: none;"
					: "");

				$.set_attribute(div_18, 'title', $0);
				$.set_attribute(div_18, 'tabindex', $.get(isFiltered) ? -1 : 0);
				$.set_attribute(div_18, 'aria-label', $1);
				$.set_text(text_10, $2);
			},
			[
				() => s("settings.categories.enable") || "Click to enable, drag to reorder",
				() => `${getDisplayName($.get(category))} - click to enable or drag to reorder`,
				() => getDisplayName($.get(category))
			]
		);

		$.delegated('click', div_18, (e) => {
			e.stopPropagation();
			e.preventDefault();
			handleDisabledClick($.get(category).id);
		});

		$.delegated('keydown', div_18, (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				e.stopPropagation();
				handleDisabledClick($.get(category).id);
			}
		});

		$.delegated('mousedown', div_18, (e) => e.stopPropagation());
		$.animation(div_18, () => flip, () => ({ duration: flipDurationMs }));
		$.append($$anchor, div_18);
	});

	var node_9 = $.sibling(node_8, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_19 = root_4();
			var text_11 = $.only_child(div_19, true);

			$.template_effect(($0) => $.set_text(text_11, $0), [
				() => s("settings.categories.noDisabled") || "All categories enabled"
			]);

			$.append($$anchor, div_19);
		};

		var consequent_5 = ($$anchor) => {
			var div_20 = root_5();
			var node_10 = $.child(div_20);

			{
				var consequent_3 = ($$anchor) => {
					var text_12 = $.text();

					$.template_effect(($0) => $.set_text(text_12, $0), [
						() => s("settings.categories.noSearchResults") || "No categories match your search"
					]);

					$.append($$anchor, text_12);
				};

				var consequent_4 = ($$anchor) => {
					var text_13 = $.text();

					$.template_effect(($0) => $.set_text(text_13, $0), [
						() => s("settings.categories.noLetterResults") || `No categories starting with "${$.get(letterFilter)}"`
					]);

					$.append($$anchor, text_13);
				};

				var alternate = ($$anchor) => {
					var text_14 = $.text();

					$.template_effect(($0) => $.set_text(text_14, $0), [
						() => s("settings.categories.noFiltered") || "No categories match the current filter"
					]);

					$.append($$anchor, text_14);
				};

				$.if(node_10, ($$render) => {
					if ($.get(searchQuery)) $$render(consequent_3); else if ($.get(letterFilter)) $$render(consequent_4, 1); else $$render(alternate, -1);
				});
			}

			$.reset(div_20);
			$.append($$anchor, div_20);
		};

		var d = $.derived(() => $.get(disabledItems).every((item) => !matchesSearch(item)));

		$.if(node_9, ($$render) => {
			if ($.get(disabledItems).length === 0) $$render(consequent_2); else if ($.get(d)) $$render(consequent_5, 1);
		});
	}

	$.reset(div_17);
	$.bind_this(div_17, ($$value) => $.set(disabledContainerRef, $$value), () => $.get(disabledContainerRef));

	$.action(div_17, ($$node, $$action_arg) => dndzone?.($$node, $$action_arg), () => ({
		items: $.get(disabledItems),
		flipDurationMs,
		type: "category",
		dropTargetStyle: {
			outline: "rgba(156, 163, 175, 0.5) solid 2px",
			outlineOffset: "-2px",
			borderRadius: "0.5rem"
		},
		morphDisabled: true
	}));

	$.reset(div_11);

	var div_21 = $.sibling(div_11, 2);
	var button_4 = $.child(div_21);
	var text_15 = $.only_child(button_4, true);

	$.reset(div_21);
	$.reset(div);

	var node_11 = $.sibling(div, 2);

	ContributeCategoryModal(node_11, {
		get visible() {
			return $.get(showContributeModal);
		},
		onClose: () => $.set(showContributeModal, false)
	});

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
			$.set_text(text_3, $3);
			$.set_text(text_4, $4);

			classes = $.set_class(button, 1, 'focus-visible-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition', null, classes, {
				'bg-blue-600': experimental.disableCategorySwipe,
				'bg-gray-200': !experimental.disableCategorySwipe,
				'dark:bg-gray-600': !experimental.disableCategorySwipe
			});

			$.set_attribute(button, 'aria-checked', experimental.disableCategorySwipe);

			classes_1 = $.set_class(span, 1, 'inline-block h-4 w-4 transform rounded-full bg-white transition', null, classes_1, {
				'ltr:translate-x-6': experimental.disableCategorySwipe,
				'rtl:-translate-x-6': experimental.disableCategorySwipe,
				'ltr:translate-x-1': !experimental.disableCategorySwipe,
				'rtl:-translate-x-1': !experimental.disableCategorySwipe
			});

			$.set_text(text_5, $5);

			classes_2 = $.set_class(div_8, 1, 'min-h-[40px] rounded-lg p-3 flex flex-wrap gap-2 border-2 border-dashed', null, classes_2, {
				'border-gray-300': !$.get(isDragging),
				'dark:border-gray-600': !$.get(isDragging),
				'border-transparent': $.get(isDragging)
			});

			$.set_text(text_8, $6);
			$.set_attribute(input, 'placeholder', $7);

			$.set_class(button_2, 1, `px-1.5 py-0.5 text-xs font-medium rounded transition-colors focus-visible-ring
            ${$.get(letterFilter) === null
				? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
				: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'}`);

			$.set_attribute(button_2, 'aria-pressed', $.get(letterFilter) === null);

			classes_3 = $.set_class(div_17, 1, 'rounded-lg p-3 flex flex-wrap gap-2 content-start border-2 border-dashed', null, classes_3, {
				'border-gray-300': !$.get(isDragging),
				'dark:border-gray-600': !$.get(isDragging),
				'border-transparent': $.get(isDragging)
			});

			$.set_style(div_17, `min-height: ${$.get(containerMinHeight) ?? ''}px`);
			$.set_text(text_15, $8);
		},
		[
			() => s("settings.categories.instructions") || "Drag to reorder categories or click to enable/disable them.",
			() => s("settings.categories.singlePageMode.description") || "Choose how to display stories: in tabs (default), or all in a single page with different ordering options.",
			() => s("settings.categoryHeaderPosition.description") || "Choose where category tabs appear on mobile devices",
			() => s("settings.experimental.disableCategorySwipe.label") || "Disable horizontal category swiping",
			() => s("settings.experimental.disableCategorySwipe.description") || "When enabled, horizontal swiping to change categories on mobile devices will be disabled.",
			() => s("settings.categories.enabled") || "Enabled Categories",
			() => s("settings.categories.disabled") || "Available Categories",
			() => s("settings.categories.searchPlaceholder") || "Search categories...",
			() => s("settings.categories.contribute") || "+ Contribute a category"
		]
	);

	$.delegated('click', button, toggleDisableCategorySwipe);
	$.event('consider', div_8, handleEnabledConsider);
	$.event('finalize', div_8, handleEnabledFinalize);
	$.bind_value(input, () => $.get(searchQuery), ($$value) => $.set(searchQuery, $$value));
	$.delegated('click', button_2, () => $.set(letterFilter, null));
	$.event('consider', div_17, handleDisabledConsider);
	$.event('finalize', div_17, handleDisabledFinalize);
	$.delegated('click', button_4, () => $.set(showContributeModal, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown', 'mousedown']);