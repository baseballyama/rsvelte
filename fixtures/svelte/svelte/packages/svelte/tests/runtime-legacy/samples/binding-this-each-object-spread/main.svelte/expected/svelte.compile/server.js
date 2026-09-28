import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	const items1 = {};
	const items2 = {};
	let data = [{ id: 1, text: "a" }, { id: 2, text: "b" }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(data);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { id, text } = each_array[$$index];

		$$renderer.push(`<div>${$.escape(text)}</div> <div>${$.escape(text)}</div>`);
	}

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { items1, items2 });
}