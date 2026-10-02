import * as $ from 'svelte/internal/server';
import { MeiliSearch } from 'meilisearch';
import { onMount } from 'svelte';

export default function Search($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			host,
			apiKey,
			indexName,
			placeholder = 'Search...',
			limit = 10
		} = $$props;

		let open = false;
		let query = '';
		let results = [];
		let loading = false;
		let inputEl = void 0;
		let debounceTimer;
		let client;

		onMount(() => {
			client = new MeiliSearch({ host, apiKey });

			function onKeydown(e) {
				if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
					e.preventDefault();
					open = !open;

					if (open) {
						requestAnimationFrame(() => inputEl?.focus());
					}
				}

				if (e.key === 'Escape' && open) {
					open = false;
				}
			}

			document.addEventListener('keydown', onKeydown);

			return () => document.removeEventListener('keydown', onKeydown);
		});

		function handleInput() {
			if (debounceTimer) clearTimeout(debounceTimer);

			debounceTimer = setTimeout(() => search(), 200);
		}

		async function search() {
			if (!client || !query.trim()) {
				results = [];

				return;
			}

			loading = true;

			try {
				const index = client.index(indexName);

				const res = await index.search(query, {
					limit,
					attributesToHighlight: ['*'],
					highlightPreTag: '<mark>',
					highlightPostTag: '</mark>'
				});

				results = res.hits.map((hit) => ({
					id: hit.id,
					title: hit._formatted?.title || hit.title || '',
					content: hit._formatted?.content || hit.content || '',
					url: hit.url || hit.path || '#'
				}));
			} catch(e) {
				console.error('[sveltepress] Meilisearch error:', e);
				results = [];
			} finally {
				loading = false;
			}
		}

		function close() {
			open = false;
			query = '';
			results = [];
		}

		function navigate(url) {
			close();
			window.location.href = url;
		}

		$$renderer.push(`<button class="meilisearch-trigger svelte-lzrjj2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <span class="meilisearch-trigger-text svelte-lzrjj2">Search</span> <kbd class="svelte-lzrjj2"><span class="meilisearch-kbd-meta">⌘</span>K</kbd></button> `);

		if (open) {
			$$renderer.push(`<!--[0--><div class="meilisearch-overlay svelte-lzrjj2"><div class="meilisearch-modal svelte-lzrjj2"><div class="meilisearch-header svelte-lzrjj2"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input${$.attr('value', query)}${$.attr('placeholder', placeholder)} class="meilisearch-input svelte-lzrjj2" type="text" spellcheck="false"/> <button class="meilisearch-close svelte-lzrjj2"><kbd class="svelte-lzrjj2">Esc</kbd></button></div> <div class="meilisearch-body svelte-lzrjj2">`);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="meilisearch-loading svelte-lzrjj2">Searching...</div>`);
			} else if (query && results.length === 0) {
				$$renderer.push(`<!--[1--><div class="meilisearch-empty svelte-lzrjj2">No results found for "${$.escape(query)}"</div>`);
			} else {
				$$renderer.push(`<!--[-1--><!--[-->`);

				const each_array = $.ensure_array_like(results);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let result = each_array[$$index];

					$$renderer.push(`<button class="meilisearch-result svelte-lzrjj2"><div class="meilisearch-result-title svelte-lzrjj2">${$.html(result.title)}</div> `);

					if (result.content) {
						$$renderer.push(`<!--[0--><div class="meilisearch-result-content svelte-lzrjj2">${$.html(result.content)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></button>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div> <div class="meilisearch-footer svelte-lzrjj2"><span>Powered by <a href="https://www.meilisearch.com" target="_blank" rel="noopener noreferrer" class="svelte-lzrjj2">Meilisearch</a></span></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}