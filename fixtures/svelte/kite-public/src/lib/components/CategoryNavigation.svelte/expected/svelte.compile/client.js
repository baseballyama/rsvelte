import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div role="tab"><span> </span></div>`);
var root_1 = $.from_html(`<div><div class="relative flex items-center"><div class="relative flex w-full items-center"><button aria-label="Scroll categories left"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button> <div class="category-tabs scrollbar-hide flex-1 overflow-x-auto flex svelte-1ooartu" role="tablist" aria-label="News categories"></div> <button aria-label="Scroll categories right"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg></button></div></div></div>`);

export default function CategoryNavigation($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let categories = $.prop($$props, 'categories', 19, () => []),
		currentCategory = $.prop($$props, 'currentCategory', 3, 'World'),
		mobilePosition = $.prop($$props, 'mobilePosition', 3, 'bottom'),
		temporaryCategory = $.prop($$props, 'temporaryCategory', 3, null),
		showTemporaryTooltip = $.prop($$props, 'showTemporaryTooltip', 3, false);

	// Overflow detection state
	let hasOverflow = $.state(false);

	let tabsElement = undefined; // Assigned via bind:this
	let temporaryCategoryElement = null;
	let categoryElements = $.proxy({});

	// Touch device detection - true if device has a fine pointer (mouse) with hover capability
	let hasFinePointer = $.state(false);

	// Drag and drop state
	let isDragging = $.state(false);

	let draggedItemId = $.state(null);
	let hoveredCategory = $.state(null);
	let items = $.state($.proxy([]));
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
		if ($$props.onCategoryChange) {
			$$props.onCategoryChange(categoryId);
		}
	}

	// Sync items with categories prop
	$.user_effect(() => {
		if (!$.get(isDragging)) {
			$.set(items, categories().map((cat) => ({ id: cat.id, category: cat })), true);
		}
	});

	// Drag handlers
	function handleConsider(e) {
		const { trigger, id } = e.detail.info;

		if (trigger === TRIGGERS.DRAG_STARTED) {
			$.set(isDragging, true);
			$.set(draggedItemId, id, true);
			$.set(hoveredCategory, null // Hide X buttons during drag
			);
		}

		$.set(items, e.detail.items, true);
	}

	function handleFinalize(e) {
		$.set(isDragging, false);
		$.set(draggedItemId, null);

		const newEnabled = e.detail.items.map((item) => item.id);

		categorySettings.setEnabled(newEnabled);
		$.set(items, e.detail.items, true);
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
		const currentIndex = categories().findIndex((cat) => cat.id === categoryId);

		let newIndex = null;

		switch (event.key) {
			case 'ArrowLeft':

			case 'ArrowUp':
				event.preventDefault();
				// Move to previous category, wrap to end
				newIndex = currentIndex > 0 ? currentIndex - 1 : categories().length - 1;
				break;

			case 'ArrowRight':

			case 'ArrowDown':
				event.preventDefault();
				// Move to next category, wrap to start
				newIndex = currentIndex < categories().length - 1 ? currentIndex + 1 : 0;
				break;

			case 'Home':
				event.preventDefault();
				newIndex = 0;
				break;

			case 'End':
				event.preventDefault();
				newIndex = categories().length - 1;
				break;
		}

		// Navigate to the new category if arrow/home/end was pressed
		if (newIndex !== null && newIndex !== currentIndex) {
			const newCategory = categories()[newIndex];

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

			if (newValue !== $.get(hasOverflow)) {
				$.set(hasOverflow, newValue);
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

			$.set(hasFinePointer, mediaQuery.matches, true);

			// Listen for changes (e.g., user connects/disconnects mouse)
			const handlePointerChange = (e) => {
				$.set(hasFinePointer, e.matches, true);
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
	$.user_effect(() => {
		void categories(); // Track changes
		setTimeout(() => checkOverflow(), 0);
	});

	// Watch for font size changes
	$.user_effect(() => {
		void displaySettings.fontSize; // React to font size changes

		// Use a longer delay to ensure CSS changes have taken effect
		setTimeout(() => checkOverflow(), 100);
	});

	// On initial load, scroll active category to the start of the nav bar
	let initialScrollDone = false;

	$.user_effect(() => {
		if (currentCategory() && browser && tabsElement && !initialScrollDone) {
			initialScrollDone = true;

			tick().then(() => {
				const el = categoryElements[currentCategory()];

				if (el && tabsElement) {
					const containerRect = tabsElement.getBoundingClientRect();
					const elRect = el.getBoundingClientRect();
					const scrollLeft = elRect.left - containerRect.left + tabsElement.scrollLeft;

					// Jump most of the way instantly, then smooth the last bit for a fast reveal
					const target = Math.max(0, scrollLeft);

					const jumpTo = Math.max(0, target - 150);

					tabsElement.scrollLeft = jumpTo;
					tabsElement.scrollTo({ left: target, behavior: 'smooth' });
				}
			});
		}
	});

	// Scroll to temporary category when it's added (not when removed)
	$.user_effect(() => {
		if (temporaryCategory() && browser) {
			// Hide tooltip while scrolling
			if ($$props.onTemporaryScrollStart) {
				$$props.onTemporaryScrollStart();
			}

			// Wait for DOM to update and category element to be rendered
			tick().then(() => {
				// Add a small delay to ensure layout is complete
				setTimeout(
					() => {
						const categoryElement = untrack(() => categoryElements[temporaryCategory()]);

						if (categoryElement && tabsElement) {
							// Simply scroll all the way to the right (max scroll)
							const maxScroll = tabsElement.scrollWidth - tabsElement.clientWidth;

							tabsElement.scrollTo({ left: maxScroll, behavior: 'smooth' });

							// Show tooltip after scroll completes (smooth scroll takes ~300-500ms)
							setTimeout(
								() => {
									if ($$props.onTemporaryScrollEnd) {
										$$props.onTemporaryScrollEnd();
									}
								},
								500
							);
						}
					},
					100
				);
			});
		}
	});

	var $$exports = { getCategoryElement };
	var div = root_1();
	let classes;
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var button = $.child(div_2);
	let classes_1;
	var div_3 = $.sibling(button, 2);

	$.each(div_3, 29, () => $.get(items), (item) => item.id, ($$anchor, item) => {
		const category = $.derived(() => $.get(item).category);
		var div_4 = root();
		let classes_2;
		var span = $.child(div_4);
		var text = $.only_child(span, true);

		$.reset(div_4);
		$.bind_this(div_4, ($$value, category) => categoryElements[category.id] = $$value, (category) => categoryElements?.[category.id], () => [$.get(category)]);

		$.template_effect(
			($0) => {
				classes_2 = $.set_class(div_4, 1, `category-tab-wrapper ${$.get(draggedItemId) === $.get(item).id ? 'opacity-50' : ''}`, 'svelte-1ooartu', classes_2, { dragging: $.get(isDragging) });
				$.set_attribute(div_4, 'tabindex', currentCategory() === $.get(category).id ? 0 : -1);
				$.set_attribute(div_4, 'aria-selected', currentCategory() === $.get(category).id);
				$.set_attribute(div_4, 'aria-controls', `category-${$.get(category).id ?? ''}`);

				$.set_class(
					span,
					1,
					`category-tab whitespace-nowrap ps-4 pe-1 py-2 md:py-3 text-base font-medium transition-colors focus-visible-ring
                ${currentCategory() === $.get(category).id
						? 'active text-blue-600 border-b-2 border-blue-600'
						: 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`,
					'svelte-1ooartu'
				);

				$.set_text(text, $0);
			},
			[() => getDisplayName($.get(category))]
		);

		$.delegated('click', div_4, () => handleCategoryClick($.get(category).id));
		$.delegated('keydown', div_4, (e) => handleCategoryKeydown(e, $.get(category).id));
		$.delegated('dblclick', div_4, () => displaySettings.storyExpandMode !== "never" && $$props.onCategoryDoubleClick?.($.get(category).id));
		$.animation(div_4, () => flip, () => ({ duration: flipDurationMs }));
		$.append($$anchor, div_4);
	});

	$.reset(div_3);
	$.bind_this(div_3, ($$value) => tabsElement = $$value, () => tabsElement);

	$.action(div_3, ($$node, $$action_arg) => dndzone?.($$node, $$action_arg), () => ({
		items: $.get(items),
		flipDurationMs,
		type: "nav-category",
		dropTargetStyle: {},
		dropTargetClasses: [],
		morphDisabled: true,
		dragDisabled: $.get(items).length <= 1 || !$.get(hasFinePointer),
		transformDraggedElement: (el) => {
			if (el) {
				el.style.outline = 'none';
				el.style.boxShadow = 'none';
				el.style.border = 'none';
			}
		}
	}));

	var button_1 = $.sibling(div_3, 2);
	let classes_3;

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(
			div,
			1,
			`category-slider-container dark:bg-dark-bg
	md:relative md:bg-transparent md:dark:bg-transparent md:px-0 md:pb-2 md:shadow-none md:start-auto md:end-auto md:top-auto md:bottom-auto
	${mobilePosition() === 'integrated'
				? 'relative bg-white dark:bg-gray-900 px-6 pb-2'
				: 'fixed z-modal bg-white px-6 start-0 end-0'}
	${mobilePosition() === 'top'
				? 'top-[88px] pt-1 pb-0.5 shadow-[0_4px_8px_rgba(0,0,0,0.1)]'
				: ''}
	${mobilePosition() === 'bottom'
				? 'bottom-0 pb-1 shadow-[0_-4px_8px_rgba(0,0,0,0.1)]'
				: ''}`,
			'svelte-1ooartu',
			classes,
			{ 'bottom-safe': mobilePosition() === "bottom" }
		);

		classes_1 = $.set_class(button, 1, 'relative -ms-1 hidden py-3 pe-4 text-gray-400 transition-colors hover:text-gray-600 focus-visible-ring md:block dark:text-gray-500 dark:hover:text-gray-300', null, classes_1, { 'md:hidden': !$.get(hasOverflow) });
		classes_3 = $.set_class(button_1, 1, 'relative -me-1 hidden py-3 ps-4 text-gray-400 transition-colors hover:text-gray-600 focus-visible-ring md:block dark:text-gray-500 dark:hover:text-gray-300', null, classes_3, { 'md:hidden': !$.get(hasOverflow) });
	});

	$.delegated('click', button, scrollLeft);
	$.event('scroll', div_3, checkOverflow);
	$.event('consider', div_3, handleConsider);
	$.event('finalize', div_3, handleFinalize);
	$.delegated('click', button_1, scrollRight);
	$.append($$anchor, div);

	return $.pop($$exports);
}

$.delegate(['click', 'keydown', 'dblclick']);