import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let data = { a: { value: '' } };

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(Object.values(data));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let object = each_array[$$index];

		$$renderer.push(`<input type="text"${$.attr('value', object.value)}/>`);
	}

	$$renderer.push(`<!--]-->`);
}