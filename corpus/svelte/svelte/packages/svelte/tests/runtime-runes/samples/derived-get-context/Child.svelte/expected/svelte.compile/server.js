import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let total = $.derived(() => multiply(count));

		function multiply(num) {
			const context = getContext("key");

			return num * context;
		}

		$$renderer.push(`<button>${$.escape(total())}</button>`);
	});
}