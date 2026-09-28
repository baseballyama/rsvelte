import * as $ from 'svelte/internal/server';
import { getAllContexts } from 'svelte';

export default function Leaf($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const context = getAllContexts();

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like([...context.keys()]);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let key = each_array[$$index];

			$$renderer.push(`<div>${$.escape(key)}: ${$.escape(context.get(key))}</div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}