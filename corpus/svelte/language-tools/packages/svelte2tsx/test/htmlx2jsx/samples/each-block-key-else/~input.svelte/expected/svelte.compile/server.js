import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const each_array = $.ensure_array_like(items);

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			$$renderer.push(`<div>${$.escape(item)}${$.escape(i)}</div>`);
		}
	} else {
		$$renderer.push(`<!--[!--><div>No Items</div>`);
	}

	$$renderer.push(`<!--]-->`);
}