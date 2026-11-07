import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	$$renderer.push(`<h1>Shopping list</h1> <ul><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<li>${$.escape(item.name)} x ${$.escape(item.qty)}</li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}