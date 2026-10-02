import * as $ from 'svelte/internal/server';

import { toDisplayString } from 'vue';

export default function Text_input_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function renderable(value_1) {
			return typeof value_1 === 'string' || typeof value_1 === 'number' || typeof value_1 === 'boolean' ? value_1 : undefined;
		}
		let name = 'world';
		let shout = $.derived(() => name.toUpperCase());
		$$renderer.push(`<label>Name <input class="name"${$.attr('value', renderable(name))}/></label><p class="greeting">Hello, ${$.escape(toDisplayString(name))}!</p><p class="shout">${$.escape(toDisplayString(shout()))} (${$.escape(toDisplayString(name.length))})</p>`);
	});
}
