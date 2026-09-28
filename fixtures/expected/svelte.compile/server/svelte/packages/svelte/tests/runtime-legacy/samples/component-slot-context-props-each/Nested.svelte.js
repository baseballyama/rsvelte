import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	let keys = ['a', 'b'];

	function setKey(key, value) {
		console.log(`setKey(${key}, ${value})`);
	}

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(keys);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let key = each_array[$$index];

		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', { key, set: (value) => setKey(key, value) }, null);
		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}