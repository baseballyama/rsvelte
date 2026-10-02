import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let values = ['foo', 'bar', 'baz'];
	let elements = [];
	let nums = [1, 2, 3];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(values);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let value = each_array[i];

		$$renderer.push(`<input${$.attr('value', values[i])}/>`);
	}

	$$renderer.push(`<!--]--> <div>${$.escape(elements.length)}</div>`);
}