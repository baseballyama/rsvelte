import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { meilisearchService } from '$lib/core/services/index.js';
import { page } from '$app/state';
import { goto } from '$app/navigation';

export default function Ms_search_renderer($$anchor, $$props) {
	$.push($$props, true);

	// Local copy of the vendored MsSearchRenderer with two fixes that cannot be made from the
	// call site:
	//   1. Enter navigates to the clean slug route (/pendant), not /products?search=pendant —
	//      the latter is both against the project's link convention and robots-disallowed.
	//   2. `loading` is set for every query, not only the initial recommendations, so the panel
	//      no longer shows the previous query's results or a false "No products found" while a
	//      request is in flight.
	let searchPlugin = $.derived(() => page?.data?.store?.plugins?.search);

	let expandSearch = $.state(false);
	let searchResults = $.state($.proxy([]));
	let showSearchResults = $.state(false);
	let loading = $.state(false);
	let search = $.prop($$props, 'search', 15);

	// Only the newest request may write results; late responses from an abandoned query are dropped.
	let requestId = 0;

	const autoComplete = async (query) => {
		const id = ++requestId;

		$.set(loading, true);

		try {
			const res = await meilisearchService.searchAutoComplete({ query });

			if (id !== requestId) return;

			$.set(searchResults, res?.data || [], true);
		} catch(error) {
			if (id !== requestId) return;

			console.error('Search error:', error);
			$.set(searchResults, [], true);
		} finally {
			if (id === requestId) $.set(loading, false);
		}
	};

	let searchTimeout = null;

	const debouncedSearch = (query) => {
		if (searchTimeout) clearTimeout(searchTimeout);

		// Cover the debounce window too, otherwise the stale result set stays on screen.
		$.set(loading, true);

		searchTimeout = setTimeout(
			() => {
				autoComplete(query);
				searchTimeout = null;
			},
			300
		);
	};

	$.user_effect(() => {
		debouncedSearch(search());
	});

	const showInitialRecommendations = async () => {
		await autoComplete('');
	};

	const closeSearch = () => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
			searchTimeout = null;
		}

		requestId++;
		$.set(expandSearch, false);
		search('');
		$.set(showSearchResults, false);
		$.set(searchResults, [], true);
		$.set(loading, false);
	};

	$.user_effect(() => {
		if ($.get(expandSearch)) {
			showInitialRecommendations();
		}
	});

	const toSlug = (term) => term.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

	function handleKeyDown(e) {
		if (e.key === 'Enter') {
			const slug = toSlug(search());

			if (!slug) return;

			$.set(searchResults, [], true);
			$.set(showSearchResults, false);
			goto(`/${slug}`);
		} else if (e.key === 'Escape') closeSearch(); else {
			$.set(showSearchResults, true);
		}
	}

	function handleResultClick(result) {
		goto(`/products/${result?.slug}`);
		closeSearch();
	}

	function toggleSearchResults(value) {
		$.set(showSearchResults, value, true);
	}

	function showSearch() {
		document.activeElement?.blur?.();
		$.set(expandSearch, true);
		$.set(showSearchResults, true);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.content, () => ({
		searchResults: $.get(searchResults),
		loading: $.get(loading),
		searchPlugin: $.get(searchPlugin),
		expandSearch: $.get(expandSearch),
		showSearchResults: $.get(showSearchResults),
		showSearch,
		closeSearch,
		toggleSearchResults,
		handleKeyDown,
		handleResultClick
	}));

	$.append($$anchor, fragment);
	$.pop();
}