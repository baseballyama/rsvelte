import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	let keys = ['a', 'b'];
	let items = ['c', 'd'];

	function setKey(key, value, item) {
		console.log(`setKey(${key}, ${value}, ${item})`);
	}

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let item = each_array[$$index_1];

		$$renderer.push(`<!--[-->`);

		const each_array_1 = $.ensure_array_like(keys);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let key = each_array_1[$$index];

			$$renderer.push(`<!--[-->`);
			$.slot($$renderer, $$props, 'default', { key, item, set: (value) => setKey(key, value, item) }, null);
			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}