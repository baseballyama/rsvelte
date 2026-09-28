import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let multiplier = 1;
		let result = $.derived(() => count * untrack(() => multiplier));

		$$renderer.push(`<button>multiplier: ${$.escape(multiplier)}</button> <button>result: ${$.escape(result())}</button>`);
	});
}