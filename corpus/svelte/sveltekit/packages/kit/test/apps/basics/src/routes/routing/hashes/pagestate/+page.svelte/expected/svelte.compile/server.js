import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {string} */
		let hash;

		onMount(set_hash);

		function set_hash() {
			hash = window.location.hash;
		}

		$$renderer.push(`<h1 id="window-hash">${$.escape(hash)}</h1> <h1 id="page-url-hash">${$.escape(page.url.hash)}</h1> <a href="#target">Nav to hash</a> <a href="/routing/hashes/pagestate">Nav to page</a> <div id="target">Target</div>`);
	});
}