import * as $ from 'svelte/internal/server';
import Inspect from 'svelte-inspect-value';

export default function MinimalExampleValues($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let number = 1;
		let isEven = $.derived(() => number % 2 === 0);
		let doubled = $.derived(() => number * 2);

		const Ins = Inspect.Values.withOptions(() => ({
			expandLevel: 0,
			elementAttributes: { style: 'max-width: 500px', class: 'not-content mt' }
		}));

		$$renderer.push(`<div class="svelte-qov40i"><input type="number"${$.attr('value', number)} class="svelte-qov40i"/> `);
		Ins($$renderer, { number, isEven: isEven(), doubled: doubled() });
		$$renderer.push(`<!----></div>`);
	});
}