import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(foo);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let bar = each_array[$$index];

		$$renderer.push(`<span>${$.escape(bar)}</span>`);
	}

	$$renderer.push(`<!--]-->`);
}