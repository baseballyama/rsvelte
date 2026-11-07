import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let items = [];

	$$renderer.push(`<button>Add</button> <!--[-->`);

	const each_array = $.ensure_array_like(items.sort());

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<p>${$.escape(item)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}