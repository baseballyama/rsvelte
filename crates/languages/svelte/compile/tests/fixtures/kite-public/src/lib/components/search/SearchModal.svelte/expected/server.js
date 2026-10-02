import * as $ from 'svelte/internal/server';
import { IconLoader2 } from '@tabler/icons-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { SearchService } from '$lib/services/search';
import { scrollLock } from '$lib/utils/scrollLock';
import SearchInput from './SearchInput.svelte';
import SearchResults from './SearchResults.svelte';

export default function SearchModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			visible,
			allCategoryStories,
			categories,
			onClose,
			onSelectStory
		} = $$props;

		// Initialize search service
		let searchService;

		let searchInput = void 0;

		// Local state
		let searchState = {
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
		};

		let filterSuggestions = [];
		let filterSuggestionIndex = 0;
		let showFilterSuggestions = false;
		let isLoadingBatch = false;
		let currentFilterContext = null;

		// Initialize search service when categories change
		// Initialize search service when visible
		// Clear search when opening
		// Reset loading state when modal opens
		// Focus input
		// Handle scroll lock
		// Platform detection for keyboard shortcuts
		const isMac = $.derived(() => browser && ('userAgentData' in navigator && navigator.userAgentData?.platform === 'macOS' || navigator.userAgent.toUpperCase().indexOf('MAC') >= 0));

		async function handleInput(text, cursorPosition) {
			if (!searchService) return;

			const result = searchService.updateFromInput(text, cursorPosition);

			// Update filter suggestions and context
			filterSuggestions = result.suggestions;

			currentFilterContext = result.context;
			showFilterSuggestions = filterSuggestions.length > 0;
			filterSuggestionIndex = 0;

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
						allCategoryStories,
						categories,
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
			if (showFilterSuggestions) {
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
					filterSuggestionIndex = Math.min(filterSuggestionIndex + 1, filterSuggestions.length - 1);
					break;

				case 'ArrowUp':
					event.preventDefault();
					event.stopPropagation();
					// Stop at the first suggestion, don't loop
					filterSuggestionIndex = Math.max(filterSuggestionIndex - 1, 0);
					break;

				case 'Enter':

				case 'Tab':
					{
						event.preventDefault();
						event.stopPropagation();

						const selected = filterSuggestions[filterSuggestionIndex];

						if (selected && searchService) {
							handleApplySuggestion(selected);
						}

						break;
					}

				case 'Escape':
					event.preventDefault();
					showFilterSuggestions = false;
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
					if (!isLoadingBatch) {
						onClose();
					}
					break;
			}
		}

		function handleApplySuggestion(suggestion) {
			if (!searchService || !currentFilterContext) return;

			// For filter type suggestions (e.g., "cat" -> "category:"), just replace the text
			if (suggestion.isFilterType) {
				const element = searchInput?.getElement();

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
					type: currentFilterContext.type,
					value: suggestion.value,
					display: suggestion.display || suggestion.value,
					isValid: true
				};

				searchState.filters = [...searchState.filters, newFilter];

				// Clear the filter text from the input
				const element = searchInput?.getElement();

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
			showFilterSuggestions = false;

			filterSuggestions = [];
			currentFilterContext = null;
			filterSuggestionIndex = 0;
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
						allCategoryStories,
						categories,
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
					isLoadingBatch = true;
				}

				await onSelectStory(result.categoryId, result.story, result.batchId, result.batchDate);

				// Only close modal if not loading batch (current results)
				// Historical results will close the modal after loading completes
				if (!result.batchId) {
					onClose();
				}
			} catch(error) {
				console.error('Error selecting story:', error);
				isLoadingBatch = false;
			}
		}

		if (// Cleanup
		visible) {
			$$renderer.push(`<!--[0--><div class="fixed inset-0 z-modal flex items-start justify-center pt-20 px-4" style="touch-action: none;"><button${$.attr_class(`absolute inset-0 bg-black/20 dark:bg-black/40 ${isLoadingBatch ? 'cursor-not-allowed' : ''}`)}${$.attr('aria-label', s("search.close_search") || "Close search")}${$.attr('disabled', isLoadingBatch, true)}></button> <div${$.attr_class(`relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden ${isLoadingBatch ? 'pointer-events-none' : ''}`)} style="touch-action: pan-y;">`);

			if (isLoadingBatch) {
				$$renderer.push(`<!--[0--><div class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center"><div class="text-center">`);
				IconLoader2($$renderer, { class: 'size-8 text-blue-500 animate-spin mx-auto mb-4' });
				$$renderer.push(`<!----> <p class="text-sm text-gray-600 dark:text-gray-400">${$.escape(s("search.loading_historical_data") || "Loading historical data...")}</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="border-b border-gray-200 dark:border-gray-700">`);

			SearchInput($$renderer, {
				filters: searchState.filters,
				suggestions: filterSuggestions,
				selectedSuggestionIndex: filterSuggestionIndex,
				isLoading: searchState.isLoading,
				onInput: handleInput,
				onKeydown: handleKeyDown,
				onApplySuggestion: handleApplySuggestion,
				onRemoveFilter: handleRemoveFilter
			});

			$$renderer.push(`<!----></div> `);

			SearchResults($$renderer, {
				results: searchState.results,
				selectedIndex: searchState.selectedIndex,
				isLoading: searchState.isLoading,
				isSearchingHistorical: searchState.isSearchingHistorical,
				isLoadingMore: searchState.isLoadingMore,
				hasMore: searchState.hasMore,
				query: searchState.query,
				totalCount: searchState.totalCount || searchState.results.length,
				localCount: searchState.localCount,
				historicalCount: searchState.historicalCount,
				onSelectResult: handleSelectResult,
				onLoadMore: handleLoadMore
			});

			$$renderer.push(`<!----> <div class="hidden sm:block px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"><div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"><div class="flex items-center gap-4"><span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">↑↓</kbd> ${$.escape(s("search.navigate") || "navigate")}</span> <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> ${$.escape(s("search.select") || "select")}</span> <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> ${$.escape(s("search.close") || "close")}</span></div> <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">${$.escape(isMac() ? '⌘' : 'Ctrl')}</kbd> <span>+</span> <kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">K</kbd> ${$.escape(s("search.search") || "search")}</span></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}