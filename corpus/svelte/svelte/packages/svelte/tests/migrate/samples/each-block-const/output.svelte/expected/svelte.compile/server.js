import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	const { foo } = x();

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(foo);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let f = each_array[$$index];
	}

	$$renderer.push(`<!--]-->`);
}