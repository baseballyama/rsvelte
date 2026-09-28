import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { withBase } from '../search-url.js';

export default function SearchModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { open, onClose } = $$props;
		let query = '';
		let results = [];
		let selected = 0;
		let pagefind = null;
		let loading = false;
		let loadError = false;
		let input = void 0;
		let timer;

		async function ensureLoaded() {
			if (pagefind) return;

			loading = true;

			try {
				// Pagefind runtime sits at {base}/pagefind/ after build. Build the URL
				// at runtime so Rollup cannot try to resolve it at build time.
				const url = `${window.location.origin}${base}/pagefind/pagefind.js`;

				// @ts-expect-error — runtime virtual import
				pagefind = await import(/* @vite-ignore */ url);

				await pagefind.init();
				loadError = false;
			} catch(err) {
				console.warn('[sveltepress] Pagefind runtime failed to load:', err);
				pagefind = null;
				loadError = true;
			} finally {
				loading = false;
			}
		}

		// When the modal opens: load Pagefind, focus input, remember the opener
		// so we can restore focus on close.
		// Focus after mount
		// Reset transient search state whenever the modal closes. Without this a
		// fast-typed search followed by Esc would fire runSearch against a closed
		// modal, and the next open would flash stale results.
		async function runSearch(q) {
			if (!pagefind || !q) {
				results = [];

				return;
			}

			const search = await pagefind.search(q);
			const top = await Promise.all(search.results.slice(0, 10).map((r) => r.data()));

			results = top.map(({ url, meta, excerpt }) => ({ url, meta, excerpt }));
			selected = 0;
		}

		function onInput(e) {
			query = e.target.value;
			clearTimeout(timer);
			timer = setTimeout(() => runSearch(query), 200);
		}

		function onKeydown(e) {
			if (e.key === 'Escape') {
				onClose();
			} else if (e.key === 'ArrowDown') {
				selected = Math.min(results.length - 1, selected + 1);
				e.preventDefault();
			} else if (e.key === 'ArrowUp') {
				selected = Math.max(0, selected - 1);
				e.preventDefault();
			} else if (e.key === 'Enter' && results[selected]) {
				goto(withBase(results[selected].url, base));
				onClose();
			} else if (e.key === 'Tab') {
				// Focus trap: the dialog has a single focusable control (the input).
				// Swallowing Tab keeps focus inside the aria-modal dialog.
				e.preventDefault();
			}
		}

		if (open) {
			$$renderer.push(`<!--[0--><button type="button" class="sp-search-backdrop svelte-ma488q" aria-label="Close search"></button> <div class="sp-search svelte-ma488q" role="dialog" aria-modal="true" aria-label="Search"><input class="sp-search__input svelte-ma488q"${$.attr('placeholder', loading ? 'Loading…' : 'Search posts…')}${$.attr('value', query)}/> `);

			if (results.length) {
				$$renderer.push(`<!--[0--><ul class="sp-search__results svelte-ma488q"><!--[-->`);

				const each_array = $.ensure_array_like(results);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let r = each_array[i];

					$$renderer.push(`<li${$.attr_class('sp-search__item svelte-ma488q', void 0, { 'is-selected': i === selected })}><a${$.attr('href', withBase(r.url, base))} class="svelte-ma488q"><strong class="svelte-ma488q">${$.escape(r.meta?.title ?? r.url)}</strong>  <p class="svelte-ma488q">${$.html(r.excerpt)}</p></a></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else if (loadError && !loading) {
				$$renderer.push(`<!--[1--><p class="sp-search__empty svelte-ma488q">Search unavailable.</p>`);
			} else if (query && !loading) {
				$$renderer.push(`<!--[2--><p class="sp-search__empty svelte-ma488q">No results.</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}