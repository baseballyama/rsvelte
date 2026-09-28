import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MeiliSearch } from 'meilisearch';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="meilisearch-loading svelte-lzrjj2">Searching...</div>`);
var root_1 = $.from_html(`<div class="meilisearch-empty svelte-lzrjj2"> </div>`);
var root_2 = $.from_html(`<div class="meilisearch-result-content svelte-lzrjj2"></div>`);
var root_3 = $.from_html(`<button class="meilisearch-result svelte-lzrjj2"><div class="meilisearch-result-title svelte-lzrjj2"></div> <!></button>`);
var root_4 = $.from_html(`<div class="meilisearch-overlay svelte-lzrjj2"><div class="meilisearch-modal svelte-lzrjj2"><div class="meilisearch-header svelte-lzrjj2"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input class="meilisearch-input svelte-lzrjj2" type="text" spellcheck="false"/> <button class="meilisearch-close svelte-lzrjj2"><kbd class="svelte-lzrjj2">Esc</kbd></button></div> <div class="meilisearch-body svelte-lzrjj2"><!></div> <div class="meilisearch-footer svelte-lzrjj2"><span>Powered by <a href="https://www.meilisearch.com" target="_blank" rel="noopener noreferrer" class="svelte-lzrjj2">Meilisearch</a></span></div></div></div>`);
var root_5 = $.from_html(`<button class="meilisearch-trigger svelte-lzrjj2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <span class="meilisearch-trigger-text svelte-lzrjj2">Search</span> <kbd class="svelte-lzrjj2"><span class="meilisearch-kbd-meta">⌘</span>K</kbd></button> <!>`, 1);

export default function Search($$anchor, $$props) {
	$.push($$props, true);

	const placeholder = $.prop($$props, 'placeholder', 3, 'Search...'),
		limit = $.prop($$props, 'limit', 3, 10);

	let open = $.state(false);
	let query = $.state('');
	let results = $.state($.proxy([]));
	let loading = $.state(false);
	let inputEl = $.state(void 0);
	let debounceTimer;
	let client;

	onMount(() => {
		client = new MeiliSearch({ host: $$props.host, apiKey: $$props.apiKey });

		function onKeydown(e) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				$.set(open, !$.get(open));

				if ($.get(open)) {
					requestAnimationFrame(() => $.get(inputEl)?.focus());
				}
			}

			if (e.key === 'Escape' && $.get(open)) {
				$.set(open, false);
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
		if (!client || !$.get(query).trim()) {
			$.set(results, [], true);

			return;
		}

		$.set(loading, true);

		try {
			const index = client.index($$props.indexName);

			const res = await index.search($.get(query), {
				limit: limit(),
				attributesToHighlight: ['*'],
				highlightPreTag: '<mark>',
				highlightPostTag: '</mark>'
			});

			$.set(
				results,
				res.hits.map((hit) => ({
					id: hit.id,
					title: hit._formatted?.title || hit.title || '',
					content: hit._formatted?.content || hit.content || '',
					url: hit.url || hit.path || '#'
				})),
				true
			);
		} catch(e) {
			console.error('[sveltepress] Meilisearch error:', e);
			$.set(results, [], true);
		} finally {
			$.set(loading, false);
		}
	}

	function close() {
		$.set(open, false);
		$.set(query, '');
		$.set(results, [], true);
	}

	function navigate(url) {
		close();
		window.location.href = url;
	}

	var fragment = root_5();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div = root_4();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var input = $.sibling($.child(div_2), 2);

			$.remove_input_defaults(input);
			$.bind_this(input, ($$value) => $.set(inputEl, $$value), () => $.get(inputEl));

			var button_1 = $.sibling(input, 2);

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_1 = $.child(div_3);

			{
				var consequent = ($$anchor) => {
					var div_4 = root();

					$.append($$anchor, div_4);
				};

				var consequent_1 = ($$anchor) => {
					var div_5 = root_1();
					var text = $.only_child(div_5);

					$.template_effect(() => $.set_text(text, `No results found for "${$.get(query) ?? ''}"`));
					$.append($$anchor, div_5);
				};

				var alternate = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.each(node_2, 17, () => $.get(results), (result) => result.id, ($$anchor, result) => {
						var button_2 = root_3();
						var div_6 = $.child(button_2);

						$.html(div_6, () => $.get(result).title, true);
						$.reset(div_6);

						var node_3 = $.sibling(div_6, 2);

						{
							var consequent_2 = ($$anchor) => {
								var div_7 = root_2();

								$.html(div_7, () => $.get(result).content, true);
								$.reset(div_7);
								$.append($$anchor, div_7);
							};

							$.if(node_3, ($$render) => {
								if ($.get(result).content) $$render(consequent_2);
							});
						}

						$.reset(button_2);
						$.delegated('click', button_2, () => navigate($.get(result).url));
						$.append($$anchor, button_2);
					});

					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(loading)) $$render(consequent); else if ($.get(query) && $.get(results).length === 0) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.reset(div_3);
			$.next(2);
			$.reset(div_1);
			$.reset(div);
			$.template_effect(() => $.set_attribute(input, 'placeholder', placeholder()));
			$.delegated('click', div, close);
			$.delegated('keydown', div, () => {});
			$.delegated('click', div_1, (e) => e.stopPropagation());
			$.delegated('input', input, handleInput);
			$.bind_value(input, () => $.get(query), ($$value) => $.set(query, $$value));
			$.delegated('click', button_1, close);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(open)) $$render(consequent_3);
		});
	}

	$.delegated('click', button, () => {
		$.set(open, true);
		requestAnimationFrame(() => $.get(inputEl)?.focus());
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown', 'input']);