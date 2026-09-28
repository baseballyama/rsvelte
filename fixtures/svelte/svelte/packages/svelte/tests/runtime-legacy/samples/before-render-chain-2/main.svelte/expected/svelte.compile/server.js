import * as $ from 'svelte/internal/server';
import Item from './Item.svelte';

export default function Main($$renderer) {
	var items = Array(1000);

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		Item($$renderer, {});
	}

	$$renderer.push(`<!--]-->`);
}