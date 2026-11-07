import * as $ from 'svelte/internal/server';

export default function _3_input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let item = each_array[i];

		$$renderer.push(`<li>${$.escape(i + 1)}: ${$.escape(item.name)} x ${$.escape(item.qty)}</li>`);
	}

	$$renderer.push(`<!--]-->`);
}