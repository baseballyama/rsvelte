import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';

export default function MinimalExampleValues($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let number = 1;
		let isEven = $.derived(() => number % 2 === 0);
		let doubled = $.derived(() => number * 2);

		const Ins = Inspect.Values.withOptions(() => ({
			expandLevel: 0,
			elementAttributes: { style: 'max-width: 500px' }
		}));

		$$renderer.push(`<div class="flex col"><input type="number"${$.attr('value', number)}/> `);
		Ins($$renderer, { number, isEven: isEven(), doubled: doubled() });
		$$renderer.push(`<!----></div>`);
	});
}