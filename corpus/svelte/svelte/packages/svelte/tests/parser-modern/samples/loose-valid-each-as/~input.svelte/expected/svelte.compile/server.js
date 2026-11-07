import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let arr = [];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(arr);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let [key, value = 'default'] = each_array[$$index];

		$$renderer.push(`<div>${$.escape(key)}: ${$.escape(value)}</div>`);
	}

	$$renderer.push(`<!--]-->`);
}