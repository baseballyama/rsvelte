import * as $ from 'svelte/internal/server';

import { toDisplayString } from 'vue';

export default function Number_input_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function renderable(value) {
			return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
		}
		let n = 1;
		$$renderer.push(`<input type="number"${$.attr('value', renderable(n))}/><p>${$.escape(toDisplayString(typeof n))}: ${$.escape(toDisplayString(n))} + 1 = ${$.escape(toDisplayString(n + 1))}</p>`);
	});
}
