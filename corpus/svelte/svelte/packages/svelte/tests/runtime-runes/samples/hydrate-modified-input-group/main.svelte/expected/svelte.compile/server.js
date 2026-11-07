import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 1;

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like([1, 2, 3]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let number = each_array[$$index];

		$$renderer.push(`<input type="radio" name="foo"${$.attr('value', number)}${$.attr('checked', value === number, true)}/>`);
	}

	$$renderer.push(`<!--]--> ${$.escape(value)}`);
}