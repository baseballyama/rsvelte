import * as $ from 'svelte/internal/server';

import {
	IconBolt,
	IconCalendar,
	IconClock,
	IconLoader2,
	IconSearch,
	IconTag,
	IconX
} from '@tabler/icons-svelte';

import { useOverlayScrollbars } from 'overlayscrollbars-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { features } from '$lib/config/features';
import 'overlayscrollbars/overlayscrollbars.css';
import { slide } from 'svelte/transition';

export default function SearchResults($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			results,
			selectedIndex,
			isLoading,
			isSearchingHistorical,
			isLoadingMore = false,
			hasMore = false,
			query,
			totalCount,
			localCount = 0,
			historicalCount = 0,
			onSelectResult,
			onLoadMore
		} = $$props;

		let resultsContainer = null;
		let lastSelectedIndex = 0;
		let currentFilterTip = 0;
		let showFilterTips = true;
		let autoRotate = true;
		let animateTransition = false;

		// Check localStorage for filter tips preference (only if feature is enabled)
		function dismissFilterTips() {
			animateTransition = true;
			showFilterTips = false;

			if (browser) {
				localStorage.setItem('hideSearchFilterTips', 'true');
			}
		}

		function selectFilterTip(index) {
			currentFilterTip = index;
			autoRotate = false; // Stop auto-rotation when user manually selects
		}

		// Filter tips data
		const filterTips = [
			{
				icon: IconTag,
				color: 'text-blue-500 dark:text-blue-400',
				title: 'category:',
				hint: 'search.filter_category_hint',
				defaultHint: 'Filter by news category (e.g., category:Technology)'
			},

			{
				icon: IconCalendar,
				color: 'text-green-500 dark:text-green-400',
				title: 'from: / to:',
				hint: 'search.filter_date_hint',
				defaultHint: 'Search within a date range (e.g., from:2025-01-01 to:today)'
			},

			{
				icon: IconBolt,
				color: 'text-purple-500 dark:text-purple-400',
				title: s('search.shortcuts_title') || 'Quick shortcuts',
				hint: 'search.shortcuts_hint',
				defaultHint: 'Type "cat" for categories, dates like "yesterday" or "last week"'
			}
		];

		// Rotate filter tips every 3 seconds (only if auto-rotate is enabled)
		// Reset auto-rotate when modal reopens (detected by query being empty)
		// OverlayScrollbars setup
		const [initialize] = useOverlayScrollbars({
			defer: true,
			options: {
				scrollbars: { autoHide: 'scroll', theme: 'os-theme-dark os-theme-light' }
			}
		});

		// Initialize OverlayScrollbars on the results container
		// Auto-scroll when selection changes
		// Scroll selected result into view, keeping one extra item visible in scroll direction
		function scrollToSelected() {
			if (resultsContainer && results.length > 0) {
				const buttons = resultsContainer.querySelectorAll('button');

				// Determine scroll direction
				const scrollingDown = selectedIndex > lastSelectedIndex;

				const scrollingUp = selectedIndex < lastSelectedIndex;

				// Determine which element to scroll to
				let targetIndex = selectedIndex;

				// When scrolling down, ensure the next item is visible
				if (scrollingDown && selectedIndex < buttons.length - 1) {
					targetIndex = selectedIndex + 1;
				} else // When scrolling up, ensure the previous item is visible
				if (scrollingUp && selectedIndex > 0) {
					targetIndex = selectedIndex - 1;
				}

				// Scroll the target element into view
				const targetElement = buttons[targetIndex];

				if (targetElement) {
					targetElement.scrollIntoView({ behavior: 'instant', block: 'nearest' });
				}

				// Update last index
				lastSelectedIndex = selectedIndex;
			}
		}

		function handleResultClick(result) {
			onSelectResult(result);
		}

		function handleResultKeyDown(event, result) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				onSelectResult(result);
			}
		}

		// Check if a date is today
		function isToday(dateString) {
			const date = new Date(dateString);
			const today = new Date();

			return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
		}

		// Highlight search query matches in text
		function highlightMatch(text, query) {
			if (!query || !text) return text;

			// Simple case-insensitive string matching without regex
			const lowerText = text.toLowerCase();

			const lowerQuery = query.toLowerCase();
			let result = '';
			let lastIndex = 0;
			let index = lowerText.indexOf(lowerQuery);

			while (index !== -1) {
				// Add text before match
				result += text.slice(lastIndex, index);

				// Add highlighted match
				result += '<mark class="bg-yellow-200 dark:bg-yellow-800">' + text.slice(index, index + query.length) + '</mark>';

				lastIndex = index + query.length;
				index = lowerText.indexOf(lowerQuery, lastIndex);
			}

			// Add remaining text
			result += text.slice(lastIndex);

			return result;
		}

		// Remove citation markers from text
		function removeCitations(text) {
			if (!text) return text;

			return text.replace(/\[[^\]]+\]/g, '').// Remove anything in square brackets
			replace(/\s+/g, ' ').// Normalize whitespace
			trim();
		}

		// Create highlighted snippet
		function getSnippetWithHighlight(text, query, maxLength = 150) {
			const cleanText = removeCitations(text);

			if (!query) {
				return cleanText.slice(0, maxLength) + (cleanText.length > maxLength ? '...' : '');
			}

			const lowerText = cleanText.toLowerCase();
			const lowerQuery = query.toLowerCase();
			const queryIndex = lowerText.indexOf(lowerQuery);
			let snippet = '';

			if (queryIndex === -1) {
				// No match, just return beginning
				snippet = cleanText.slice(0, maxLength);
			} else {
				// Found match, center around it
				let start = Math.max(0, queryIndex - 50);

				let end = Math.min(cleanText.length, queryIndex + query.length + 100);

				// Adjust to word boundaries
				if (start > 0) {
					const spaceIndex = cleanText.indexOf(' ', start);

					if (spaceIndex > 0 && spaceIndex < start + 20) start = spaceIndex;
				}

				if (end < cleanText.length) {
					const spaceIndex = cleanText.indexOf(' ', end);

					if (spaceIndex > 0 && spaceIndex < end + 20) end = spaceIndex;
				}

				snippet = cleanText.slice(start, end);

				// Add ellipsis
				if (start > 0) snippet = `...${snippet}`;

				if (end < cleanText.length) snippet = `${snippet}...`;
			}

			// Highlight the match
			return highlightMatch(snippet, query);
		}

		$$renderer.push(`<div class="flex-1 overflow-hidden flex flex-col"><div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"><div class="flex items-center justify-between h-6"><div class="flex-1">`);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">`);
			IconLoader2($$renderer, { class: 'size-4 text-blue-500 animate-spin' });
			$$renderer.push(`<!----> ${$.escape(s("search.searching") || "Searching...")}</div>`);
		} else if (results.length > 0) {
			$$renderer.push(`<!--[1--><div class="text-sm text-gray-600 dark:text-gray-400">`);

			if (totalCount > results.length) {
				$$renderer.push(`<!--[0-->${$.escape(s("search.showing") || "Showing")}
              ${$.escape(results.length)}
              ${$.escape(s("search.of") || "of")}
              ${$.escape(totalCount)}
              ${$.escape(totalCount === 1
					? s("search.result_single") || "result"
					: s("search.result_plural") || "results")}`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(results.length)}
              ${$.escape(results.length === 1
					? s("search.result_single") || "result"
					: s("search.result_plural") || "results")}`);
			}

			$$renderer.push(`<!--]--> `);

			if (query) {
				$$renderer.push(`<!--[0-->${$.escape(s("search.for") || "for")} <span class="font-medium">"${$.escape(query)}"</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (features.historicalSearch) {
			$$renderer.push('<!--[0-->');

			if (query.length > 0 && query.length < 3) {
				$$renderer.push(`<!--[0--><div class="text-xs text-amber-600 dark:text-amber-400">${$.escape(s("search.historical_needs_3_chars") || "Historical search needs 3+ characters")}</div>`);
			} else if (isSearchingHistorical) {
				$$renderer.push(`<!--[1--><div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">`);
				IconLoader2($$renderer, { class: 'size-3 text-yellow-500 animate-spin' });
				$$renderer.push(`<!----> ${$.escape(s("search.searching_historical") || "Searching historical...")}</div>`);
			} else if (historicalCount > 0) {
				$$renderer.push(`<!--[2--><div class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">`);
				IconClock($$renderer, { size: 12 });
				$$renderer.push(`<!----> ${$.escape(s("search.historical_included", { count: String(historicalCount) }) || `${historicalCount} historical results included`)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="flex-1 min-h-0" data-overlayscrollbars-initialize="">`);

		if (!query && results.length === 0) {
			$$renderer.push(`<!--[0--><div class="flex items-center justify-center min-h-full p-8"><div class="w-full max-w-md"><div class="text-center mb-6"><img src="/doggo_default.svg" alt="Search mascot" class="size-40 mx-auto mb-4 transition-all duration-200"/> <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">${$.escape(s("search.get_started_title") || "Start searching")}</h3> <p class="text-sm text-gray-600 dark:text-gray-400">${$.escape(s("search.get_started_description") || "Type to search or use filters")}</p></div> `);

			if (showFilterTips) {
				$$renderer.push(`<!--[0--><div><div class="flex items-center justify-between mb-3"><div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${$.escape(s("search.try_these") || "Try these filters")}</div> <button class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss filter tips"${$.attr('title', s("search.dismiss_tips") || "Don't show these tips again")}>`);
				IconX($$renderer, { size: 14 });
				$$renderer.push(`<!----></button></div> <div class="relative h-20 overflow-hidden"><!--[-->`);

				const each_array = $.ensure_array_like(filterTips);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let tip = each_array[index];
					const Icon = tip.icon;

					$$renderer.push(`<div${$.attr_class(`absolute inset-0 flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-200 ${index === currentFilterTip
						? 'opacity-100 translate-y-0'
						: 'opacity-0 translate-y-4'}`)}${$.attr_style(`display: ${index === currentFilterTip ? 'flex' : 'none'}`)}><div${$.attr_class(`${$.stringify(tip.color)} mt-0.5`, 'svelte-1hmd7l3')}>`);

					if (Icon) {
						$$renderer.push('<!--[-->');
						Icon($$renderer, { size: 16 });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div class="flex-1"><div class="font-medium text-sm text-gray-900 dark:text-gray-100">${$.escape(tip.title)}</div> <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">${$.escape(s(tip.hint) || tip.defaultHint)}</div></div></div>`);
				}

				$$renderer.push(`<!--]--></div> <div class="flex justify-center gap-1.5 mt-3"><!--[-->`);

				const each_array_1 = $.ensure_array_like(filterTips);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let _ = each_array_1[index];

					$$renderer.push(`<button${$.attr_class(`relative rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden transition-all duration-200 ${index === currentFilterTip ? 'w-8 h-1.5' : 'w-1.5 h-1.5'}`)}${$.attr('aria-label', `Go to tip ${$.stringify(index + 1)}`)}>`);

					if (index === currentFilterTip && autoRotate) {
						$$renderer.push(`<!--[0--><div class="absolute inset-0 bg-gray-600 dark:bg-gray-300 rounded-full animate-fill-progress svelte-1hmd7l3"></div>`);
					} else if (index === currentFilterTip) {
						$$renderer.push(`<!--[1--><div class="absolute inset-0 bg-gray-600 dark:bg-gray-300 rounded-full"></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></button>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else if (results.length > 0) {
			$$renderer.push(`<!--[1--><!--[-->`);

			const each_array_2 = $.ensure_array_like(results);

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let result = each_array_2[index];

				$$renderer.push(`<button${$.attr_class(`w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 focus:outline-none ${index === selectedIndex
					? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500'
					: ''}`)}${$.attr('tabindex', index === selectedIndex ? 0 : -1)} type="button"><div class="flex flex-col gap-2"><div class="flex items-start justify-between gap-2"><div class="flex items-start gap-2 flex-1">`);

				if (result.story.emoji) {
					$$renderer.push(`<!--[0--><span class="text-lg mt-0.5">${$.escape(result.story.emoji)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 svelte-1hmd7l3" dir="auto">${$.html(highlightMatch(result.story.title || "", query))}</h3></div> <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shrink-0" dir="auto">${$.escape(result.categoryName)}</span></div> `);

				if (result.story.snippet) {
					$$renderer.push(`<!--[0--><p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 svelte-1hmd7l3" dir="auto">${$.html(getSnippetWithHighlight(result.story.snippet, query))}</p>`);
				} else if (result.story.short_summary) {
					$$renderer.push(`<!--[1--><p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 svelte-1hmd7l3" dir="auto">${$.html(getSnippetWithHighlight(result.story.short_summary, query))}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">`);

				if (result.story.location) {
					$$renderer.push(`<!--[0--><span dir="auto">📍 ${$.escape(result.story.location)}</span> `);

					if (result.story.unique_domains || result.batchDate && !isToday(result.batchDate)) {
						$$renderer.push(`<!--[0--><span class="mx-2">•</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.story.unique_domains) {
					$$renderer.push(`<!--[0--><span>${$.escape(result.story.unique_domains)}
                  ${$.escape(result.story.unique_domains === 1
						? s("search.source_single") || "source"
						: s("search.source_plural") || "sources")}</span> `);

					if (result.batchDate && !isToday(result.batchDate)) {
						$$renderer.push(`<!--[0--><span class="mx-2">•</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.batchDate && !isToday(result.batchDate)) {
					$$renderer.push(`<!--[0--><span>${$.escape(new Date(result.batchDate).toLocaleDateString())}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></button>`);
			}

			$$renderer.push(`<!--]--> `);

			if (features.historicalSearch && hasMore && onLoadMore) {
				$$renderer.push(`<!--[0--><div class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">`);

				if (isLoadingMore) {
					$$renderer.push(`<!--[0--><div class="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">`);
					IconLoader2($$renderer, { class: 'size-4 text-blue-500 animate-spin' });
					$$renderer.push(`<!----> ${$.escape(s("search.loading_more") || "Loading more results...")}</div>`);
				} else {
					$$renderer.push(`<!--[-1--><button class="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">${$.escape(s("search.load_more") || "Load more results")}</button> <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("search.showing_of", {
						shown: results.length.toString(),
						total: totalCount.toString()
					}) || `Showing ${results.length} of ${totalCount} results`)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else if (!isLoading) {
			$$renderer.push(`<!--[2--><div class="flex items-center justify-center min-h-full p-8"><div class="text-center"><div class="mx-auto size-12 text-gray-400 dark:text-gray-500 mb-4 flex items-center justify-center">`);
			IconSearch($$renderer, { size: 48, stroke: 1.5 });
			$$renderer.push(`<!----></div> <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">${$.escape(s("search.no_results_title") || "No results found")}</h3> <p class="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">`);

			if (features.historicalSearch) {
				$$renderer.push(`<!--[0-->${$.escape(s("search.no_results_description") || "Try adjusting your search terms or filters to find what you're looking for.")}`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(s("search.no_results_description_simple") || "Try different search terms to find what you're looking for.")}`);
			}

			$$renderer.push(`<!--]--></p> `);

			if (features.historicalSearch) {
				$$renderer.push(`<!--[0--><div class="text-sm text-gray-400 dark:text-gray-500 space-y-1"><p>${$.escape(s("search.try_searching_for") || "Try searching for:")}</p> <div class="flex flex-wrap gap-2 justify-center"><code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">category:World</code> <code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">from:yesterday</code> <code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">to:today</code></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
		$.bind_props($$props, { scrollToSelected });
	});
}