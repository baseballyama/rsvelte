import * as $ from 'svelte/internal/server';
import Item from './item.svelte';

export default function Main($$renderer) {
	let items = [{ name: 'a' }, { name: 'b' }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		Item($$renderer, { item, items, onclick: () => item.name = item.name + '+' });
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(items);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let item = each_array_1[$$index_1];

		Item($$renderer, { item, items, onclick: () => item.name = item.name + '+' });
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_2 = $.ensure_array_like(items);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let item = each_array_2[$$index_2];

		Item($$renderer, { item, items, onclick: () => item.name = item.name + '+' });
	}

	$$renderer.push(`<!--]-->`);
}