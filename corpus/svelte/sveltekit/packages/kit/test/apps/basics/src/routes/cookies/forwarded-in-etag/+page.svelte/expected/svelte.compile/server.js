import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {string} */
		let cookies;

		onMount(() => {
			cookies = document.cookie;
		});

		$$renderer.push(`<button>Delete cookies and reload the page</button> <p>${$.escape(cookies)}</p>`);
	});
}