import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {HTMLDivElement} */
		let elem;

		onMount(() => {
			const shadow = elem.attachShadow({ mode: 'open' });
			const anchor = document.createElement('a');

			anchor.href = '/routing/a';
			anchor.innerHTML = '<slot>';
			shadow.appendChild(anchor);
		});

		$$renderer.push(`<div><div id="clickme">Hello world</div></div>`);
	});
}