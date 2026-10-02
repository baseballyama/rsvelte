import * as $ from 'svelte/internal/server';

export default function _1_each_blocks_without_an_item_input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(expression);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		$$renderer.push(`<!---->...`);
	}

	$$renderer.push(`<!--]-->`);
}