import * as $ from 'svelte/internal/server';

export default function Each_keyed_index($$renderer) {
	let rows = [{ id: 'a' }, { id: 'b' }];
	$$renderer.push(`<div><!--[-->`);
	const each_array = $.ensure_array_like(rows);
	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let row = each_array[index];
		$$renderer.push(`<span>${$.escape(index)}: ${$.escape(row.id)}</span>`);
	}
	$$renderer.push(`<!--]--></div> <p>after</p>`);
}
