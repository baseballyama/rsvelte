import * as $ from 'svelte/internal/server';
import { ALL_PAGES } from '$lib/constants/nav';
import Icon from '$lib/components/global/Icon.svelte';
import { debounce } from '$lib/utils/debounce';

export default function SearchFilter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			filteredTools = void 0,
			searchQuery = void 0,
			isSearchOpen = false
		} = $$props;

		let searchInput = void 0;

		// Expose openSearch method for parent components
		function openSearch() {
			isSearchOpen = true;

			// Focus input after it's rendered
			setTimeout(
				() => {
					if (searchInput) {
						searchInput.focus();
					}
				},
				0
			);
		}

		// Weight different match types for relevance scoring
		const MATCH_WEIGHTS = {
			EXACT_TITLE: 100,
			TITLE_START: 80,
			TITLE_CONTAINS: 60,
			KEYWORD_EXACT: 50,
			KEYWORD_PARTIAL: 40,
			DESC_CONTAINS: 20,
			DESC_PARTIAL: 10
		};

		// Calculate relevance score for search matching
		function calculateRelevance(item, query) {
			const normalizedQuery = query.toLowerCase().trim();

			if (!normalizedQuery) return 0;

			const title = item.label.toLowerCase();
			const description = item.description?.toLowerCase() || '';
			const keywords = item.keywords?.map((k) => k.toLowerCase()) || [];
			let score = 0;

			// Title matches (highest priority)
			if (title === normalizedQuery) {
				score += MATCH_WEIGHTS.EXACT_TITLE;
			} else if (title.startsWith(normalizedQuery)) {
				score += MATCH_WEIGHTS.TITLE_START;
			} else if (title.includes(normalizedQuery)) {
				score += MATCH_WEIGHTS.TITLE_CONTAINS;
			}

			// Keyword matches
			for (const keyword of keywords) {
				if (keyword === normalizedQuery) {
					score += MATCH_WEIGHTS.KEYWORD_EXACT;
				} else if (keyword.includes(normalizedQuery)) {
					score += MATCH_WEIGHTS.KEYWORD_PARTIAL;
				}
			}

			// Description matches (lower priority)
			if (description.includes(normalizedQuery)) {
				score += MATCH_WEIGHTS.DESC_CONTAINS;

				// Bonus for partial word matches in description
				const words = normalizedQuery.split(' ');

				for (const word of words) {
					if (word.length > 2 && description.includes(word)) {
						score += MATCH_WEIGHTS.DESC_PARTIAL;
					}
				}
			}

			return score;
		}

		// Category priority for sorting (tools > reference)
		function getCategoryPriority(item) {
			if (item.href.startsWith('/reference/')) return 1; // Lower priority

			return 2; // Higher priority for tools
		}

		// Perform search with fuzzy matching and relevance scoring
		function performSearch(query) {
			if (!query.trim()) {
				return ALL_PAGES;
			}

			const results = ALL_PAGES.map((item) => ({
				item,
				relevance: calculateRelevance(item, query),
				categoryPriority: getCategoryPriority(item)
			})).filter(({ relevance }) => relevance > 0).sort((a, b) => {
				// First sort by category (tools before reference)
				if (a.categoryPriority !== b.categoryPriority) {
					return b.categoryPriority - a.categoryPriority;
				}

				// Then by relevance score
				return b.relevance - a.relevance;
			}).map(({ item }) => item);

			return results;
		}

		// Debounced search function (only debounce the filtering, not the input value)
		const debouncedSearch = debounce(
			(...args) => {
				const query = args[0] ?? '';

				filteredTools = performSearch(query);
			},
			220
		);

		// Handle search input changes
		function handleSearch(event) {
			const target = event.target;

			searchQuery = target.value;
			debouncedSearch(searchQuery);
		}

		// Clear search and close input
		function clearSearch() {
			searchQuery = '';
			filteredTools = ALL_PAGES;
			isSearchOpen = false;

			if (searchInput) {
				searchInput.value = '';
			}
		}

		if (isSearchOpen) {
			$$renderer.push(`<!--[0--><div class="search-container svelte-18fhlj"><div class="search-input-wrapper svelte-18fhlj">`);
			Icon($$renderer, { name: 'search' });
			$$renderer.push(`<!----> <input type="text" placeholder="Search tools and reference..." class="search-input svelte-18fhlj"${$.attr('value', searchQuery)}/> <button class="close-search-button svelte-18fhlj" aria-label="Close search">`);
			Icon($$renderer, { name: 'x', size: 'sm' });
			$$renderer.push(`<!----></button></div> <div class="search-results-info svelte-18fhlj">`);

			if (searchQuery.length === 0) {
				$$renderer.push(`<!--[0--><span class="results-count svelte-18fhlj">Start typing to search ${$.escape(ALL_PAGES.length)} tools</span>`);
			} else if (filteredTools.length === 0) {
				$$renderer.push(`<!--[1--><span class="no-results svelte-18fhlj">No results found</span>`);
			} else {
				$$renderer.push(`<!--[-1--><span class="results-count svelte-18fhlj">Showing ${$.escape(filteredTools.length)} of ${$.escape(ALL_PAGES.length)} tools</span>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { filteredTools, searchQuery, isSearchOpen, openSearch });
	});
}