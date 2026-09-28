import * as $ from 'svelte/internal/server';
import { onMount, tick, untrack } from 'svelte';
import { flip } from 'svelte/animate';
import { fade } from 'svelte/transition';
import { dndzone, TRIGGERS } from 'svelte-dnd-action';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { categorySettings, displaySettings } from '$lib/data/settings.svelte.js';
import { categoryMetadataStore } from '$lib/stores/categoryMetadata.svelte';
import { getCategoryDisplayName } from '$lib/utils/category';
import { toCamelCase } from '$lib/utils/string.js';

export default function CategoryNavigation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			categories = [],
			currentCategory = 'World',
			onCategoryChange,
			onCategoryDoubleClick,
			mobilePosition = 'bottom',
			temporaryCategory = null,
			showTemporaryTooltip = false,
			onTemporaryScrollStart,
			onTemporaryScrollEnd
		} = $$props;

		// Overflow detection state
		let hasOverflow = false;

		let tabsElement = undefined; // Assigned via bind:this
		let temporaryCategoryElement = null;
		let categoryElements = {};

		// Touch device detection - true if device has a fine pointer (mouse) with hover capability
		let hasFinePointer = false;

		// Drag and drop state
		let isDragging = false;

		let draggedItemId = null;
		let hoveredCategory = null;
		let items = [];
		const flipDurationMs = 150;

		// Helper to get display name with metadata lookup from global store
		function getDisplayName(category) {
			const metadata = categoryMetadataStore.findById(category.id);

			if (!metadata) {
				// Fallback: return the name directly if no metadata found
				return category.name;
			}

			return getCategoryDisplayName(category, metadata);
		}

		// Expose a function to get the reference element for the tooltip
		function getCategoryElement(categoryId) {
			return categoryElements[categoryId] || null;
		}

		// Handle category click
		function handleCategoryClick(categoryId) {
			if (onCategoryChange) {
				onCategoryChange(categoryId);
			}
		}

		// Sync items with categories prop
		// Drag handlers
		function handleConsider(e) {
			const { trigger, id } = e.detail.info;

			if (trigger === TRIGGERS.DRAG_STARTED) {
				isDragging = true;
				draggedItemId = id;
				hoveredCategory = null; // Hide X buttons during drag
			}

			items = e.detail.items;
		}

		function handleFinalize(e) {
			isDragging = false;
			draggedItemId = null;

			const newEnabled = e.detail.items.map((item) => item.id);

			categorySettings.setEnabled(newEnabled);
			items = e.detail.items;
		}

		// Handle category key events
		function handleCategoryKeydown(event, categoryId) {
			// Handle activation keys
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				handleCategoryClick(categoryId);

				return;
			}

			// Handle arrow key navigation for ARIA tablist pattern
			const currentIndex = categories.findIndex((cat) => cat.id === categoryId);

			let newIndex = null;

			switch (event.key) {
				case 'ArrowLeft':

				case 'ArrowUp':
					event.preventDefault();
					// Move to previous category, wrap to end
					newIndex = currentIndex > 0 ? currentIndex - 1 : categories.length - 1;
					break;

				case 'ArrowRight':

				case 'ArrowDown':
					event.preventDefault();
					// Move to next category, wrap to start
					newIndex = currentIndex < categories.length - 1 ? currentIndex + 1 : 0;
					break;

				case 'Home':
					event.preventDefault();
					newIndex = 0;
					break;

				case 'End':
					event.preventDefault();
					newIndex = categories.length - 1;
					break;
			}

			// Navigate to the new category if arrow/home/end was pressed
			if (newIndex !== null && newIndex !== currentIndex) {
				const newCategory = categories[newIndex];

				handleCategoryClick(newCategory.id);

				// Focus the new category button after a brief delay
				// This ensures the DOM has updated with the new tabindex
				setTimeout(
					() => {
						const newButton = categoryElements[newCategory.id];

						if (newButton) {
							newButton.focus();

							// Scroll into view if needed
							newButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
						}
					},
					50
				);
			}
		}

		// Check if content overflows
		function checkOverflow() {
			if (tabsElement) {
				const newValue = tabsElement.scrollWidth > tabsElement.clientWidth;

				if (newValue !== hasOverflow) {
					hasOverflow = newValue;
				}
			}
		}

		// Scroll functions
		function scrollLeft() {
			if (tabsElement) {
				tabsElement.scrollBy({ left: -200, behavior: 'smooth' });
			}
		}

		function scrollRight() {
			if (tabsElement) {
				tabsElement.scrollBy({ left: 200, behavior: 'smooth' });
			}
		}

		// Set up overflow detection and pointer type detection
		onMount(() => {
			if (browser) {
				// Check if device has a fine pointer (mouse) with hover capability
				const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

				hasFinePointer = mediaQuery.matches;

				// Listen for changes (e.g., user connects/disconnects mouse)
				const handlePointerChange = (e) => {
					hasFinePointer = e.matches;
				};

				mediaQuery.addEventListener('change', handlePointerChange);

				// Initial check
				setTimeout(() => checkOverflow(), 0);

				// Set up mutation observer to watch for changes in category-tabs
				const observer = new MutationObserver(() => {
					setTimeout(
						() => {
							checkOverflow();

							// Double check after a small delay
							setTimeout(() => checkOverflow(), 100);
						},
						0
					);
				});

				if (tabsElement) {
					observer.observe(tabsElement, { childList: true, subtree: true, attributes: true });
				}

				// Listen for window resize
				const handleResize = () => {
					checkOverflow();
					setTimeout(() => checkOverflow(), 0);
				};

				window.addEventListener('resize', handleResize);

				return () => {
					observer.disconnect();
					window.removeEventListener('resize', handleResize);
					mediaQuery.removeEventListener('change', handlePointerChange);
				};
			}
		});

		// Watch for categories changes
		// Track changes
		// Watch for font size changes
		// React to font size changes
		// Use a longer delay to ensure CSS changes have taken effect
		// On initial load, scroll active category to the start of the nav bar
		let initialScrollDone = false;

		$$renderer.push(`<div${$.attr_class(
			`category-slider-container dark:bg-dark-bg md:relative md:bg-transparent md:dark:bg-transparent md:px-0 md:pb-2 md:shadow-none md:start-auto md:end-auto md:top-auto md:bottom-auto ${// Jump most of the way instantly, then smooth the last bit for a fast reveal
			// Scroll to temporary category when it's added (not when removed)
			// Hide tooltip while scrolling
			// Wait for DOM to update and category element to be rendered
			// Add a small delay to ensure layout is complete
			// Simply scroll all the way to the right (max scroll)
			// Show tooltip after scroll completes (smooth scroll takes ~300-500ms)
			mobilePosition === 'integrated'
				? 'relative bg-white dark:bg-gray-900 px-6 pb-2'
				: 'fixed z-modal bg-white px-6 start-0 end-0'} ${mobilePosition === 'top'
				? 'top-[88px] pt-1 pb-0.5 shadow-[0_4px_8px_rgba(0,0,0,0.1)]'
				: ''} ${mobilePosition === 'bottom'
				? 'bottom-0 pb-1 shadow-[0_-4px_8px_rgba(0,0,0,0.1)]'
				: ''}`,
			'svelte-1ooartu',
			{ 'bottom-safe': mobilePosition === "bottom" }
		)}><div class="relative flex items-center"><div class="relative flex w-full items-center"><button${$.attr_class('relative -ms-1 hidden py-3 pe-4 text-gray-400 transition-colors hover:text-gray-600 focus-visible-ring md:block dark:text-gray-500 dark:hover:text-gray-300', void 0, { 'md:hidden': !hasOverflow })} aria-label="Scroll categories left"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button> <div class="category-tabs scrollbar-hide flex-1 overflow-x-auto flex svelte-1ooartu" role="tablist" aria-label="News categories"><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			const category = item.category;

			$$renderer.push(`<div${$.attr_class(`category-tab-wrapper ${draggedItemId === item.id ? 'opacity-50' : ''}`, 'svelte-1ooartu', { 'dragging': isDragging })} role="tab"${$.attr('tabindex', currentCategory === category.id ? 0 : -1)}${$.attr('aria-selected', currentCategory === category.id)}${$.attr('aria-controls', `category-${$.stringify(category.id)}`)}><span${$.attr_class(
				`category-tab whitespace-nowrap ps-4 pe-1 py-2 md:py-3 text-base font-medium transition-colors focus-visible-ring ${currentCategory === category.id
					? 'active text-blue-600 border-b-2 border-blue-600'
					: 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`,
				'svelte-1ooartu'
			)}>${$.escape(getDisplayName(category))}</span></div>`);
		}

		$$renderer.push(`<!--]--></div> <button${$.attr_class('relative -me-1 hidden py-3 ps-4 text-gray-400 transition-colors hover:text-gray-600 focus-visible-ring md:block dark:text-gray-500 dark:hover:text-gray-300', void 0, { 'md:hidden': !hasOverflow })} aria-label="Scroll categories right"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg></button></div></div></div>`);
		$.bind_props($$props, { getCategoryElement });
	});
}