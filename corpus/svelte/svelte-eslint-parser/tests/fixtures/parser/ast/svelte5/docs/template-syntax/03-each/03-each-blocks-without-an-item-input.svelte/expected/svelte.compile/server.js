import * as $ from 'svelte/internal/server';

export default function _3_each_blocks_without_an_item_input($$renderer) {
	$$renderer.push(`<div class="chess-board"><!--[-->`);

	const each_array = $.ensure_array_like({ length: 8 });

	for (let rank = 0, $$length = each_array.length; rank < $$length; rank++) {
		$$renderer.push(`<!--[-->`);

		const each_array_1 = $.ensure_array_like({ length: 8 });

		for (let file = 0, $$length = each_array_1.length; file < $$length; file++) {
			$$renderer.push(`<div${$.attr_class('', void 0, { 'black': (rank + file) % 2 === 1 })}></div>`);
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]--></div>`);
}