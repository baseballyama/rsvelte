import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ALL_PAGES } from '$lib/constants/nav';
import Icon from '$lib/components/global/Icon.svelte';
import { debounce } from '$lib/utils/debounce';

var root = $.from_html(`<span class="results-count svelte-18fhlj"> </span>`);
var root_1 = $.from_html(`<span class="no-results svelte-18fhlj">No results found</span>`);
var root_2 = $.from_html(`<div class="search-container svelte-18fhlj"><div class="search-input-wrapper svelte-18fhlj"><!> <input type="text" placeholder="Search tools and reference..." class="search-input svelte-18fhlj"/> <button class="close-search-button svelte-18fhlj" aria-label="Close search"><!></button></div> <div class="search-results-info svelte-18fhlj"><!></div></div>`);

export default function SearchFilter($$anchor, $$props) {
	$.push($$props, true);

	let filteredTools = $.prop($$props, 'filteredTools', 15),
		searchQuery = $.prop($$props, 'searchQuery', 15),
		isSearchOpen = $.prop($$props, 'isSearchOpen', 15, false);

	let searchInput = $.state(void 0);

	// Expose openSearch method for parent components
	function openSearch() {
		isSearchOpen(true);

		// Focus input after it's rendered
		setTimeout(
			() => {
				if ($.get(searchInput)) {
					$.get(searchInput).focus();
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

			filteredTools(performSearch(query));
		},
		220
	);

	// Handle search input changes
	function handleSearch(event) {
		const target = event.target;

		searchQuery(target.value);
		debouncedSearch(searchQuery());
	}

	// Clear search and close input
	function clearSearch() {
		searchQuery('');
		filteredTools(ALL_PAGES);
		isSearchOpen(false);

		if ($.get(searchInput)) {
			$.get(searchInput).value = '';
		}
	}

	var $$exports = { openSearch };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_2();
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			Icon(node_1, { name: 'search' });

			var input = $.sibling(node_1, 2);

			$.remove_input_defaults(input);
			$.bind_this(input, ($$value) => $.set(searchInput, $$value), () => $.get(searchInput));

			var button = $.sibling(input, 2);
			var node_2 = $.child(button);

			Icon(node_2, { name: 'x', size: 'sm' });
			$.reset(button);
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_3 = $.child(div_2);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text = $.only_child(span);

					$.template_effect(() => $.set_text(text, `Start typing to search ${ALL_PAGES.length ?? ''} tools`));
					$.append($$anchor, span);
				};

				var consequent_1 = ($$anchor) => {
					var span_1 = root_1();

					$.append($$anchor, span_1);
				};

				var alternate = ($$anchor) => {
					var span_2 = root();
					var text_1 = $.only_child(span_2);

					$.template_effect(() => $.set_text(text_1, `Showing ${filteredTools().length ?? ''} of ${ALL_PAGES.length ?? ''} tools`));
					$.append($$anchor, span_2);
				};

				$.if(node_3, ($$render) => {
					if (searchQuery().length === 0) $$render(consequent); else if (filteredTools().length === 0) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.reset(div_2);
			$.reset(div);
			$.template_effect(() => $.set_value(input, searchQuery()));
			$.delegated('input', input, handleSearch);
			$.delegated('click', button, clearSearch);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (isSearchOpen()) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['input', 'click']);