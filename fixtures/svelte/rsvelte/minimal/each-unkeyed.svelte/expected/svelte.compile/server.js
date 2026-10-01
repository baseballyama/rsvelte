import * as $ from 'svelte/internal/server';

export default function Each_unkeyed($$renderer) {
	let names = ['Ada', 'Grace', 'Barbara'];

	$$renderer.push(`<ul><!--[-->`);

	const each_array = $.ensure_array_like(names);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let name = each_array[$$index];

		$$renderer.push(`<li>${$.escape(name)}</li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}