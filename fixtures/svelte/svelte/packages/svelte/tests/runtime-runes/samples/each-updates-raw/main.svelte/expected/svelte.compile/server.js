import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let raw_items = [
		{ id: 0, text: 'a' },
		{ id: 1, text: 'b' },
		{ id: 2, text: 'c' }
	];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(raw_items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(console.log(item.text))}
	${$.escape(item.text)}`);
	}

	$$renderer.push(`<!--]--> <button></button>`);
}