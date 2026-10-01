import * as $ from 'svelte/internal/server';

export default function Each_handlers($$renderer) {
	let items = ['one', 'two', 'three'];
	let picked = '';

	function remove(item) {
		items = items.filter((i) => i !== item);
	}

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let item = each_array[i];

		$$renderer.push(`<button>${$.escape(item)}</button> <button>remove ${$.escape(i)}</button>`);
	}

	$$renderer.push(`<!--]--> <p>picked: ${$.escape(picked)}</p>`);
}