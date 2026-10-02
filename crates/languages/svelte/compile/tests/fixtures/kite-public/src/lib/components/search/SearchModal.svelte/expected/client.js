import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconLoader2 } from '@tabler/icons-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { SearchService } from '$lib/services/search';
import { scrollLock } from '$lib/utils/scrollLock';
import SearchInput from './SearchInput.svelte';
import SearchResults from './SearchResults.svelte';

var root = $.from_html(`<div class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center"><div class="text-center"><!> <p class="text-sm text-gray-600 dark:text-gray-400"> </p></div></div>`);
var root_1 = $.from_html(`<div class="fixed inset-0 z-modal flex items-start justify-center pt-20 px-4" style="touch-action: none;"><button></button> <div style="touch-action: pan-y;"><!> <div class="border-b border-gray-200 dark:border-gray-700"><!></div> <!> <div class="hidden sm:block px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"><div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"><div class="flex items-center gap-4"><span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">↑↓</kbd> </span> <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> </span> <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> </span></div> <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs"> </kbd> <span>+</span> <kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">K</kbd> </span></div></div></div></div>`);

export default function SearchModal($$anchor, $$props) {
	$.push($$props, true);

	// Initialize search service
	let searchService;

	let searchInput = $.state(void 0);

	// Local state
	let searchState = $.proxy({
		query: '',
		filters: [], // TODO: fix type
		results: [],
		localResults: [],
		historicalResults: [],
		isLoading: false,
		isSearchingHistorical: false,
		isLoadingMore: false,
		hasMore: false,
		selectedIndex: 0,
		localCount: 0,
		historicalCount: 0,
		totalCount: 0
	});

	let filterSuggestions = $.state($.proxy([]));
	let filterSuggestionIndex = $.state(0);
	let showFilterSuggestions = $.state(false);
	let isLoadingBatch = $.state(false);
	let currentFilterContext = $.state(null);

	// Initialize search service when categories change
	$.user_effect(() => {
		if ($$props.categories.length > 0) {
			if (!searchService) {
				searchService = new SearchService($$props.categories);
			} else {
				searchService.updateCategories($$props.categories);
			}
		}
	});

	// Initialize search service when visible
	$.user_effect(() => {
		if ($$props.visible && searchService) {
			// Clear search when opening
			searchService.clear();

			searchState.filters = [];
			searchState.query = '';

			// Reset loading state when modal opens
			$.set(isLoadingBatch, false);

			// Focus input
			if ($.get(searchInput)) {
				const element = $.get(searchInput).getElement();

				if (element) {
					setTimeout(() => element.focus(), 0);
				}
			}
		}
	});

	// Handle scroll lock
	$.user_effect(() => {
		if (!browser) return;

		if ($$props.visible) {
			scrollLock.lock();

			return () => scrollLock.unlock();
		}
	});

	// Platform detection for keyboard shortcuts
	const isMac = $.derived(() => browser && ('userAgentData' in navigator && navigator.userAgentData?.platform === 'macOS' || navigator.userAgent.toUpperCase().indexOf('MAC') >= 0));

	async function handleInput(text, cursorPosition) {
		if (!searchService) return;

		const result = searchService.updateFromInput(text, cursorPosition);

		// Update filter suggestions and context
		$.set(filterSuggestions, result.suggestions, true);

		$.set(currentFilterContext, result.context, true);
		$.set(showFilterSuggestions, $.get(filterSuggestions).length > 0);
		$.set(filterSuggestionIndex, 0);

		// Update local state
		const state = searchService.getState();

		searchState.query = state.query;
		searchState.filters = state.filters;

		// Clear historical search state when query changes
		searchState.isSearchingHistorical = false;

		searchState.historicalCount = 0;
		searchState.historicalResults = [];
		searchState.totalCount = 0;

		// Execute search
		if (state.query || state.filters.some((f) => f.isValid)) {
			try {
				searchState.isLoading = true;

				// Start search with progressive updates
				searchService.executeSearch(
					$$props.allCategoryStories,
					$$props.categories,
					undefined,
					(localResults, count) => {
						searchState.results = localResults;
						searchState.localResults = localResults;
						searchState.localCount = count;
						searchState.selectedIndex = 0;
						searchState.isLoading = false;
					},
					() => {
						searchState.isSearchingHistorical = true;
					},
					(historicalResults, count) => {
						searchState.isSearchingHistorical = false;
						searchState.historicalResults = historicalResults;
						searchState.historicalCount = count;

						// Get combined results from service
						const state = searchService.getState();

						searchState.results = state.results;
						searchState.totalCount = state.totalCount;
						searchState.hasMore = state.hasMore;
					},
					() => {
						searchState.isSearchingHistorical = false;
					}
				).catch((error) => {
					if (error?.name !== 'AbortError') {
						console.error('Search failed:', error);
					}

					searchState.isLoading = false;
				});
			} catch(error) {
				if (error instanceof Error && error.name !== 'AbortError') {
					console.error('Search failed:', error);
				}

				searchState.isLoading = false;
				searchState.isSearchingHistorical = false;
			}
		} else {
			// Clear results and cancel any in-flight searches
			searchService.clear();

			searchState.results = [];
			searchState.localResults = [];
			searchState.historicalResults = [];
			searchState.hasMore = false;
			searchState.selectedIndex = 0;
			searchState.isSearchingHistorical = false;
			searchState.isLoading = false;
			searchState.localCount = 0;
			searchState.historicalCount = 0;
			searchState.totalCount = 0;
		}
	}

	function handleKeyDown(event) {
		// Filter suggestions take priority when visible
		if ($.get(showFilterSuggestions)) {
			handleFilterKeyboard(event);
		} else {
			handleSearchKeyboard(event);
		}
	}

	function handleFilterKeyboard(event) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				event.stopPropagation();
				// Stop at the last suggestion, don't loop
				$.set(filterSuggestionIndex, Math.min($.get(filterSuggestionIndex) + 1, $.get(filterSuggestions).length - 1), true);
				break;

			case 'ArrowUp':
				event.preventDefault();
				event.stopPropagation();
				// Stop at the first suggestion, don't loop
				$.set(filterSuggestionIndex, Math.max($.get(filterSuggestionIndex) - 1, 0), true);
				break;

			case 'Enter':

			case 'Tab':
				{
					event.preventDefault();
					event.stopPropagation();

					const selected = $.get(filterSuggestions)[$.get(filterSuggestionIndex)];

					if (selected && searchService) {
						handleApplySuggestion(selected);
					}

					break;
				}

			case 'Escape':
				event.preventDefault();
				$.set(showFilterSuggestions, false);
				break;
		}
	}

	function handleSearchKeyboard(event) {
		switch (event.key) {
			case 'Enter':
				event.preventDefault();
				if (searchState.results[searchState.selectedIndex]) {
					handleSelectResult(searchState.results[searchState.selectedIndex]);
				}
				break;

			case 'ArrowDown':
				event.preventDefault();
				if (searchState.results.length > 0) {
					// Stop at the last item, don't loop
					searchState.selectedIndex = Math.min(searchState.selectedIndex + 1, searchState.results.length - 1);
				}
				break;

			case 'ArrowUp':
				event.preventDefault();
				if (searchState.results.length > 0) {
					// Stop at the first item, don't loop
					searchState.selectedIndex = Math.max(searchState.selectedIndex - 1, 0);
				}
				break;

			case 'Backspace':
				// Backspace is handled naturally by the contenteditable
				break;

			case 'Escape':
				event.preventDefault();
				if (!$.get(isLoadingBatch)) {
					$$props.onClose();
				}
				break;
		}
	}

	function handleApplySuggestion(suggestion) {
		if (!searchService || !$.get(currentFilterContext)) return;

		// For filter type suggestions (e.g., "cat" -> "category:"), just replace the text
		if (suggestion.isFilterType) {
			const element = $.get(searchInput)?.getElement();

			if (element) {
				// Replace the partial text with the filter type
				const text = element.textContent || '';

				const newText = text.replace(/\b\w+$/, suggestion.value);

				element.textContent = newText;

				// Place cursor at the end
				const range = document.createRange();

				const sel = window.getSelection();

				range.selectNodeContents(element);
				range.collapse(false);
				sel?.removeAllRanges();
				sel?.addRange(range);
			}
		} else {
			// Add the filter to the state
			const newFilter = {
				type: $.get(currentFilterContext).type,
				value: suggestion.value,
				display: suggestion.display || suggestion.value,
				isValid: true
			};

			searchState.filters = [...searchState.filters, newFilter];

			// Clear the filter text from the input
			const element = $.get(searchInput)?.getElement();

			if (element) {
				const text = element.textContent || '';

				// Remove the filter pattern (e.g., "category:wor")
				const newText = text.replace(/\b(category|date|from|to):\S*\s*$/i, '');

				element.textContent = newText;

				// Place cursor at the end
				const range = document.createRange();

				const sel = window.getSelection();

				range.selectNodeContents(element);
				range.collapse(false);
				sel?.removeAllRanges();
				sel?.addRange(range);
			}

			// Update search service state
			searchService.state.filters = searchState.filters;

			// Execute search with the new filter
			executeSearchWithCurrentState();
		}

		// Clear suggestions
		$.set(showFilterSuggestions, false);

		$.set(filterSuggestions, [], true);
		$.set(currentFilterContext, null);
		$.set(filterSuggestionIndex, 0);
	}

	function handleRemoveFilter(index) {
		// Remove the filter at the specified index
		searchState.filters = searchState.filters.filter((_, i) => i !== index);

		// Update search service state
		if (searchService) {
			searchService.state.filters = searchState.filters;
		}

		// Re-execute search
		executeSearchWithCurrentState();
	}

	function executeSearchWithCurrentState() {
		if (!searchService) return;

		// Execute search with current query and filters
		if (searchState.query || searchState.filters.some((f) => f.isValid)) {
			try {
				searchState.isLoading = true;

				searchService.executeSearch(
					$$props.allCategoryStories,
					$$props.categories,
					undefined,
					(localResults, count) => {
						searchState.results = localResults;
						searchState.localResults = localResults;
						searchState.localCount = count;
						searchState.selectedIndex = 0;
						searchState.isLoading = false;
					},
					() => {
						searchState.isSearchingHistorical = true;
					},
					(historicalResults, count) => {
						searchState.isSearchingHistorical = false;
						searchState.historicalResults = historicalResults;
						searchState.historicalCount = count;

						const state = searchService.getState();

						searchState.results = state.results;
						searchState.totalCount = state.totalCount;
						searchState.hasMore = state.hasMore;
					},
					() => {
						searchState.isSearchingHistorical = false;
					}
				).catch((error) => {
					if (error?.name !== 'AbortError') {
						console.error('Search failed:', error);
					}

					searchState.isLoading = false;
				});
			} catch(error) {
				console.error('Search failed:', error);
				searchState.isLoading = false;
				searchState.isSearchingHistorical = false;
			}
		} else {
			searchState.results = [];
			searchState.localResults = [];
			searchState.historicalResults = [];
			searchState.hasMore = false;
			searchState.selectedIndex = 0;
		}
	}

	async function handleLoadMore() {
		if (!searchService || searchState.isLoadingMore) return;

		searchState.isLoadingMore = true;

		try {
			await searchService.loadMoreResults();

			// Update state with new results after loading
			const state = searchService.getState();

			searchState.results = state.results;
			searchState.hasMore = state.hasMore;
			searchState.totalCount = state.totalCount;
			searchState.historicalCount = state.totalCount;
		} catch(error) {
			console.error('Failed to load more results:', error);
		} finally {
			searchState.isLoadingMore = false;
		}
	}

	async function handleSelectResult(result) {
		try {
			if (result.batchId) {
				$.set(isLoadingBatch, true);
			}

			await $$props.onSelectStory(result.categoryId, result.story, result.batchId, result.batchDate);

			// Only close modal if not loading batch (current results)
			// Historical results will close the modal after loading completes
			if (!result.batchId) {
				$$props.onClose();
			}
		} catch(error) {
			console.error('Error selecting story:', error);
			$.set(isLoadingBatch, false);
		}
	}

	// Cleanup
	$.user_effect(() => {
		return () => {
			if (searchService) {
				searchService.destroy();
			}
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var button = $.child(div);
			var div_1 = $.sibling(button, 2);
			var node_1 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					var div_2 = root();
					var div_3 = $.child(div_2);
					var node_2 = $.child(div_3);

					IconLoader2(node_2, { class: 'size-8 text-blue-500 animate-spin mx-auto mb-4' });

					var p = $.sibling(node_2, 2);
					var text_1 = $.only_child(p, true);

					$.reset(div_3);
					$.reset(div_2);

					$.template_effect(($0) => $.set_text(text_1, $0), [
						() => s("search.loading_historical_data") || "Loading historical data..."
					]);

					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isLoadingBatch)) $$render(consequent);
				});
			}

			var div_4 = $.sibling(node_1, 2);
			var node_3 = $.child(div_4);

			$.bind_this(
				SearchInput(node_3, {
					get filters() {
						return searchState.filters;
					},

					get suggestions() {
						return $.get(filterSuggestions);
					},

					get selectedSuggestionIndex() {
						return $.get(filterSuggestionIndex);
					},

					get isLoading() {
						return searchState.isLoading;
					},
					onInput: handleInput,
					onKeydown: handleKeyDown,
					onApplySuggestion: handleApplySuggestion,
					onRemoveFilter: handleRemoveFilter
				}),
				($$value) => $.set(searchInput, $$value, true),
				() => $.get(searchInput)
			);

			$.reset(div_4);

			var node_4 = $.sibling(div_4, 2);

			{
				let $0 = $.derived(() => searchState.totalCount || searchState.results.length);

				SearchResults(node_4, {
					get results() {
						return searchState.results;
					},

					get selectedIndex() {
						return searchState.selectedIndex;
					},

					get isLoading() {
						return searchState.isLoading;
					},

					get isSearchingHistorical() {
						return searchState.isSearchingHistorical;
					},

					get isLoadingMore() {
						return searchState.isLoadingMore;
					},

					get hasMore() {
						return searchState.hasMore;
					},

					get query() {
						return searchState.query;
					},

					get totalCount() {
						return $.get($0);
					},

					get localCount() {
						return searchState.localCount;
					},

					get historicalCount() {
						return searchState.historicalCount;
					},
					onSelectResult: handleSelectResult,
					onLoadMore: handleLoadMore
				});
			}

			var div_5 = $.sibling(node_4, 2);
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var span = $.child(div_7);
			var text_2 = $.sibling($.child(span));

			$.reset(span);

			var span_1 = $.sibling(span, 2);
			var text_3 = $.sibling($.child(span_1));

			$.reset(span_1);

			var span_2 = $.sibling(span_1, 2);
			var text_4 = $.sibling($.child(span_2));

			$.reset(span_2);
			$.reset(div_7);

			var span_3 = $.sibling(div_7, 2);
			var kbd = $.child(span_3);
			var text_5 = $.only_child(kbd, true);
			var text_6 = $.sibling(kbd, 5);

			$.reset(span_3);
			$.reset(div_6);
			$.reset(div_5);
			$.reset(div_1);
			$.reset(div);

			$.template_effect(
				($0, $1, $2, $3, $4) => {
					$.set_class(button, 1, `absolute inset-0 bg-black/20 dark:bg-black/40 ${$.get(isLoadingBatch) ? 'cursor-not-allowed' : ''}`);
					$.set_attribute(button, 'aria-label', $0);
					button.disabled = $.get(isLoadingBatch);
					$.set_class(div_1, 1, `relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden ${$.get(isLoadingBatch) ? 'pointer-events-none' : ''}`);
					$.set_text(text_2, ` ${$1 ?? ''}`);
					$.set_text(text_3, ` ${$2 ?? ''}`);
					$.set_text(text_4, ` ${$3 ?? ''}`);
					$.set_text(text_5, $.get(isMac) ? '⌘' : 'Ctrl');
					$.set_text(text_6, ` ${$4 ?? ''}`);
				},
				[
					() => s("search.close_search") || "Close search",
					() => s("search.navigate") || "navigate",
					() => s("search.select") || "select",
					() => s("search.close") || "close",
					() => s("search.search") || "search"
				]
			);

			$.delegated('touchmove', div, (e) => e.preventDefault(), void 0, true);

			$.delegated('click', button, () => {
				if (!$.get(isLoadingBatch)) {
					$$props.onClose();
				}
			});

			$.delegated('touchmove', div_1, (e) => e.stopPropagation(), void 0, true);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.visible) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['touchmove', 'click']);