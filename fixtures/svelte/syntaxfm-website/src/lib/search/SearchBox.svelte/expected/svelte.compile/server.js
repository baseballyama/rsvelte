import * as $ from 'svelte/internal/server';
import { run } from 'svelte/legacy';
import { afterNavigate } from '$app/navigation';
import { overlay_open, search_query, search_recent, searching } from '$state/search';
import { onMount, tick } from 'svelte';
import SearchWorker from './search-worker.js?worker';
import SearchResults from './SearchResults.svelte';
import SearchResultList from './SearchResultList.svelte';
import { fade } from 'svelte/transition';
import { clickOutDialog } from '$actions/click_outside_dialog';

export default function SearchBox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let search_input = null;
		let modal = null;
		let search = null;
		let recent_searches = [];
		let worker = null;
		let ready = false;
		let active_color = 'var(--fg)';
		let uid = 1;
		const pending = new Set();

		onMount(async () => {
			search_input.focus();
			worker = new SearchWorker();

			worker.addEventListener('message', (event) => {
				const { type, payload } = event.data;

				if (type === 'ready') {
					ready = true;
				}

				if (type === 'results') {
					search = payload;
				}

				if (type === 'recents') {
					recent_searches = payload;
				}
			});

			worker.postMessage({ type: 'init', payload: { origin: location.origin } });
		});

		afterNavigate(() => {
			close();
		});

		async function close() {
			modal.close();

			if ($.store_get($$store_subs ??= {}, '$searching', searching)) {
				$.store_set(searching, false);
			}

			search = null;
		}

		function navigate(href) {
			$.store_set(search_recent, [
				href,
				...$.store_get($$store_subs ??= {}, '$search_recent', search_recent).filter((x) => x !== href)
			]);

			close();
		}

		run(() => {
			if (ready) {
				const id = uid++;

				pending.add(id);

				worker.postMessage({
					type: 'query',
					id,
					payload: $.store_get($$store_subs ??= {}, '$search_query', search_query)
				});
			}
		});

		run(() => {
			if (ready) {
				worker.postMessage({
					type: 'recents',
					payload: $.snapshot($.store_get($$store_subs ??= {}, '$search_recent', search_recent))
				});
			}
		});

		run(() => {
			tick().then(() => $.store_set(overlay_open, $.store_get($$store_subs ??= {}, '$searching', searching)));
		});

		run(() => {
			if ($.store_get($$store_subs ??= {}, '$searching', searching)) {
				if (modal) {
					$.store_set(overlay_open, true);
					modal.showModal();
				}
			}
		});

		function change_color(e) {
			if (e.target instanceof Element) {
				let computed = window.getComputedStyle(e.target).backgroundColor;

				active_color = computed;
			}
		}

		function search_keydown(e) {
			if (e.key === 'Enter' && !e.isComposing) {
				const anchor = modal.querySelector('a[data-has-node]');

				if (anchor) {
					anchor.click();
				}
			}
		}

		$$renderer.push(`<dialog class="zone svelte-j5iht5" aria-labelledby="search-header"${$.attr_style('', { '--bg': 'var(--bg-sheet)', '--fg': 'var(--fg-sheet)' })}><section aria-label="Search Results Window"><header role="banner" class="svelte-j5iht5"><input${$.attr('value', $.store_get($$store_subs ??= {}, '$search_query', search_query))} placeholder="Search" aria-describedby="search-description" aria-label="Search" spellcheck="false" class="search-input svelte-j5iht5"/> <button class="close svelte-j5iht5" type="submit">×</button></header> <div class="results svelte-j5iht5">`);

		if (search?.query) {
			$$renderer.push(`<!--[0--><div class="results-container svelte-j5iht5">`);
			SearchResults($$renderer, { results: search.results, query: search.query });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="recent-searches svelte-j5iht5"><div><pre${$.attr_style('overflow: hidden; width: 201px;', { color: active_color })}>
░██████╗██╗░░░██╗███╗░░██╗
██╔════╝╚██╗░██╔╝████╗░██║
╚█████╗░░╚████╔╝░██╔██╗██║
░╚═══██╗░░╚██╔╝░░██║╚████║
██████╔╝░░░██║░░░██║░╚███║
╚═════╝░░░░╚═╝░░░╚═╝░░╚══╝

████████╗░█████╗░██╗░░██╗
╚══██╔══╝██╔══██╗╚██╗██╔╝
░░░██║░░░███████║░╚███╔╝░
░░░██║░░░██╔══██║░██╔██╗░
░░░██║░░░██║░░██║██╔╝╚██╗
░░░╚═╝░░░╚═╝░░╚═╝╚═╝░░╚═╝
					</pre> <div class="color-boxes svelte-j5iht5"><!--[-->`);

			const each_array = $.ensure_array_like(Array(12));

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let _ = each_array[i];

				$$renderer.push(`<button${$.attr('aria-label', `ASCII Color ${i + 1}`)} class="svelte-j5iht5"></button>`);
			}

			$$renderer.push(`<!--]--></div></div> <div><h2${$.attr_class('h5', void 0, { 'empty': recent_searches.length === 0 })} id="search-header">Recent searches</h2> `);

			if (!recent_searches.length) {
				$$renderer.push(`<!--[0--><p>No recent searches</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (recent_searches.length) {
				$$renderer.push('<!--[0-->');

				SearchResultList($$renderer, {
					results: recent_searches,
					recent_searches: true,
					query: search?.query || ''
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <footer role="contentinfo" class="svelte-j5iht5"><p class="svelte-j5iht5">Search powered by vibes.</p></footer></section></dialog>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}