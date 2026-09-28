import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let array = [{ value: 'a' }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(array);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let obj = each_array[$$index];

		$$renderer.push(`<input${$.attr('value', (() => obj.value)())}/> <p>${$.escape(obj.value)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}