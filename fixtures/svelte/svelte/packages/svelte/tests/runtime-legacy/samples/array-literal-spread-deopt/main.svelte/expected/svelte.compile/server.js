import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const foo = ['a', 'b', 'c'];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like([...foo]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<div>${$.escape(item)}</div>`);
	}

	$$renderer.push(`<!--]-->`);
}