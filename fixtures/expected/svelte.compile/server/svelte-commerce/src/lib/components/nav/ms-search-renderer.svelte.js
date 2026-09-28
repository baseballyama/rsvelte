import * as $ from 'svelte/internal/server';
import { meilisearchService } from '$lib/core/services/index.js';
import { page } from '$app/state';
import { goto } from '$app/navigation';

export default function Ms_search_renderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Local copy of the vendored MsSearchRenderer with two fixes that cannot be made from the
		// call site:
		//   1. Enter navigates to the clean slug route (/pendant), not /products?search=pendant —
		//      the latter is both against the project's link convention and robots-disallowed.
		//   2. `loading` is set for every query, not only the initial recommendations, so the panel
		//      no longer shows the previous query's results or a false "No products found" while a
		//      request is in flight.
		let searchPlugin = $.derived(() => page?.data?.store?.plugins?.search);

		let expandSearch = false;
		let searchResults = [];
		let showSearchResults = false;
		let loading = false;
		let { content, search = void 0 } = $$props;

		// Only the newest request may write results; late responses from an abandoned query are dropped.
		let requestId = 0;

		const autoComplete = async (query) => {
			const id = ++requestId;

			loading = true;

			try {
				const res = await meilisearchService.searchAutoComplete({ query });

				if (id !== requestId) return;

				searchResults = res?.data || [];
			} catch(error) {
				if (id !== requestId) return;

				console.error('Search error:', error);
				searchResults = [];
			} finally {
				if (id === requestId) loading = false;
			}
		};

		let searchTimeout = null;

		const debouncedSearch = (query) => {
			if (searchTimeout) clearTimeout(searchTimeout);

			// Cover the debounce window too, otherwise the stale result set stays on screen.
			loading = true;

			searchTimeout = setTimeout(
				() => {
					autoComplete(query);
					searchTimeout = null;
				},
				300
			);
		};

		const showInitialRecommendations = async () => {
			await autoComplete('');
		};

		const closeSearch = () => {
			if (searchTimeout) {
				clearTimeout(searchTimeout);
				searchTimeout = null;
			}

			requestId++;
			expandSearch = false;
			search = '';
			showSearchResults = false;
			searchResults = [];
			loading = false;
		};

		const toSlug = (term) => term.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

		function handleKeyDown(e) {
			if (e.key === 'Enter') {
				const slug = toSlug(search);

				if (!slug) return;

				searchResults = [];
				showSearchResults = false;
				goto(`/${slug}`);
			} else if (e.key === 'Escape') closeSearch(); else {
				showSearchResults = true;
			}
		}

		function handleResultClick(result) {
			goto(`/products/${result?.slug}`);
			closeSearch();
		}

		function toggleSearchResults(value) {
			showSearchResults = value;
		}

		function showSearch() {
			document.activeElement?.blur?.();
			expandSearch = true;
			showSearchResults = true;
		}

		content($$renderer, {
			searchResults,
			loading,
			searchPlugin: searchPlugin(),
			expandSearch,
			showSearchResults,
			showSearch,
			closeSearch,
			toggleSearchResults,
			handleKeyDown,
			handleResultClick
		});

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { search });
	});
}