import * as $ from 'svelte/internal/server';
import { addToPanel } from '$lib/index.js';
import deepNest from '../deep-nest.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import { onDestroy } from 'svelte'
		addToPanel('nested', () => deepNest);

		let remove;

		function add() {
			remove = addToPanel('nesteda', () => ({ ...deepNest }));
		}

		$$renderer.push(`<h2>Global Inspect</h2> <button>add</button> <button>remove</button>`);
		// onDestroy(() => {
		//   remove?.()
		// })
	});
}