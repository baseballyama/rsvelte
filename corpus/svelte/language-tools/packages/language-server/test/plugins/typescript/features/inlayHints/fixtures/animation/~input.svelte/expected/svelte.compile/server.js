import * as $ from 'svelte/internal/server';
import { flip } from 'svelte/animate';

export default function Input($$renderer) {
	let items = [{ id: 1 }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<div></div>`);
	}

	$$renderer.push(`<!--]-->`);
}